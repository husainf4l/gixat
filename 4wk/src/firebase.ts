// firebase.ts
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyDQwEey8N1z6GgwfgQtBPyMqraIwH9zvbQ",
  authDomain: "gixat-app.firebaseapp.com",
  projectId: "gixat-app",
  storageBucket: "gixat-app.firebasestorage.app",
  messagingSenderId: "452012051448",
  appId: "1:452012051448:web:41b3966e36e3da8d8ce40d",
  measurementId: "G-RPS5MNT156"
};

const app = initializeApp(firebaseConfig);

export default app;
