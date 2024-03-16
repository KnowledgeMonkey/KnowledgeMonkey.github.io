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

const button = document.getElementById("button");
const inputname = document.getElementById("inputField2");
const inputtext = document.getElementById("inputField");
let chatContainer; // Define chatContainer variable

button.addEventListener("click", () => {
    let inputnameval = inputname.value;
    let inputtextval = inputtext.value;
    sendMessage(inputnameval, inputtextval);
});

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Wait for the DOM to load before accessing chatContainer
document.addEventListener("DOMContentLoaded", function() {
    chatContainer = document.getElementById("chatContainer");

    // Function to display messages in the chat area
    function displayMessage(name, message) {
        const messageDiv = document.createElement('div');
        messageDiv.innerHTML = `<strong>${name}:</strong> <span>${message}</span>`;
        
        // Style the message container
        messageDiv.style.marginBottom = '10px';
        messageDiv.style.padding = '5px';
        messageDiv.style.backgroundColor = '#f3f3f3';
        messageDiv.style.borderRadius = '5px';

        // Style the name
        const nameElement = messageDiv.querySelector('strong');
        nameElement.style.fontWeight = 'bold';

        // Style the message text
        const messageText = messageDiv.querySelector('span');
        messageText.style.marginLeft = '5px';

        chatContainer.appendChild(messageDiv);
    }

    // Listen for new messages in the database and display them
    onValue(ref(database, 'chat'), (snapshot) => {
        chatContainer.innerHTML = ''; // Clear existing messages
        snapshot.forEach((childSnapshot) => {
            const message = childSnapshot.val();
            const name = message.name;
            const text = message.message;
            displayMessage(name, text);
        });
    });
});

function sendMessage(name, message) {
    const messageRef = push(ref(database, 'chat'));
    const messageKey = messageRef.key;

    const newMessage = {
        name: name,
        message: message
    };

    const updates = {};
    updates['/chat/' + messageKey] = newMessage;

    update(ref(database), updates);
}
