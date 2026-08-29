import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBGNkpc1z-2kykrHvmeR09Pglmn1-zq2p4",
  authDomain: "hotel-management-455f4.firebaseapp.com",
  databaseURL: "https://hotel-management-455f4-default-rtdb.firebaseio.com",
  projectId: "hotel-management-455f4",
  storageBucket: "hotel-management-455f4.firebasestorage.app",
  messagingSenderId: "323382625906",
  appId: "1:323382625906:web:79537aa3e780b6de7024eb",
  measurementId: "G-T74ZBGPQWF"
};

export const isFirebaseConfigured = () => {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.apiKey !== 'your_api_key_here'
  );
};

let app = null;
let db = null;
let auth = null;

if (isFirebaseConfigured()) {
  try {
    app = initializeApp(firebaseConfig);
    db = getDatabase(app);
    auth = getAuth(app);
    console.log('🔥 Firebase Realtime Database initialized successfully!');
  } catch (error) {
    console.warn('⚠️ Firebase initialization error:', error.message);
  }
} else {
  console.log('ℹ️ Firebase keys not set in .env. Running in local mode.');
}

export { app, db, auth };
