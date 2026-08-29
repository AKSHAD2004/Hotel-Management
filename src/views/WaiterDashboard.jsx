import React, { useState } from 'react';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getLocalizedDish } from '../utils/menuTranslations';
import {
  Utensils,
  Plus,
  Minus,
  Trash2,
  Send,
  CheckCircle,
  Clock,
  Search,
  MessageSquare,
  AlertCircle,
  Image as ImageIcon,
  Upload,
  X,
  Sparkles,
  Edit3,
  ArrowRight,
  RotateCcw
} from 'lucide-react';

export const WaiterDashboard = () => {
  const { tables, orders, menuItems, createOrder, addNewMenuItem, updateMenuItem, deleteMenuItem, updateExistingOrder, resetAllTables } = useOrders();
  const { user } = useAuth();
  const { language, t } = useLanguage();

  const [selectedTable, setSelectedTable] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [specialNotes, setSpecialNotes] = useState('');
  const [activeTab, setActiveTab] = useState('create'); // 'create' | 'active_orders'
  const [orderSuccessMsg, setOrderSuccessMsg] = useState(null);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

  // Active Order Edit Modal State
  const [editingActiveOrder, setEditingActiveOrder] = useState(null);
  const [editOrderItems, setEditOrderItems] = useState([]);
  const [editOrderNotes, setEditOrderNotes] = useState('');

  const getTableStatusLabel = (status) => {
    switch (status) {
      case 'Available':
        return t('tableStatusFree') || 'Free';
      case 'Occupied':
        return t('tableStatusOccupied') || 'Occupied';
      case 'Order Preparing':
        return t('tableStatusKitchen') || 'Kitchen';
      case 'Payment Pending':
        return t('tableStatusBillDue') || 'Bill Due';
      default:
        return status;
    }
  };

  // Active Order Editing Helpers
  const handleOpenEditActiveOrder = (ord) => {
    if (ord.status !== 'new') return;
    setEditingActiveOrder(ord);
    setEditOrderItems(ord.items.map((i) => ({ ...i })));
    setEditOrderNotes(ord.notes || '');
  };

  const handleUpdateEditItemQty = (itemId, delta) => {
    setEditOrderItems((prev) =>
      prev
        .map((it) => {
          if (it.id === itemId) {
            const newQty = it.quantity + delta;
            return newQty > 0 ? { ...it, quantity: newQty } : null;
          }
          return it;
        })
        .filter(Boolean)
    );
  };

  const handleRemoveEditItem = (itemId) => {
    setEditOrderItems((prev) => prev.filter((it) => it.id !== itemId));
  };

  const handleAddItemToEditOrder = (item) => {
    setEditOrderItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1 }];
    });
  };

  const handleSaveEditActiveOrder = (e) => {
    e.preventDefault();
    if (!editingActiveOrder || editOrderItems.length === 0) return;

    updateExistingOrder({
      orderId: editingActiveOrder.orderId,
      items: editOrderItems,
      notes: editOrderNotes
    });

    setOrderSuccessMsg(`Order #${editingActiveOrder.orderId} (Table ${editingActiveOrder.tableNumber}) updated successfully!`);
    setEditingActiveOrder(null);
    setEditOrderItems([]);
    setEditOrderNotes('');

    setTimeout(() => {
      setOrderSuccessMsg(null);
    }, 4000);
  };

  // Modal State for Adding / Editing Item
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // null if adding new, or item object if editing
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Starters');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');
  const [newItemImageUrl, setNewItemImageUrl] = useState('');
  const [newItemImagePreview, setNewItemImagePreview] = useState('');
  const [newItemIsVeg, setNewItemIsVeg] = useState(true);

  // Handle local file selection for dish image
  const handleImageFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewItemImagePreview(reader.result);
        setNewItemImageUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setNewItemName('');
    setNewItemCategory('Starters');
    setNewItemPrice('');
    setNewItemDescription('');
    setNewItemImageUrl('');
    setNewItemImagePreview('');
    setNewItemIsVeg(true);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setNewItemName(item.name);
    setNewItemCategory(item.category);
    setNewItemPrice(item.price.toString());
    setNewItemDescription(item.description || '');
    setNewItemImageUrl(item.image || '');
    setNewItemImagePreview(item.image || '');
    setNewItemIsVeg(item.isVeg !== false);
    setIsAddModalOpen(true);
  };

  const handleSaveNewItem = (e) => {
    e.preventDefault();
    if (!newItemName.trim() || !newItemPrice) return;

    const finalImage = newItemImagePreview || newItemImageUrl || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80';

    if (editingItem) {
      // Edit existing dish
      updateMenuItem(editingItem.id, {
        name: newItemName.trim(),
        category: newItemCategory,
        price: Number(newItemPrice),
        description: newItemDescription.trim() || 'Delicious freshly prepared specialty dish.',
        image: finalImage,
        isVeg: newItemIsVeg
      });
    } else {
      // Add new dish
      addNewMenuItem({
        name: newItemName.trim(),
        category: newItemCategory,
        price: Number(newItemPrice),
        description: newItemDescription.trim() || 'Delicious freshly prepared specialty dish.',
        image: finalImage,
        isVeg: newItemIsVeg,
        addedBy: user?.name || 'Waiter'
      });
    }

    // Reset Form
    setNewItemName('');
    setNewItemPrice('');
    setNewItemDescription('');
    setNewItemImageUrl('');
    setNewItemImagePreview('');
    setEditingItem(null);
    setIsAddModalOpen(false);
  };

  const handleDeleteDish = (itemId) => {
    deleteMenuItem(itemId);
    setIsAddModalOpen(false);
    setEditingItem(null);
  };

  // Filter dynamic menu items by category and search
  const filteredMenuItems = (menuItems || []).filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Cart operations
  const handleAddToCart = (item) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (itemId, delta) => {
    setCartItems((prev) => {
      return prev
        .map((item) => {
          if (item.id === itemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  const handleRemoveFromCart = (itemId) => {
    setCartItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  // Cart totals
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Math.round(subtotal * 0.05 * 100) / 100;
  const grandTotal = subtotal + tax;

  // Submit order
  const handlePlaceOrder = () => {
    if (!selectedTable || cartItems.length === 0) {
      return;
    }

    const orderId = createOrder({
      tableNumber: selectedTable,
      waiterId: user?.id || 'w1',
      waiterName: user?.name || 'Waiter',
      items: cartItems,
      notes: specialNotes
    });

    setOrderSuccessMsg(`Order #${orderId} for Table ${selectedTable} placed successfully!`);
    setCartItems([]);
    setSpecialNotes('');
    setIsMobileCartOpen(false);

    setTimeout(() => {
      setOrderSuccessMsg(null);
    }, 4000);
  };

  // Waiter's active orders
  const waiterActiveOrders = orders.filter((o) => o.status !== 'paid');

  return (
    <div className="space-y-6">
      {/* Top Header & Tab Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{t('waiter')} {t('dashboard')}</h2>
          <p className="text-xs text-slate-500 mt-0.5">Select table, build order items, and dispatch to kitchen</p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'create'
                ? 'bg-white text-sky-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>{t('newOrder')}</span>
          </button>
          <button
            onClick={() => setActiveTab('active_orders')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'active_orders'
                ? 'bg-white text-sky-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{t('activeOrders')} ({waiterActiveOrders.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'create' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Columns: Table Selection & Menu Catalog */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Table Selection Bar */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-sky-600" />
                  <h3 className="text-sm font-bold text-slate-800">{t('selectTable')}</h3>
                  <span className="text-xs font-semibold text-slate-500 ml-2">
                    {t('tableSelected')}: <span className="text-sky-700 font-bold text-sm">Table {selectedTable}</span>
                  </span>
                </div>

                {/* Reset Tables Option */}
                <button
                  type="button"
                  onClick={() => resetAllTables()}
                  className="self-start sm:self-auto text-[11px] font-bold text-slate-500 hover:text-rose-600 flex items-center gap-1 transition-colors"
                  title={t('resetTables')}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t('resetTables')}</span>
                </button>
              </div>

              {/* Table Grid (1 - 20) */}
              <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-10 gap-1.5 sm:gap-2">
                {tables.map((tItem) => {
                  const isSelected = selectedTable === tItem.tableNumber;
                  let statusBg = "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100";
                  let dotBg = "bg-emerald-500";

                  if (isSelected) {
                    statusBg = "bg-sky-600 text-white border-sky-600 shadow-md shadow-sky-600/30 font-bold scale-[1.03]";
                    dotBg = "bg-white";
                  } else if (tItem.status === 'Occupied') {
                    statusBg = "bg-amber-50 border-amber-300 text-amber-900";
                    dotBg = "bg-amber-500";
                  } else if (tItem.status === 'Order Preparing') {
                    statusBg = "bg-orange-50 border-orange-300 text-orange-900";
                    dotBg = "bg-orange-500";
                  } else if (tItem.status === 'Payment Pending') {
                    statusBg = "bg-purple-50 border-purple-300 text-purple-900";
                    dotBg = "bg-purple-500";
                  }

                  return (
                    <button
                      key={tItem.id}
                      onClick={() => setSelectedTable(tItem.tableNumber)}
                      className={`py-2 px-1 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${statusBg}`}
                    >
                      <div className="text-xs sm:text-sm font-extrabold leading-tight">T-{tItem.tableNumber}</div>
                      <div className="flex items-center gap-1 text-[10px] font-bold opacity-90 mt-0.5 max-w-full">
                        <span className={`w-1.5 h-1.5 rounded-full ${dotBg} shrink-0`} />
                        <span className="truncate">{getTableStatusLabel(tItem.status)}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Menu Catalog */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              
              {/* Category Filter Pills & Search & Add New Item */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {[
                    { id: 'All', label: t('categoryAll') },
                    { id: 'Starters', label: t('categoryStarters') },
                    { id: 'Main Course', label: t('categoryMain') },
                    { id: 'Breads', label: t('categoryBreads') },
                    { id: 'Beverages', label: t('categoryBeverages') },
                    { id: 'Desserts', label: t('categoryDesserts') }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                        selectedCategory === cat.id
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1 sm:w-48">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t('searchFood')}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>

                  <button
                    onClick={handleOpenAddModal}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm shadow-emerald-600/20 shrink-0 whitespace-nowrap active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{t('addDish')}</span>
                  </button>
                </div>
              </div>

              {/* Food Items Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[580px] overflow-y-auto pr-1">
                {filteredMenuItems.map((item) => {
                  const localized = getLocalizedDish(item, language);
                  return (
                    <div
                      key={item.id}
                      className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-sm hover:shadow-md hover:border-sky-300 transition-all flex flex-col justify-between space-y-3 group relative"
                    >
                      {/* Large Food Image with Badges & Edit Button */}
                      <div className="relative overflow-hidden rounded-xl bg-slate-100 shrink-0">
                        {item.image && (item.image.startsWith('http') || item.image.startsWith('/') || item.image.startsWith('data:')) ? (
                          <img
                            src={item.image}
                            alt={localized.name}
                            className="w-full h-36 object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-36 rounded-xl bg-slate-100 flex items-center justify-center text-4xl">
                            {item.image}
                          </div>
                        )}

                        {/* Pure Veg Badge */}
                        <span className="absolute top-2 left-2 bg-white/95 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-bold text-emerald-800 flex items-center gap-1.5 shadow-sm border border-emerald-200/80">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                          <span>{t('pureVeg')}</span>
                        </span>

                        {/* Top Right Edit Button Overlay */}
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="absolute top-2 right-2 bg-white/95 hover:bg-sky-600 hover:text-white text-slate-700 p-1.5 rounded-full shadow-md backdrop-blur-md transition-all border border-slate-200/80 active:scale-95"
                          title={t('editDish')}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Price Badge */}
                        <span className="absolute bottom-2 right-2 bg-slate-900/85 backdrop-blur-md text-white text-xs font-black px-2.5 py-1 rounded-lg shadow-sm border border-white/20">
                          ₹{item.price}
                        </span>
                      </div>

                      {/* Dish Title & Description */}
                      <div className="space-y-1">
                        <h4 className="text-sm font-extrabold text-slate-900 leading-snug">{localized.name}</h4>
                        <p className="text-xs text-slate-500 line-clamp-2 font-medium leading-relaxed">{localized.description}</p>
                      </div>

                      {/* Action Buttons: Add to Order + Edit Dish */}
                      <div className="flex items-center gap-2 mt-auto pt-1">
                        <button
                          onClick={() => handleAddToCart({ ...item, name: localized.name })}
                          className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-sky-600/20 active:scale-[0.98]"
                        >
                          <Plus className="w-4 h-4" />
                          <span>{t('addToOrder')}</span>
                        </button>

                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="p-2.5 bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-700 rounded-xl border border-slate-200/80 transition-all shrink-0 active:scale-95"
                          title={t('editDish')}
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Column: Order Cart Drawer */}
          <div id="order-cart-drawer" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-fit sticky top-20">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                <h3 className="text-sm font-bold text-slate-800">{t('orderCart')}</h3>
                <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg">
                  Table #{selectedTable}
                </span>
              </div>

              {/* Cart Items List */}
              {cartItems.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <Utensils className="w-8 h-8 mx-auto stroke-1" />
                  <p className="text-xs">{t('emptyCart')}</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs"
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="font-bold text-slate-800 truncate">{item.name}</div>
                        <div className="text-[10px] text-slate-400">₹{item.price} each</div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, -1)}
                            className="p-1 hover:bg-slate-100 text-slate-600"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 font-bold text-slate-800">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, 1)}
                            className="p-1 hover:bg-slate-100 text-slate-600"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="font-bold text-slate-800 w-12 text-right">
                          ₹{item.price * item.quantity}
                        </span>
                        <button
                          onClick={() => handleRemoveFromCart(item.id)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Special Instructions Note */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t('specialInstructions')}</span>
                </label>
                <textarea
                  rows={2}
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  placeholder={t('instructionsPlaceholder')}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>

            {/* Total & Submit Button */}
            <div className="mt-6 pt-4 border-t border-slate-200 space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>{t('subtotal')}</span>
                  <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>{t('tax')}</span>
                  <span className="font-semibold">₹{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-200">
                  <span>{t('grandTotal')}</span>
                  <span className="text-sky-700">₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={cartItems.length === 0}
                className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all ${
                  cartItems.length > 0
                    ? 'bg-sky-600 hover:bg-sky-700 text-white shadow-sky-600/25 active:scale-[0.99]'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4" />
                <span>{t('placeOrder')}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Active Orders Tab */
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800">{t('activeOrders')} Tracker</h3>

          {waiterActiveOrders.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Clock className="w-8 h-8 mx-auto stroke-1" />
              <p className="text-xs">No active orders currently processing.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {waiterActiveOrders.map((ord) => (
                <div
                  key={ord.orderId}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono">#{ord.orderId}</span>
                      <h4 className="text-sm font-bold text-slate-800">Table {ord.tableNumber}</h4>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                        ord.status === 'new'
                          ? 'bg-sky-100 text-sky-800 border-sky-200'
                          : ord.status === 'waiting'
                          ? 'bg-amber-100 text-amber-800 border-amber-200'
                          : ord.status === 'done'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : 'bg-purple-100 text-purple-800 border-purple-200'
                      }`}
                    >
                      {ord.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="text-xs space-y-1 text-slate-600 max-h-28 overflow-y-auto">
                    {ord.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>{it.name} × {it.quantity}</span>
                        <span className="font-semibold">₹{it.price * it.quantity}</span>
                      </div>
                    ))}
                  </div>

                  {ord.notes && (
                    <div className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200/60">
                      Note: {ord.notes}
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 font-medium block">Total Amount</span>
                      <span className="text-sm font-extrabold text-sky-700">₹{ord.total.toFixed(2)}</span>
                    </div>

                    {ord.status === 'new' ? (
                      <button
                        onClick={() => handleOpenEditActiveOrder(ord)}
                        className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Order</span>
                      </button>
                    ) : (
                      <button
                        disabled
                        title="Order is currently being prepared in kitchen and cannot be modified."
                        className="px-3 py-1.5 bg-slate-200 text-slate-400 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-not-allowed opacity-80"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Cooking (Locked)</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add New Dish Modal Popup */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 relative max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className={`${editingItem ? 'bg-sky-100 text-sky-700' : 'bg-emerald-100 text-emerald-700'} p-2 rounded-xl`}>
                  {editingItem ? <Edit3 className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base leading-tight">
                    {editingItem ? `Edit '${editingItem.name}'` : 'Add New Item to Menu'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {editingItem ? 'Update dish details, price, category, or photo' : 'Waiters & Staff Menu Management'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingItem(null);
                }}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewItem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('dishName')} *
                </label>
                <input
                  type="text"
                  required
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="e.g. Paneer Pasanda, Jeera Rice"
                  className="w-full px-3.5 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('dishCategory')} *
                  </label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Starters">{t('categoryStarters')}</option>
                    <option value="Main Course">{t('categoryMain')}</option>
                    <option value="Breads">{t('categoryBreads')}</option>
                    <option value="Beverages">{t('categoryBeverages')}</option>
                    <option value="Desserts">{t('categoryDesserts')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('dishPrice')} *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                    placeholder="e.g. 260"
                    className="w-full px-3.5 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('dishDescription')}
                </label>
                <input
                  type="text"
                  value={newItemDescription}
                  onChange={(e) => setNewItemDescription(e.target.value)}
                  placeholder="e.g. Rich cashew tomato gravy with soft cottage cheese"
                  className="w-full px-3.5 py-2.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Image Input Options */}
              <div className="space-y-3 pt-1">
                <label className="block text-xs font-bold text-slate-700">
                  {t('dishPhoto')}
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Option 1: File Upload */}
                  <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/40 rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all">
                    <Upload className="w-6 h-6 text-emerald-600 mb-1" />
                    <span className="text-xs font-bold text-slate-800">{t('uploadFile')}</span>
                    <span className="text-[10px] text-slate-500 font-medium mt-0.5">PNG, JPG, WEBP</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      className="hidden"
                    />
                  </label>

                  {/* Option 2: Image URL */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex flex-col justify-center space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                      <ImageIcon className="w-3.5 h-3.5 text-sky-600" />
                      <span>{t('orWebUrl')}</span>
                    </span>
                    <input
                      type="url"
                      value={newItemImageUrl}
                      onChange={(e) => {
                        setNewItemImageUrl(e.target.value);
                        setNewItemImagePreview(e.target.value);
                      }}
                      placeholder="https://example.com/photo.jpg"
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Image Live Preview */}
                {newItemImagePreview && (
                  <div className="relative w-full h-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm mt-2">
                    <img
                      src={newItemImagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2 left-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md">
                      Image Preview
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setNewItemImagePreview('');
                        setNewItemImageUrl('');
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Is Pure Veg Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isVegCheck"
                  checked={newItemIsVeg}
                  onChange={(e) => setNewItemIsVeg(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                />
                <label htmlFor="isVegCheck" className="text-xs font-bold text-slate-800 cursor-pointer flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>100% {t('pureVeg')}</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
                {editingItem ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteDish(editingItem.id)}
                    className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 className="w-4 h-4 text-rose-600" />
                    <span>{t('deleteDish')}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setEditingItem(null);
                    }}
                    className="px-4 py-2.5 border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                  >
                    Cancel
                  </button>
                )}

                <div className="flex items-center gap-2">
                  {editingItem && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddModalOpen(false);
                        setEditingItem(null);
                      }}
                      className="px-3.5 py-2.5 border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className={`px-5 py-2.5 ${editingItem ? 'bg-sky-600 hover:bg-sky-700 shadow-sky-600/20' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'} text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95`}
                  >
                    {editingItem ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    <span>{editingItem ? t('saveChanges') : t('addDish')}</span>
                  </button>
                </div>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Mobile Floating Quick Cart Action Bar */}
      {cartItems.length > 0 && activeTab === 'create' && (
        <div className="lg:hidden fixed bottom-16 left-3 right-3 z-40 bg-slate-900/95 backdrop-blur-md text-white p-3 rounded-2xl shadow-2xl border border-white/20 flex items-center justify-between animate-in slide-in-from-bottom-5">
          <div>
            <div className="text-[10px] font-semibold text-sky-300">
              {t('tableSelected')} #{selectedTable} • {cartItems.length} items
            </div>
            <div className="text-sm font-extrabold text-white">₹{grandTotal.toFixed(2)}</div>
          </div>
          <button
            onClick={() => setIsMobileCartOpen(true)}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-600/30 flex items-center gap-1.5 active:scale-95 transition-all"
          >
            <span>{t('orderCart')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Mobile Cart View Slide-up Modal */}
      {isMobileCartOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full p-5 shadow-2xl border border-slate-100 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Utensils className="w-5 h-5 text-sky-600" />
                <h3 className="font-extrabold text-slate-900 text-base">{t('orderCart')}</h3>
                <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-lg">
                  Table #{selectedTable}
                </span>
              </div>
              <button
                onClick={() => setIsMobileCartOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items */}
            {cartItems.length === 0 ? (
              <div className="py-8 text-center text-slate-400 space-y-2">
                <Utensils className="w-8 h-8 mx-auto stroke-1" />
                <p className="text-xs">{t('emptyCart')}</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs"
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="font-bold text-slate-800 truncate">{item.name}</div>
                      <div className="text-[10px] text-slate-400">₹{item.price} each</div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, -1)}
                          className="p-1 hover:bg-slate-100 text-slate-600"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 font-bold text-slate-800">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, 1)}
                          className="p-1 hover:bg-slate-100 text-slate-600"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="font-bold text-slate-800 w-12 text-right">
                        ₹{item.price * item.quantity}
                      </span>
                      <button
                        onClick={() => handleRemoveFromCart(item.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Special Instructions Note */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                <span>{t('specialInstructions')}</span>
              </label>
              <textarea
                rows={2}
                value={specialNotes}
                onChange={(e) => setSpecialNotes(e.target.value)}
                placeholder={t('instructionsPlaceholder')}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>

            {/* Total & Submit Button */}
            <div className="pt-3 border-t border-slate-200 space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>{t('subtotal')}</span>
                  <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>{t('tax')}</span>
                  <span className="font-semibold">₹{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-200">
                  <span>{t('grandTotal')}</span>
                  <span className="text-sky-700">₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={cartItems.length === 0}
                className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all ${
                  cartItems.length > 0
                    ? 'bg-sky-600 hover:bg-sky-700 text-white shadow-sky-600/25 active:scale-[0.99]'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4" />
                <span>{t('placeOrder')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Editing Active Order (Modify Items / Quantities / Notes) */}
      {editingActiveOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 relative max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="bg-sky-100 text-sky-700 p-2 rounded-xl">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base leading-tight">
                    Edit Order #{editingActiveOrder.orderId}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Table #{editingActiveOrder.tableNumber} • Modify items or add new dishes
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingActiveOrder(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditActiveOrder} className="space-y-4">
              {/* Items List in Order */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Order Items Breakdown
                </label>
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {editOrderItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="font-bold text-slate-800 truncate">{item.name}</div>
                        <div className="text-[10px] text-slate-400">₹{item.price} each</div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden">
                          <button
                            type="button"
                            onClick={() => handleUpdateEditItemQty(item.id, -1)}
                            className="p-1 hover:bg-slate-100 text-slate-600"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 font-bold text-slate-800">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => handleUpdateEditItemQty(item.id, 1)}
                            className="p-1 hover:bg-slate-100 text-slate-600"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="font-bold text-slate-800 w-12 text-right">
                          ₹{item.price * item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveEditItem(item.id)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add New Item Selector */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Add More Dishes from Menu
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-none">
                  {menuItems.map((menuDish) => (
                    <button
                      key={menuDish.id}
                      type="button"
                      onClick={() => handleAddItemToEditOrder(menuDish)}
                      className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5 text-sky-600" />
                      <span>{menuDish.name} (₹{menuDish.price})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Special Instructions Note */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                  <span>Special Instructions / Kitchen Notes</span>
                </label>
                <textarea
                  rows={2}
                  value={editOrderNotes}
                  onChange={(e) => setEditOrderNotes(e.target.value)}
                  placeholder="e.g. Less spicy, extra sauce..."
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              {/* Recalculated Totals */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-semibold">
                    ₹{editOrderItems.reduce((acc, curr) => acc + curr.price * curr.quantity, 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Taxes (GST 5%)</span>
                  <span className="font-semibold">
                    ₹{(editOrderItems.reduce((acc, curr) => acc + curr.price * curr.quantity, 0) * 0.05).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-200">
                  <span>Updated Grand Total</span>
                  <span className="text-sky-700">
                    ₹{(editOrderItems.reduce((acc, curr) => acc + curr.price * curr.quantity, 0) * 1.05).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingActiveOrder(null)}
                  className="px-4 py-2.5 border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs shadow-md shadow-sky-600/20 transition-all flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  <span>Save & Update Order</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
