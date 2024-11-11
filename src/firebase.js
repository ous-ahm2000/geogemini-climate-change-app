// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
require('dotenv').config({ path: '.env.local' });

const firebaseConfig = {
  apiKey:process.env.NEXT_PUBLIC_api_key, 
  authDomain:process.env.NEXT_PUBLIC_AuthDomain, 
  projectId:process.env.NEXT_PUBLIC_ProjectId,
  messagingSenderId:process.env.NEXT_PUBLIC_MessagingSenderId,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };
