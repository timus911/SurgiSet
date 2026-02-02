import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyAgbOlcYIoThiRy8x6v1ybiIBU-SMHb2mc",
    authDomain: "surgiset.firebaseapp.com",
    projectId: "surgiset",
    storageBucket: "surgiset.firebasestorage.app",
    messagingSenderId: "322179920169",
    appId: "1:322179920169:web:eda848408f457f0f860738"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
