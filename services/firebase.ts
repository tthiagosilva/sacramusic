import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// --- CONFIGURAÇÃO DO FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyCslZWkznN1gWTiQqUROytKWD0_zuZPOCI",
  authDomain: "sacramusic-e6932.firebaseapp.com",
  projectId: "sacramusic-e6932",
  storageBucket: "sacramusic-e6932.firebasestorage.app",
  messagingSenderId: "1039561285002",
  appId: "1:1039561285002:web:5fd84b6ff8b80247243c73"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Inicializa o Banco de Dados (Firestore)
export const db = getFirestore(app);

// Inicializa Autenticação
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();