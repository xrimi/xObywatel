import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBnRiQrdboAfjAFoBLj37A8QoIIezqrbVk",
  authDomain: "bobywatelkody.firebaseapp.com",
  projectId: "bobywatelkody",
  storageBucket: "bobywatelkody.firebasestorage.app",
  messagingSenderId: "941487075648",
  appId: "1:941487075648:web:40d8a374d293c16d56caa5"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


// 🔥 jeśli już aktywowany → NIE wracaj do activate
if (localStorage.getItem("activated") === "true") {
  window.location.href = "login.html";
}


// 🔥 zapis aktywacji
function saveAuth() {
  const request = indexedDB.open("obywatel_auth", 1);

  request.onupgradeneeded = function (event) {
    const db = event.target.result;
    if (!db.objectStoreNames.contains("auth_state")) {
      db.createObjectStore("auth_state");
    }
  };
saveAuth();
  
  request.onsuccess = function (event) {
    const db = event.target.result;
    const tx = db.transaction("auth_state", "readwrite");
    const store = tx.objectStore("auth_state");

    store.put({
      refreshToken: "OK",
      activated: true
    }, "auth_state");

    tx.oncomplete = function () {
      localStorage.setItem("activated", "true");

      // 🔥 TO JEST KLUCZOWE — zapobiega pętli po restarcie
      sessionStorage.setItem("auth_validated", "true");

      window.location.href = "login.html";
    };
  };
}

