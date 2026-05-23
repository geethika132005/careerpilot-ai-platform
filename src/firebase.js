import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB2-iZi4f0lNWnWZvcpzA4OY_f1E1AJHtw",
  authDomain: "placement-tracker-5b828.firebaseapp.com",
  projectId: "placement-tracker-5b828",
  storageBucket: "placement-tracker-5b828.firebasestorage.app",
  messagingSenderId: "427605257071",
  appId: "1:427605257071:web:0d92560d9b33dcea9e169a",
  measurementId: "G-QE619YG4M1",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
