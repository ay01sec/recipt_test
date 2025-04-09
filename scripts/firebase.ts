// scripts/firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCz-4vlqFEd22tdrr_9H3KqRhj4w2LPaLY",
  authDomain: "invoicereceipt-d80e2.firebaseapp.com",
  projectId: "invoicereceipt-d80e2",
  storageBucket: "invoicereceipt-d80e2.firebasestorage.app",
  messagingSenderId: "981873621214",
  appId: "1:981873621214:web:1271982459137e386eea4f",
  measurementId: "G-HWWJVMKBM2"
};
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app); // `firebase/auth/react-native` 不使用
export const db = getFirestore(app);
export const storage = getStorage(app);




// import { initializeApp } from 'firebase/app';
// import { getFirestore } from 'firebase/firestore';
// import { getStorage } from 'firebase/storage';

// import { initializeAuth, getReactNativePersistence } from 'firebase/auth/react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const firebaseConfig = {
//   apiKey: "AIzaSyCz-4vlqFEd22tdrr_9H3KqRhj4w2LPaLY",
//   authDomain: "invoicereceipt-d80e2.firebaseapp.com",
//   projectId: "invoicereceipt-d80e2",
//   storageBucket: "invoicereceipt-d80e2.appspot.com",
//   messagingSenderId: "981873621214",
//   appId: "1:981873621214:web:1271982459137e386eea4f",
//   measurementId: "G-HWWJVMKBM2"
// };
// const app = initializeApp(firebaseConfig);

// // 🔐 React Native用のAuthを初期化し、永続化を有効にする
// const auth = initializeAuth(app, {
//   persistence: getReactNativePersistence(AsyncStorage),
// });

// const db = getFirestore(app);
// const storage = getStorage(app);

// export { auth, db, storage };