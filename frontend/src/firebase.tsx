import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyAxZIw_e0C4GnYzTshtjvxYEwF6zL4fAYw",
  authDomain: "song-sync-40dba.firebaseapp.com",
  projectId: "song-sync-40dba",
  storageBucket: "song-sync-40dba.firebasestorage.app",
  messagingSenderId: "174268643640",
  appId: "1:174268643640:web:e9f81d676cfb3b17cba9cd",
  measurementId: "G-KDSCGVVRCW",
};

export const app = initializeApp(firebaseConfig);
