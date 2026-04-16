import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

/* 🔥 TWÓJ CONFIG */
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
const auth = getAuth(app);

/* 🔐 LOGIN */
const email = prompt("login");
const pass = prompt("hasło");

signInWithEmailAndPassword(auth,email,pass)
.catch(()=> alert("błąd logowania"));

onAuthStateChanged(auth,user=>{
  if(user){
    loadCodes();
  } else {
    document.body.innerHTML="Brak dostępu";
  }
});

/* 🔥 GENERATOR */
function randomCode(){
  return "XXXX-XXXX-XXXX-XXXX".replace(/X,g=>
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random()*36)]
  );
}

window.generate = async ()=>{
  const nick = document.getElementById("nick").value;
  if(!nick) return alert("podaj nick");

  const code = randomCode();

  await addDoc(collection(db,"codes"),{
    code,
    nick,
    used:false
  });

  loadCodes();
};

/* 📋 LOAD */
async function loadCodes(){
  const snap = await getDocs(collection(db,"codes"));
  const container = document.getElementById("codes");
  container.innerHTML="";

  snap.forEach(d=>{
    const data = d.data();

    const div = document.createElement("div");
    div.className="code";

    div.innerHTML=`
      <div class="code-info">
        <b>${data.code}</b><br>
        ${data.nick}<br>
        <span class="${data.used ? 'used':'active'}">
          ${data.used ? 'UŻYTY':'AKTYWNY'}
        </span>
      </div>

      <div class="actions">
        <button onclick="edit('${d.id}')">✏️</button>
        <button onclick="del('${d.id}')">🗑️</button>
      </div>
    `;

    container.appendChild(div);
  });
}

/* ❌ DELETE */
window.del = async(id)=>{
  await deleteDoc(doc(db,"codes",id));
  loadCodes();
};

/* ✏️ EDIT */
window.edit = async(id)=>{
  const nick = prompt("nowy nick");
  if(!nick) return;

  await updateDoc(doc(db,"codes",id),{
    nick
  });

  loadCodes();
};