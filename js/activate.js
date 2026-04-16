import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* CONFIG */
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

/* FORM */
const form = document.getElementById("activateForm");

form.addEventListener("submit", async (e)=>{
  e.preventDefault();

  const code = document.getElementById("adminKeyInput").value.trim();
  const nick = document.getElementById("deviceLabelInput").value.trim();

  if(!code || !nick){
    alert("Uzupełnij dane");
    return;
  }

  /* 🔎 SZUKANIE KODU */
  const q = query(collection(db,"codes"), where("code","==",code));
  const snap = await getDocs(q);

  if(snap.empty){
    alert("Nieprawidłowy kod");
    return;
  }

  const docData = snap.docs[0];
  const data = docData.data();

  if(data.used){
    alert("Kod już użyty");
    return;
  }

  /* ✅ AKTYWACJA */
  await updateDoc(doc(db,"codes",docData.id),{
    used:true,
    usedBy:nick,
    usedAt:Date.now()
  });

  alert("Aktywacja udana!");

  /* 👉 PRZEJŚCIE DALEJ */
  window.location.href = "login.html"; // lub dashboard
});