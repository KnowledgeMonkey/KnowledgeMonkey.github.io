// Import the necessary functions from Firebase SDK
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot } from "firebase/firestore"; 
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBLy2gvRiznyE-3a6xsT53X0tJg3aGR8O8",
  authDomain: "suscord-65558.firebaseapp.com",
  databaseURL: "https://suscord-65558-default-rtdb.firebaseio.com",
  projectId: "suscord-65558",
  storageBucket: "suscord-65558.firebasestorage.app",
  messagingSenderId: "967281777709",
  appId: "1:967281777709:web:4a3332a007fdd27cd52ca4",
  measurementId: "G-TSQ55MD2TV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firestore
const db = getFirestore(app);

export { db, addDoc, collection, query, orderBy, onSnapshot };