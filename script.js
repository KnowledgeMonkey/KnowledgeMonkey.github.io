import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getDatabase, ref, push, update, onValue } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";

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

document.addEventListener("DOMContentLoaded", function() {
    const inputName = document.getElementById("inputField2");
    const inputText = document.getElementById("inputField");

    inputName.addEventListener("input", function() {
        inputName.classList.remove("input-focused");
    });

    inputText.addEventListener("input", function() {
        inputText.classList.remove("input-focused");
    });

    const button = document.getElementById("button");
    const chatContainer = document.getElementById("chatContainer");
    const maxMessages = 10; // Maximum number of displayed messages
    const messagesQueue = [];

    button.addEventListener("click", () => {
        let inputNameVal = inputName.value.trim();
        let inputTextVal = inputText.value.trim();

        if (inputNameVal !== '' && inputTextVal !== '') {
            if (/^[a-zA-Z]+$/.test(inputNameVal)) {
                sendMessage(inputNameVal, inputTextVal);
            } else {
                alert("Please enter a valid name with only letters (A-Z, a-z).");
            }
        } else {
            alert("Please enter your name and message.");
        }
    });

    onValue(ref(database, 'chat'), (snapshot) => {
        messagesQueue.length = 0; // Clear messages queue
        snapshot.forEach((childSnapshot) => {
            const message = childSnapshot.val();
            const name = message.name;
            const text = message.message;
            const timestamp = message.timestamp;
            messagesQueue.push({ name, text, timestamp });
        });
        displayMessages();
    });

    function displayMessages() {
        chatContainer.innerHTML = '';
        if (messagesQueue.length === 0) return; // Exit if there are no messages
        const startIndex = Math.max(0, messagesQueue.length - maxMessages);
        for (let i = startIndex; i < messagesQueue.length; i++) {
            const message = messagesQueue[i];
            displayMessage(message.name, message.text, message.timestamp);
        }
    }

    function displayMessage(name, message, timestamp) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        const timestampString = new Date(timestamp).toLocaleTimeString();
        messageDiv.innerHTML = `<div class="message-text"><strong>${name}:</strong> <span>${message}</span></div><div class="timestamp">${timestampString}</div>`;
        chatContainer.appendChild(messageDiv);
    }

    function sendMessage(name, message) {
        const messageRef = push(ref(database, 'chat'));
        const messageKey = messageRef.key;

        const newMessage = {
            name: name,
            message: message,
            timestamp: Date.now()
        };

        const updates = {};
        updates['/chat/' + messageKey] = newMessage;

        update(ref(database), updates);

        inputText.value = '';
    }
});








        const updates = {};
        updates['/chat/' + messageKey] = newMessage;

        update(ref(database), updates);

        inputText.value = '';
    

