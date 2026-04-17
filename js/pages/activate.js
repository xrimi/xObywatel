// 🔥 Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 🔥 TWOJA KONFIGURACJA
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

// 📦 IndexedDB zapis (TO JEST KLUCZOWE!)
function saveAuth() {
  const request = indexedDB.open("obywatel_auth", 1);

  request.onupgradeneeded = function (event) {
    const db = event.target.result;
    if (!db.objectStoreNames.contains("auth_state")) {
      db.createObjectStore("auth_state");
    }
  };

  request.onsuccess = function (event) {
    const db = event.target.result;
    const tx = db.transaction("auth_state", "readwrite");
    const store = tx.objectStore("auth_state");

    // 🔥 TO SPRAWDZA LOGIN.HTML
    store.put({
      refreshToken: "AKTYWNY_USER"
    }, "auth_state");

    tx.oncomplete = function () {
      console.log("✅ Zapisano auth_state");

      // 🔥 PRZEJŚCIE DO LOGIN
      window.location.href = "login.html";
    };
  };
}

// 🔑 Sprawdzanie kodu
document.getElementById("activateForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const key = document.getElementById("adminKeyInput").value.trim();
  const nick = document.getElementById("deviceLabelInput").value.trim();

  if (!key || !nick) {
    alert("Uzupełnij dane");
    return;
  }

  try {
    const snapshot = await getDocs(collection(db, "codes"));

    let found = false;

    snapshot.forEach(async (docSnap) => {
      const data = docSnap.data();

      if (data.code === key && !data.used) {
        found = true;

        // 🔥 oznacz jako użyty
        await updateDoc(doc(db, "codes", docSnap.id), {
          used: true,
          nick: nick
        });

        alert("✅ Aktywacja udana");

        saveAuth(); // 🔥 TO NAJWAŻNIEJSZE
      }
    });

    if (!found) {
      alert("❌ Nieprawidłowy kod");
    }

  } catch (err) {
    console.error(err);
    alert("Błąd połączenia z bazą");
  }
});
