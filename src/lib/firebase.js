// src/lib/firebase.js
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// 🔧 Replace with your Firebase project config from the Firebase Console
// Project Settings → General → Your apps → SDK setup and configuration
const firebaseConfig = {
  apiKey: "AIzaSyBUxEEvfs8wMUfK0--WzvGkOnAQY7n_xf8",
  authDomain: "schoolsystem-7fb73.firebaseapp.com",
  projectId: "schoolsystem-7fb73",
  storageBucket: "schoolsystem-7fb73.firebasestorage.app",
  messagingSenderId: "267732211547",
  appId: "1:267732211547:web:16610c1abfc2304293ec7e"
};


const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export default app
