import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getFirestore, getDocs, collection } from 'https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js'
import { getDatabase, ref, push, set, onValue } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";

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
const firestore = getFirestore();
console.log(firestore);

firestore.collection("users").add({
    name: "John Doe",
    age: 30
})
.then((docRef) => {
    console.log("Document written with ID: ", docRef.id);
})
.catch((error) => {
    console.error("Error adding document: ", error);
});

function writeToDatabase(text) {
    push(ref(database, "chats"), text);
    console.log(push(ref(database, "chats"), text));
    firestore.collection("users").add({
        name: "John Doe",
        age: 30
    })
    .then((docRef) => {
        console.log("Document written with ID: ", docRef.id);
    })
    .catch((error) => {
        console.error("Error adding document: ", error);
    });
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

writeToDatabase("testing this string");
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