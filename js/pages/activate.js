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

// 🚀 AUTO SKIP (żeby nie wracało do activate)
if (localStorage.getItem(STORAGE_KEY)) {
  window.location.replace("login.html");
}

// 📋 ELEMENTY
const form = document.getElementById("activateForm");
const keyInput = document.getElementById("adminKeyInput");
const nameInput = document.getElementById("deviceLabelInput");

// 📩 SUBMIT
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

    // 🔥 oznacz jako użyty w Firebase
    await setDoc(ref, {
      ...data,
      used: true,
      usedBy: name,
      usedAt: Date.now()
    });

    // 💾 LOCAL STORAGE
    localStorage.setItem(STORAGE_KEY, "true");
    localStorage.setItem("user_key", key);

    // 🔥 🔥 🔥 TO BYŁ TEN FRAGMENT "DODAJ POD TO" 🔥 🔥 🔥
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
    // 🔥 🔥 🔥 KONIEC FRAGMENTU 🔥 🔥 🔥

    alert("Aktywacja udana");

    // 👉 PRZEJŚCIE DO LOGIN
    window.location.replace("login.html");

  } catch (err) {
    console.error(err);
    alert("Błąd");
  }
});
