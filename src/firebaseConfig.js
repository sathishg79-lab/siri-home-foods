import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, set, onValue, remove } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDHL8-QunoLbFWNnK1ZqEQFwMo-ac1_HkY",
  authDomain: "siri-home-foods.firebaseapp.com",
  databaseURL: "https://siri-home-foods-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "siri-home-foods",
  storageBucket: "siri-home-foods.firebasestorage.app",
  messagingSenderId: "794708654497",
  appId: "1:794708654497:web:03f628dce11be6d16bf3e0",
  measurementId: "G-M7KGF0DSG9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get a reference to the database service
export const db = getDatabase(app);

export { ref, get, set, onValue, remove };
