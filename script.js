import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, firestore } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getDatabase, ref, push, set, onValue } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
import { messaging } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging.js';

const firebaseConfig = {
    apiKey: "AIzaSyAW-ZeUlzcKMoQYOhryWKXaL5uybNea3Yk",
    authDomain: "noxxed.firebaseapp.com",
    databaseURL: "https://noxxed-default-rtdb.firebaseio.com",
    projectId: "noxxed",
    storageBucket: "noxxed.appspot.com",
    messagingSenderId: "75167503010",
    appId: "1:75167503010:web:9cef5d7e7f98165bfbfdfb",
    measurementId: "G-36W00TY9GQ"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

function writeToDatabase(text) {
    push(ref(database, "chats"), text);
    console.log(push(ref(database, "chats"), text));
}

function readFromDatabase() {
    const dbRef = ref(database, 'posts');
    onValue(dbRef, (snapshot) => {
        const data = snapshot.val();
        console.log(data);
    }, {
        onlyOnce: true,
    });
}

writeToDatabase();
readFromDatabase();
//console.log(writeToDatabase(postData));
//console.log(readFromDatabase());

const input = document.getElementById('inputField');
const button = document.querySelector('button');
const p = document.querySelector('p');

button.addEventListener("click", () => {
    const value = input.value;
    console.log(value);
    writeToDatabase(value);
});

messaging.onMessage((text) => {
    p.textContent = text.notification.body;
})

function recieveMessage(text) {
  const dbRef = ref(database, 'chats');
  onValue(dbRef, (snapshot) => {
      const data = snapshot.val();
      console.log(data);
    });
    p.textContent = data;
};


recieveMessage();