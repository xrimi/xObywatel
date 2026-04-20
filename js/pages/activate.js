import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 🔥 FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyBnRiQrdboAfjAFoBLj37A8QoIIezqrbVk",
  authDomain: "bobywatelkody.firebaseapp.com",
  projectId: "bobywatelkody",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🔑 LOCAL STORAGE KEY
const STORAGE_KEY = "device_activated";

// 🚀 jeśli już aktywowany → login
if (localStorage.getItem(STORAGE_KEY)) {
  window.location.replace("login.html");
}

// 📋 ELEMENTY
const form = document.getElementById("activateForm");
const keyInput = document.getElementById("adminKeyInput");
const nameInput = document.getElementById("deviceLabelInput");

// 🧠 NORMALIZACJA KODU
function normalizeKey(input) {
  return input.trim().toUpperCase();
}

// 🚀 SUBMIT
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const key = normalizeKey(keyInput.value);
  const name = nameInput.value.trim();

  if (!key || !name) {
    alert("Uzupełnij dane");
    return;
  }

  try {
    const ref = doc(db, "codes", key);
    const snap = await getDoc(ref);

    console.log("Szukam kodu:", key);

    if (!snap.exists()) {
      alert("Nieprawidłowy kod");
      return;
    }

    const data = snap.data();

    if (data.used) {
      alert("Kod już użyty");
      return;
    }

    // 🔥 oznacz jako użyty
    await setDoc(ref, {
      ...data,
      used: true,
      usedBy: name,
      usedAt: Date.now()
    });

    // 🔥 LOCAL STORAGE
    localStorage.setItem(STORAGE_KEY, "true");
    localStorage.setItem("user_key", key);

    // 🔥 INDEXEDDB FIX (usuwa pętlę)
    const request = indexedDB.open("obywatel_auth", 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("auth_state")) {
        db.createObjectStore("auth_state");
      }
    };

    request.onsuccess = () => {
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
    alert("Błąd Firebase");
  }
});
