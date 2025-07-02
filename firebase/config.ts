import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCvHJJN7fhDPJJa_UZsBTyX9QYDj4t4vu4",
  authDomain: "bharat-base.firebaseapp.com",
  projectId: "bharat-base",
  storageBucket: "bharat-base.firebasestorage.app",
  messagingSenderId: "1015918053215",
  appId: "1:1015918053215:web:6065d65edccaee6c12d8ea",
  measurementId: "G-4QK76486QW"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("Auth persistence set to local");
  })
  .catch((error) => {
    console.error("Error setting auth persistence:", error);
  });

googleProvider.setCustomParameters({
  prompt: 'select_account'
});
