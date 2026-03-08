// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyATIIJotnXPVJAesl_FhMA62ZmhV_nIAwI",
  authDomain: "janaawaj-fefd9.firebaseapp.com",
  projectId: "janaawaj-fefd9",
  storageBucket: "janaawaj-fefd9.firebasestorage.app",
  messagingSenderId: "29941431102",
  appId: "1:29941431102:web:4cf0ad16f5949950d24a6f",
  measurementId: "G-68W9XDTRH2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export {
  auth,
  db,
  googleProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
};
