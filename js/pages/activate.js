import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

(function () {
  "use strict";

  try {

    // ================================
    // 🔁 JEŚLI JUŻ AKTYWOWANY → LOGIN
    // ================================
    if (localStorage.getItem("activated") === "true") {
      console.log("🔁 Już aktywowane → login");

      document.documentElement.style.display = "none";
      window.location.replace("login.html");

      return; // 💥 zatrzymuje cały skrypt
    }

    // ================================
    // 🔧 FIREBASE INIT
    // ================================
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

    // ================================
    // 💾 ZAPIS AKTYWACJI (IndexedDB + localStorage)
    // ================================
    function saveAuth() {
      try {
        const request = indexedDB.open("obywatel_auth", 1);

        request.onupgradeneeded = function (event) {
          const db = event.target.result;
          if (!db.objectStoreNames.contains("auth_state")) {
            db.createObjectStore("auth_state");
          }
        };

        request.onsuccess = function (event) {
          const db = event.target.result;

          try {
            const tx = db.transaction("auth_state", "readwrite");
            const store = tx.objectStore("auth_state");

            store.put(
              {
                refreshToken: "OK",
                activated: true
              },
              "auth_state"
            );

            tx.oncomplete = function () {
              localStorage.setItem("activated", "true");

              console.log("✅ Aktywacja zapisana");

              window.location.replace("login.html");
            };
          } catch (e) {
            console.error("IndexedDB tx error", e);
            window.location.replace("login.html");
          }
        };

        request.onerror = function () {
          console.error("IndexedDB open error");
          window.location.replace("login.html");
        };

      } catch (e) {
        console.error("IndexedDB crash", e);
        window.location.replace("login.html");
      }
    }

    // ================================
    // 🔑 OBSŁUGA FORMULARZA
    // ================================
    const form = document.getElementById("activateForm");

    if (!form) {
      console.warn("⚠️ Brak #activateForm → skrypt nieaktywny");
      return; // 💥 nie blokujemy nic dalej
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const key = document.getElementById("adminKeyInput")?.value.trim();
      const nick = document.getElementById("deviceLabelInput")?.value.trim();

      if (!key || !nick) {
        alert("Uzupełnij dane");
        return;
      }

      try {
        const snapshot = await getDocs(collection(db, "codes"));
        let found = false;

        for (const docSnap of snapshot.docs) {
          const data = docSnap.data();

          if (data.code === key && !data.used) {
            found = true;

            await updateDoc(doc(db, "codes", docSnap.id), {
              used: true,
              nick: nick
            });

            alert("✅ Aktywacja OK");

            saveAuth(); // 🔥 zapis + redirect
            return;
          }
        }

        if (!found) {
          alert("❌ Zły kod");
        }

      } catch (err) {
        console.error(err);
        alert("Błąd Firebase");
      }
    });

  } catch (err) {
    console.error("❌ activate.js crash:", err);
  }

})();
