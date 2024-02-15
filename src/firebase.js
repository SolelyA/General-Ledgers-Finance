// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import {
  getFirestore
} from "firebase/firestore"
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import signup from './pages/signup'
import login from './pages/login';

// Import the admin creds


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCmdGt7PAz_oiwfBIyVtlKdWOSX2qPH_YM",
  authDomain: "application-swe-project.firebaseapp.com",
  projectId: "application-swe-project",
  storageBucket: "application-swe-project.appspot.com",
  messagingSenderId: "511283748075",
  appId: "1:511283748075:web:fbe630368160fccfa1f2ae",
  measurementId: "G-6G1HQ9X398"
};


// Initialize Firebase


export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
const analytics = getAnalytics(app);


