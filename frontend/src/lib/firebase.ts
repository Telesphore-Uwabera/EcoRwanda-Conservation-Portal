import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzSyD7LUes8rYabP7t0D1Yll4dxszqZPpgs",
  authDomain: "ecorwanda-7507c.firebaseapp.com",
  projectId: "ecorwanda-7507c",
  storageBucket: "ecorwanda-7507c.appspot.com",
  messagingSenderId: "894846413086",
  appId: "1:894846413086:web:14677974995fd39cfc10f",
  measurementId: "G-6645B476KJ"
};

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app); 