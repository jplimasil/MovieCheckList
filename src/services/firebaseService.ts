import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBnui17goZu15iNAd6aAzisvBM1urvd7bc",
  authDomain: "catalogo-53c62.firebaseapp.com",
  projectId: "catalogo-53c62",
  storageBucket: "catalogo-53c62.appspot.com",
  messagingSenderId: "431282368491",
  appId: "1:431282368491:web:7a8f0c803cca0c058633ae",
  measurementId: "G-4F0B8HPV43"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
export const storage = getStorage(app);

// Default export for legacy code
export default app;
