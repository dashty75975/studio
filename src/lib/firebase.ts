
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: 'rega',
  appId: '1:788285498054:web:54bc5d68c9f49c215c2dc7',
  storageBucket: 'rega.firebasestorage.app',
  apiKey: 'AIzaSyBWZkcabbP4iE5wprxQdn-QiCD6ZxMzevI',
  authDomain: 'rega.firebaseapp.com',
  measurementId: '',
  messagingSenderId: '788285498054',
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db, app };
