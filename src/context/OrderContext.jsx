import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_TABLES } from '../data/initialTables';
import { MENU_ITEMS } from '../data/menuData';
import { useNotification } from './NotificationContext';

const OrderContext = createContext();

// Sample initial order so system has demo data out of the box
const INITIAL_DEMO_ORDERS = [
  {
    orderId: "ORD-1001",
    tableNumber: 4,
    waiterId: "w1",
    waiterName: "Rahul Sharma",
    items: [
      { id: "m5", name: "Paneer Butter Masala", quantity: 2, price: 310 },
      { id: "m10", name: "Butter Naan", quantity: 4, price: 50 },
      { id: "m14", name: "Sweet Lassi", quantity: 2, price: 90 }
    ],
    subtotal: 1000,
    tax: 50,
    discount: 0,
    total: 1050,
    notes: "Extra butter on naan",
    status: "done", // moves to payment pending for owner
    paymentStatus: "pending",
    paymentMethod: null,
    createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 60000).toISOString()
  },
  {
    orderId: "ORD-1002",
    tableNumber: 8,
    waiterId: "w1",
    waiterName: "Rahul Sharma",
    items: [
      { id: "m1", name: "Paneer Tikka", quantity: 2, price: 280 },
      { id: "m7", name: "Veg Hyderabadi Biryani", quantity: 1, price: 290 },
      { id: "m11", name: "Garlic Naan", quantity: 3, price: 65 }
    ],
    subtotal: 915,
    tax: 45.75,
    discount: 0,
    total: 960.75,
    notes: "Medium spice level",
    status: "waiting", // chef waiting/preparing
    paymentStatus: "pending",
    paymentMethod: null,
    createdAt: new Date(Date.now() - 12 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 60000).toISOString()
  }
];

export const OrderProvider = ({ children }) => {
  const { addNotification } = useNotification();

  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('hotel_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [tables, setTables] = useState(() => {
    const saved = localStorage.getItem('hotel_tables');
    if (saved) return JSON.parse(saved);

    // All tables default to 'Available' (empty)
    return [...INITIAL_TABLES];
  });

  const [menuItems, setMenuItems] = useState(() => {
    const saved = localStorage.getItem('hotel_menu_items');
    return saved ? JSON.parse(saved) : MENU_ITEMS;
  });

  // Sync state to localStorage whenever orders, tables, or menuItems change
  useEffect(() => {
    localStorage.setItem('hotel_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('hotel_tables', JSON.stringify(tables));
  }, [tables]);

  useEffect(() => {
    localStorage.setItem('hotel_menu_items', JSON.stringify(menuItems));
  }, [menuItems]);

  // Real-time broadcast channel & storage listener setup
  useEffect(() => {
    let broadcastChannel;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      broadcastChannel = new BroadcastChannel('hotel_management_sync');
      broadcastChannel.onmessage = (event) => {
        const { type, data } = event.data;
        if (type === 'SYNC_STATE') {
          const freshOrders = JSON.parse(localStorage.getItem('hotel_orders') || '[]');
          const freshTables = JSON.parse(localStorage.getItem('hotel_tables') || '[]');
          const freshMenu = JSON.parse(localStorage.getItem('hotel_menu_items') || '[]');
          setOrders(freshOrders);
          setTables(freshTables);
          if (freshMenu.length) setMenuItems(freshMenu);

          // Handle specific notifications on event broadcast
          if (data?.notification) {
            addNotification(data.notification);
          }
        }
      };
    }

    const handleStorageEvent = (e) => {
      if (e.key === 'hotel_orders' && e.newValue) {
        setOrders(JSON.parse(e.newValue));
      }
      if (e.key === 'hotel_tables' && e.newValue) {
        setTables(JSON.parse(e.newValue));
      }
      if (e.key === 'hotel_menu_items' && e.newValue) {
        setMenuItems(JSON.parse(e.newValue));
      }
    };

    window.addEventListener('storage', handleStorageEvent);

    return () => {
      window.removeEventListener('storage', handleStorageEvent);
      if (broadcastChannel) broadcastChannel.close();
    };
  }, []);

  const broadcastSync = (notificationPayload = null) => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel('hotel_management_sync');
      channel.postMessage({ type: 'SYNC_STATE', data: { notification: notificationPayload } });
      channel.close();
    }
  };

  // 1. Waiter Places Order (Merges automatically if table already has an active order)
  const createOrder = ({ tableNumber, waiterId, waiterName, items, notes }) => {
    const tNum = Number(tableNumber);
    const existingActiveOrder = orders.find(
      (o) => o.tableNumber === tNum && o.status !== 'paid'
    );

    if (existingActiveOrder) {
      // MERGE NEW ITEMS INTO EXISTING ACTIVE TABLE ORDER
      const mergedItems = [...existingActiveOrder.items];
      items.forEach((newItem) => {
        const existingIdx = mergedItems.findIndex((i) => i.id === newItem.id);
        if (existingIdx > -1) {
          mergedItems[existingIdx] = {
            ...mergedItems[existingIdx],
            quantity: mergedItems[existingIdx].quantity + newItem.quantity
          };
        } else {
          mergedItems.push({ ...newItem });
        }
      });

      const subtotal = Math.round(mergedItems.reduce((acc, curr) => acc + curr.price * curr.quantity, 0) * 100) / 100;
      const tax = Math.round(subtotal * 0.05 * 100) / 100;
      const total = subtotal + tax;

      const updatedNotes = notes
        ? existingActiveOrder.notes
          ? `${existingActiveOrder.notes} | Add-on: ${notes}`
          : notes
        : existingActiveOrder.notes;

      const updatedOrder = {
        ...existingActiveOrder,
        items: mergedItems,
        subtotal,
        tax,
        total,
        notes: updatedNotes,
        status: 'new', // Reset status to new so Chef is alerted to prepare additional items
        updatedAt: new Date().toISOString()
      };

      const updatedOrders = orders.map((o) =>
        o.orderId === existingActiveOrder.orderId ? updatedOrder : o
      );

      setOrders(updatedOrders);

      // Update Table status
      const updatedTables = tables.map((t) => {
        if (t.tableNumber === tNum) {
          return { ...t, status: 'Occupied', currentOrderId: existingActiveOrder.orderId };
        }
        return t;
      });
      setTables(updatedTables);

      localStorage.setItem('hotel_orders', JSON.stringify(updatedOrders));
      localStorage.setItem('hotel_tables', JSON.stringify(updatedTables));

      const notificationPayload = {
        title: "🔔 Items Added to Table Order!",
        message: `Table ${tNum} added new items to Order #${existingActiveOrder.orderId}`,
        type: "warning",
        targetRoles: ["chef", "owner"]
      };

      addNotification(notificationPayload);
      broadcastSync(notificationPayload);

      return existingActiveOrder.orderId;
    }

    // CREATE NEW ORDER FOR TABLE IF NONE ACTIVE
    const nextIdNumber = 1025 + orders.length;
    const orderId = `ORD-${nextIdNumber}`;
    
    const subtotal = items.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
    const tax = Math.round(subtotal * 0.05 * 100) / 100;
    const total = subtotal + tax;

    const newOrder = {
      orderId,
      tableNumber: tNum,
      waiterId,
      waiterName,
      items,
      subtotal,
      tax,
      discount: 0,
      total,
      notes,
      status: 'new', // New -> sent to Chef
      paymentStatus: 'pending',
      paymentMethod: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);

    // Update Table status to 'Occupied'
    const updatedTables = tables.map((t) => {
      if (t.tableNumber === tNum) {
        return { ...t, status: 'Occupied', currentOrderId: orderId };
      }
      return t;
    });
    setTables(updatedTables);

    localStorage.setItem('hotel_orders', JSON.stringify(updatedOrders));
    localStorage.setItem('hotel_tables', JSON.stringify(updatedTables));

    const notificationPayload = {
      title: "🔔 New Order Received!",
      message: `Table ${tableNumber} placed Order #${orderId} (${items.length} items)`,
      type: "warning",
      targetRoles: ["chef", "owner"]
    };

    addNotification(notificationPayload);
    broadcastSync(notificationPayload);

    return orderId;
  };

  // 2. Chef Updates Status ("waiting" or "done")
  const updateChefOrderStatus = (orderId, newStatus) => {
    const targetOrder = orders.find(o => o.orderId === orderId);
    if (!targetOrder) return;

    let tableStatus = 'Occupied';
    if (newStatus === 'waiting') {
      tableStatus = 'Order Preparing';
    } else if (newStatus === 'done') {
      tableStatus = 'Payment Pending';
    }

    const updatedOrders = orders.map((o) => {
      if (o.orderId === orderId) {
        return {
          ...o,
          status: newStatus,
          updatedAt: new Date().toISOString()
        };
      }
      return o;
    });

    setOrders(updatedOrders);

    const updatedTables = tables.map((t) => {
      if (t.tableNumber === targetOrder.tableNumber) {
        return { ...t, status: tableStatus };
      }
      return t;
    });
    setTables(updatedTables);

    localStorage.setItem('hotel_orders', JSON.stringify(updatedOrders));
    localStorage.setItem('hotel_tables', JSON.stringify(updatedTables));

    let notificationPayload = null;
    if (newStatus === 'done') {
      notificationPayload = {
        title: "💳 Payment Pending",
        message: `Order #${orderId} for Table ${targetOrder.tableNumber} is ready. Payment required (₹${targetOrder.total.toFixed(2)}).`,
        type: "success",
        targetRoles: ["owner"]
      };
      addNotification(notificationPayload);
    }

    broadcastSync(notificationPayload);
  };

  // 3. Owner Processes Payment (Closes all unpaid orders for the table)
  const processPayment = (orderId, paymentMethod, discountAmount = 0) => {
    const targetOrder = orders.find(o => o.orderId === orderId);
    if (!targetOrder) return;

    const tNum = targetOrder.tableNumber;
    const finalDiscount = Number(discountAmount) || 0;

    // Process payment for all unpaid orders matching this table number
    const updatedOrders = orders.map((o) => {
      if (o.tableNumber === tNum && o.status !== 'paid') {
        const itemDiscount = o.orderId === orderId ? finalDiscount : 0;
        const finalTotal = Math.max(0, o.subtotal + o.tax - itemDiscount);
        return {
          ...o,
          discount: itemDiscount,
          total: finalTotal,
          status: 'paid',
          paymentStatus: 'paid',
          paymentMethod: paymentMethod,
          updatedAt: new Date().toISOString()
        };
      }
      return o;
    });

    setOrders(updatedOrders);

    // Mark Table as 'Available'
    const updatedTables = tables.map((t) => {
      if (t.tableNumber === tNum) {
        return { ...t, status: 'Available', currentOrderId: null };
      }
      return t;
    });
    setTables(updatedTables);

    localStorage.setItem('hotel_orders', JSON.stringify(updatedOrders));
    localStorage.setItem('hotel_tables', JSON.stringify(updatedTables));

    const notificationPayload = {
      title: "✓ Payment Successful",
      message: `Payment for Table ${tNum} (Order #${orderId}) completed via ${paymentMethod.toUpperCase()}.`,
      type: "info",
      targetRoles: ["owner", "waiter"]
    };

    addNotification(notificationPayload);
    broadcastSync(notificationPayload);
  };

  // Add new food item to menu catalog dynamically
  const addNewMenuItem = (newItem) => {
    const createdItem = {
      id: `m_${Date.now()}`,
      isVeg: true,
      category: 'Main Course',
      price: 200,
      description: 'Freshly prepared specialty dish.',
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
      ...newItem
    };

    const updatedMenu = [createdItem, ...menuItems];
    setMenuItems(updatedMenu);
    localStorage.setItem('hotel_menu_items', JSON.stringify(updatedMenu));

    const notificationPayload = {
      title: "✨ New Dish Added to Menu",
      message: `${createdItem.name} (₹${createdItem.price}) has been added to ${createdItem.category}.`,
      type: "success",
      targetRoles: ["waiter", "chef", "owner"]
    };

    addNotification(notificationPayload);
    broadcastSync(notificationPayload);
    return createdItem;
  };

  // Update existing food item in menu catalog
  const updateMenuItem = (itemId, updatedData) => {
    const updatedMenu = menuItems.map((item) =>
      item.id === itemId ? { ...item, ...updatedData } : item
    );
    setMenuItems(updatedMenu);
    localStorage.setItem('hotel_menu_items', JSON.stringify(updatedMenu));

    const notificationPayload = {
      title: "✏️ Dish Updated",
      message: `${updatedData.name || 'Dish'} updated in menu catalog.`,
      type: "info",
      targetRoles: ["waiter", "chef", "owner"]
    };

    addNotification(notificationPayload);
    broadcastSync(notificationPayload);
  };

  // Delete food item from menu catalog
  const deleteMenuItem = (itemId) => {
    const targetItem = menuItems.find((i) => i.id === itemId);
    const updatedMenu = menuItems.filter((i) => i.id !== itemId);
    setMenuItems(updatedMenu);
    localStorage.setItem('hotel_menu_items', JSON.stringify(updatedMenu));

    const notificationPayload = {
      title: "🗑️ Dish Removed",
      message: `${targetItem?.name || 'Dish'} removed from menu catalog.`,
      type: "warning",
      targetRoles: ["waiter", "chef", "owner"]
    };

    addNotification(notificationPayload);
    broadcastSync(notificationPayload);
  };

  // Reset all tables and orders to default clean state
  const resetAllTables = () => {
    setOrders([]);
    setTables(INITIAL_TABLES);
    localStorage.removeItem('hotel_orders');
    localStorage.setItem('hotel_tables', JSON.stringify(INITIAL_TABLES));
    broadcastSync();
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        tables,
        menuItems,
        createOrder,
        updateChefOrderStatus,
        processPayment,
        addNewMenuItem,
        updateMenuItem,
        deleteMenuItem,
        resetAllTables
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => useContext(OrderContext);
