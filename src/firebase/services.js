import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './config';

// 1. Real-time Listener for Orders
export const subscribeOrders = (onUpdate) => {
  if (!isFirebaseConfigured() || !db) return () => {};

  try {
    const ordersRef = collection(db, 'hotel_orders');
    const q = query(ordersRef, orderBy('createdAt', 'desc'));

    return onSnapshot(q, (snapshot) => {
      const ordersList = snapshot.docs.map((docSnap) => ({
        ...docSnap.data(),
        orderId: docSnap.id
      }));
      onUpdate(ordersList);
    }, (error) => {
      console.warn('Firebase orders snapshot listener error:', error);
    });
  } catch (err) {
    console.warn('Failed to subscribe to Firebase orders:', err);
    return () => {};
  }
};

// 2. Real-time Listener for Tables
export const subscribeTables = (onUpdate) => {
  if (!isFirebaseConfigured() || !db) return () => {};

  try {
    const tablesRef = collection(db, 'hotel_tables');
    return onSnapshot(tablesRef, (snapshot) => {
      if (snapshot.empty) return;
      const tablesList = snapshot.docs.map((docSnap) => ({
        ...docSnap.data(),
        id: Number(docSnap.id)
      })).sort((a, b) => a.tableNumber - b.tableNumber);

      onUpdate(tablesList);
    }, (error) => {
      console.warn('Firebase tables snapshot listener error:', error);
    });
  } catch (err) {
    console.warn('Failed to subscribe to Firebase tables:', err);
    return () => {};
  }
};

// 3. Real-time Listener for Menu Items
export const subscribeMenuItems = (onUpdate) => {
  if (!isFirebaseConfigured() || !db) return () => {};

  try {
    const menuRef = collection(db, 'hotel_menu_items');
    return onSnapshot(menuRef, (snapshot) => {
      if (snapshot.empty) return;
      const menuList = snapshot.docs.map((docSnap) => ({
        ...docSnap.data(),
        id: docSnap.id
      }));
      onUpdate(menuList);
    }, (error) => {
      console.warn('Firebase menu snapshot listener error:', error);
    });
  } catch (err) {
    console.warn('Failed to subscribe to Firebase menu:', err);
    return () => {};
  }
};

// 4. Sync Order to Firestore
export const syncOrderToFirebase = async (orderData) => {
  if (!isFirebaseConfigured() || !db) return;

  try {
    const orderDocRef = doc(db, 'hotel_orders', orderData.orderId);
    await setDoc(orderDocRef, orderData, { merge: true });
  } catch (error) {
    console.error('Error syncing order to Firebase:', error);
  }
};

// 5. Sync Table Status to Firestore
export const syncTableToFirebase = async (tableNumber, status, currentOrderId = null) => {
  if (!isFirebaseConfigured() || !db) return;

  try {
    const tableDocRef = doc(db, 'hotel_tables', String(tableNumber));
    await setDoc(tableDocRef, {
      id: Number(tableNumber),
      tableNumber: Number(tableNumber),
      status,
      currentOrderId
    }, { merge: true });
  } catch (error) {
    console.error('Error syncing table to Firebase:', error);
  }
};

// 6. Sync Menu Item to Firestore
export const syncMenuItemToFirebase = async (itemData) => {
  if (!isFirebaseConfigured() || !db) return;

  try {
    const itemDocRef = doc(db, 'hotel_menu_items', itemData.id);
    await setDoc(itemDocRef, itemData, { merge: true });
  } catch (error) {
    console.error('Error syncing menu item to Firebase:', error);
  }
};

// 7. Delete Menu Item from Firestore
export const deleteMenuItemFromFirebase = async (itemId) => {
  if (!isFirebaseConfigured() || !db) return;

  try {
    const itemDocRef = doc(db, 'hotel_menu_items', itemId);
    await deleteDoc(itemDocRef);
  } catch (error) {
    console.error('Error deleting menu item from Firebase:', error);
  }
};

// 8. Bulk Sync All Tables to Firestore
export const initializeFirebaseTables = async (initialTables) => {
  if (!isFirebaseConfigured() || !db) return;

  try {
    for (const tbl of initialTables) {
      await syncTableToFirebase(tbl.tableNumber, tbl.status, tbl.currentOrderId);
    }
  } catch (error) {
    console.error('Error initializing Firebase tables:', error);
  }
};
