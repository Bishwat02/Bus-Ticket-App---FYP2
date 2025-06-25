//src/services/firebaseConfig.ts
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

//Check if app already initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

//Export auth and db
export const auth = getAuth(app);
export const db = getFirestore(app);



// // src/services/firebaseConfig.ts

// import { initializeApp, getApps, getApp } from 'firebase/app';
// import { initializeAuth, getReactNativePersistence } from 'firebase/auth/react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { getFirestore } from 'firebase/firestore';

// const firebaseConfig = {
//   apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
//   authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
//   projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
//   storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
//   appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
// };

// const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// export const auth = initializeAuth(app, {
//   persistence: getReactNativePersistence(AsyncStorage),
// });

// export const db = getFirestore(app);
