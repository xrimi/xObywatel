import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 🔥 FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyBnRiQrdboAfjAFoBLj37A8QoIIezqrbVk",
  authDomain: "bobywatelkody.firebaseapp.com",
  projectId: "bobywatelkody",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🔑 LOCAL STORAGE KEY
const STORAGE_KEY = "device_activated";

// 🚀 AUTO SKIP
if (localStorage.getItem(STORAGE_KEY)) {
  window.location.replace("login.html");
}

// 👉 WAŻNE: czekamy aż DOM się załaduje
document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("activateForm");
  const keyInput = document.getElementById("adminKeyInput");
  const nameInput = document.getElementById("deviceLabelInput");

  if (!form || !keyInput || !nameInput) {
    console.error("Brak elementów DOM!");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const key = keyInput.value.trim();
    const name = nameInput.value.trim();

    if (!key || !name) {
      alert("Uzupełnij dane");
      return;
    }

    try {
      const ref = doc(db, "codes", key);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        alert("Nieprawidłowy kod");
        return;
      }

      const data = snap.data();

      if (data.used) {
        alert("Kod już użyty");
        return;
      }

      await setDoc(ref, {
        ...data,
        used: true,
        usedBy: name,
        usedAt: Date.now()
      });

      localStorage.setItem(STORAGE_KEY, "true");
      localStorage.setItem("user_key", key);

      const request = indexedDB.open("obywatel_auth", 1);

      request.onupgradeneeded = function () {
        const db = request.result;
        if (!db.objectStoreNames.contains("auth_state")) {
          db.createObjectStore("auth_state");
        }
      };

      request.onsuccess = function () {
        const db = request.result;
        const tx = db.transaction("auth_state", "readwrite");
        const store = tx.objectStore("auth_state");

        store.put({
          refreshToken: "ok",
          activated: true
        }, "auth_state");
      };

      alert("Aktywacja udana");
      window.location.replace("login.html");

    } catch (err) {
      console.error(err);
      alert("Błąd Firebase / brak dostępu");
    }
  });
});
