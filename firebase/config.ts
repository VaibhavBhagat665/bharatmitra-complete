import { initializeApp } from "firebase/app"; // Fixed import
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// IMPORTANT: Replace with your app's Firebase project configuration
// You can get this from the Firebase console under Project settings.
const firebaseConfig = {
  apiKey: "AIzaSyCvHJJN7fhDPJJa_UZsBTyX9QYDj4t4vu4",
  authDomain: "bharat-base.firebaseapp.com",
  projectId: "bharat-base",
  storageBucket: "bharat-base.firebasestorage.app",
  messagingSenderId: "1015918053215",
  appId: "1:1015918053215:web:6065d65edccaee6c12d8ea",
  measurementId: "G-4QK76486QW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();