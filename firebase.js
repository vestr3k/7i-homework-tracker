import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyB_JURWbgsOLzDxqD_zTzc1fIzVNUMxiSw",
    authDomain: "i-homework-tracker.firebaseapp.com",
    projectId: "i-homework-tracker",
    storageBucket: "i-homework-tracker.firebasestorage.app",
    messagingSenderId: "810578139811",
    appId: "1:810578139811:web:e85ee720074fcaa5d6bd16",
    measurementId: "G-7Y8VWRRPJ8"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);