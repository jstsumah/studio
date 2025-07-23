
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  projectId: "assetwise-jaw4u",
  appId: "1:666491814950:web:c3f262bbcda6d7f93692e7",
  storageBucket: "assetwise-jaw4u.appspot.com",
  apiKey: "AIzaSyDQcP-DTmb4yoXtj5Hq4cTaQvaUkZFva2A",
  authDomain: "assetwise-jaw4u.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "666491814950",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, app, storage };
