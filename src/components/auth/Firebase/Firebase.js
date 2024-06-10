import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDGkmLYuYuwJPiRrRhUJRuOl9BBICcRrQs",
  authDomain: "onlinetutorfinder-c513d.firebaseapp.com",
  projectId: "onlinetutorfinder-c513d",
  storageBucket: "onlinetutorfinder-c513d.appspot.com",
  messagingSenderId: "404593317484",
  appId: "1:404593317484:web:abf5beadaa05b7d2e22a49",
  measurementId: "G-YMEGHJWEMH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth=getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
export const imageDb = getStorage(app);
export default app;