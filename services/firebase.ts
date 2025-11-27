// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBrKGVTZkFyPslyrayJOHxYTUTO0POp360",
  authDomain: "juteexx-7862e.firebaseapp.com",
  projectId: "juteexx-7862e",
  storageBucket: "juteexx-7862e.firebasestorage.app",
  messagingSenderId: "76526186492",
  appId: "1:76526186492:web:f32d5985b82fc8a64a0c79",
  measurementId: "G-H2NRRG19Z1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { app, analytics, auth };
