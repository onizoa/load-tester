// firebase-init.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyDhBtACQ9a9MxLKwRXMBE0tnsE1ZQvy2sY",
  authDomain: "schedulertraininghub.firebaseapp.com",
  projectId: "schedulertraininghub",
  storageBucket: "schedulertraininghub.firebasestorage.app",
  messagingSenderId: "142656614006",
  appId: "1:142656614006:web:fa61e9711dac48dbc43957",
  measurementId: "G-YGDGXRSHN6"
};

// Initialize Firebase services
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);