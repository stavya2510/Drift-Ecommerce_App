import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyDOal046zrs0iV07FPYMO3zQSoOWR0_IZ4",
  authDomain: "stavya-raikar.firebaseapp.com",
  projectId: "stavya-raikar",
  storageBucket: "stavya-raikar.firebasestorage.app",
  messagingSenderId: "215792252095",
  appId: "1:215792252095:web:2d146419de6b8e2a64420a",
  measurementId: "G-1SC6P5M0LW"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  auth = getAuth(app); // already initialised (happens on hot reload)
}

export { auth };
export const db = getFirestore(app);