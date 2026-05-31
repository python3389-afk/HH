import { Platform } from 'react-native';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeAuth,
  getAuth,
  getReactNativePersistence,
} from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  memoryLocalCache,
  getFirestore,
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyDmFZjkoAfTmd1ziTcF_zLi-TFfc8JFCgs',
  authDomain: 'orderme-280a9.firebaseapp.com',
  projectId: 'orderme-280a9',
  storageBucket: 'orderme-280a9.firebasestorage.app',
  messagingSenderId: '459726896000',
  appId: '1:459726896000:web:f9008cf21c49b37ba09f65',
  measurementId: 'G-B0DDKKJ46P',
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

function createAuth() {
  if (Platform.OS === 'web') {
    return getAuth(firebaseApp);
  }
  try {
    return initializeAuth(firebaseApp, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (error) {
    if (error?.code === 'auth/already-initialized') {
      return getAuth(firebaseApp);
    }
    throw error;
  }
}

export const auth = createAuth();

/**
 * Firestore with offline cache.
 * • Web / Expo web  → IndexedDB-backed persistent cache (survives page reloads)
 * • React Native native → memory cache (survives the session, re-syncs on reconnect)
 * experimentalForceLongPolling is required for React Native networking compatibility.
 */
function createFirestore() {
  const useIndexedDb = typeof indexedDB !== 'undefined';
  try {
    return initializeFirestore(firebaseApp, {
      localCache: useIndexedDb ? persistentLocalCache() : memoryLocalCache(),
      // Auto-detect long polling vs WebSocket — fixes connectivity in sandboxed
      // environments (Replit preview, some corporate networks) without forcing it.
      experimentalAutoDetectLongPolling: true,
    });
  } catch (e) {
    if (e?.code === 'failed-precondition' || String(e?.message).includes('already')) {
      return getFirestore(firebaseApp);
    }
    throw e;
  }
}

export const fs = createFirestore();

export { firebaseConfig };
