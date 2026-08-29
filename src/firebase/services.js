import { ref, onValue, set, remove } from 'firebase/database';
import { db, isFirebaseConfigured } from './config';
import { INITIAL_TABLES } from '../data/initialTables';
import { MENU_ITEMS } from '../data/menuData';

// 1. Real-time Listener for Orders
export const subscribeOrders = (onUpdate) => {
  if (!isFirebaseConfigured() || !db) return () => {};

  try {
    const ordersRef = ref(db, 'hotel_orders');
    return onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        onUpdate([]);
        return;
      }
      const ordersList = Object.keys(data).map((key) => ({
        ...data[key],
        orderId: key
      })).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

      onUpdate(ordersList);
    }, (error) => {
      console.warn('Realtime Database orders listener error:', error);
    });
  } catch (err) {
    console.warn('Failed to subscribe to Realtime Database orders:', err);
    return () => {};
  }
};

// 2. Real-time Listener for Tables (Auto-seeds if database is empty/null)
export const subscribeTables = (onUpdate) => {
  if (!isFirebaseConfigured() || !db) return () => {};

  try {
    const tablesRef = ref(db, 'hotel_tables');
    return onValue(tablesRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        // Auto seed tables to Firebase if database is empty (null)
        initializeFirebaseData(INITIAL_TABLES, MENU_ITEMS);
        return;
      }
      const tablesList = Object.keys(data).map((key) => ({
        ...data[key],
        id: Number(key)
      })).sort((a, b) => a.tableNumber - b.tableNumber);

      onUpdate(tablesList);
    }, (error) => {
      console.warn('Realtime Database tables listener error:', error);
    });
  } catch (err) {
    console.warn('Failed to subscribe to Realtime Database tables:', err);
    return () => {};
  }
};

// 3. Real-time Listener for Menu Items (Auto-seeds if database is empty/null)
export const subscribeMenuItems = (onUpdate) => {
  if (!isFirebaseConfigured() || !db) return () => {};

  try {
    const menuRef = ref(db, 'hotel_menu_items');
    return onValue(menuRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        initializeFirebaseData(INITIAL_TABLES, MENU_ITEMS);
        return;
      }
      const menuList = Object.keys(data).map((key) => ({
        ...data[key],
        id: key
      }));
      onUpdate(menuList);
    }, (error) => {
      console.warn('Realtime Database menu listener error:', error);
    });
  } catch (err) {
    console.warn('Failed to subscribe to Realtime Database menu:', err);
    return () => {};
  }
};

// 4. Sync Order to Realtime Database
export const syncOrderToFirebase = async (orderData) => {
  if (!isFirebaseConfigured() || !db) return;

  try {
    const orderRef = ref(db, `hotel_orders/${orderData.orderId}`);
    await set(orderRef, orderData);
  } catch (error) {
    console.error('Error syncing order to Realtime Database:', error);
  }
};

// 5. Sync Table Status to Realtime Database
export const syncTableToFirebase = async (tableNumber, status, currentOrderId = null) => {
  if (!isFirebaseConfigured() || !db) return;

  try {
    const tableRef = ref(db, `hotel_tables/${tableNumber}`);
    await set(tableRef, {
      id: Number(tableNumber),
      tableNumber: Number(tableNumber),
      status,
      currentOrderId
    });
  } catch (error) {
    console.error('Error syncing table to Realtime Database:', error);
  }
};

// 6. Sync Menu Item to Realtime Database
export const syncMenuItemToFirebase = async (itemData) => {
  if (!isFirebaseConfigured() || !db) return;

  try {
    const itemRef = ref(db, `hotel_menu_items/${itemData.id}`);
    await set(itemRef, itemData);
  } catch (error) {
    console.error('Error syncing menu item to Realtime Database:', error);
  }
};

// 7. Delete Menu Item from Realtime Database
export const deleteMenuItemFromFirebase = async (itemId) => {
  if (!isFirebaseConfigured() || !db) return;

  try {
    const itemRef = ref(db, `hotel_menu_items/${itemId}`);
    await remove(itemRef);
  } catch (error) {
    console.error('Error deleting menu item from Realtime Database:', error);
  }
};

// 8. Bulk Initialize Tables & Seed Menu to Firebase
export const initializeFirebaseData = async (initialTables, initialMenuItems) => {
  if (!isFirebaseConfigured() || !db) return;

  try {
    if (initialTables && initialTables.length) {
      for (const tbl of initialTables) {
        await syncTableToFirebase(tbl.tableNumber, tbl.status, tbl.currentOrderId);
      }
    }
    if (initialMenuItems && initialMenuItems.length) {
      for (const item of initialMenuItems) {
        await syncMenuItemToFirebase(item);
      }
    }
    console.log('✅ Realtime Database successfully seeded with tables and menu catalog!');
  } catch (error) {
    console.error('Error initializing Realtime Database data:', error);
  }
};
