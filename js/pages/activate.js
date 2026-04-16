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

/* 🔑 FORM */
const form = document.getElementById("activateForm");

form.addEventListener("submit", async (e)=>{
  e.preventDefault();

  const codeInput = document.getElementById("adminKeyInput").value;
  const nick = document.getElementById("deviceLabelInput").value;

  if(!codeInput || !nick){
    alert("uzupełnij dane");
    return;
  }

  /* 🔍 SZUKAJ KODU */
  const q = query(collection(db,"codes"), where("code","==",codeInput));
  const snap = await getDocs(q);

  if(snap.empty){
    alert("❌ kod nie istnieje");
    return;
  }

  const docSnap = snap.docs[0];
  const data = docSnap.data();

  if(data.used){
    alert("❌ kod już użyty");
    return;
  }

  /* ✅ OK */
  await updateDoc(doc(db,"codes",docSnap.id),{
    used:true,
    usedBy:nick
  });

  alert("✅ aktywacja udana");

  /* tutaj możesz przekierować dalej */
  window.location.href = "login.html";
});