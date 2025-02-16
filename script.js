// Import functions from firebase.js
import { db, addDoc, collection, query, orderBy, onSnapshot } from './firebase.js';

const sendButton = document.getElementById('send-btn');
const messageInput = document.getElementById('message');
const messagesContainer = document.querySelector('.messages');

sendButton.addEventListener('click', sendMessage);

async function sendMessage() {
  const messageText = messageInput.value;

  if (messageText.trim() === '') {
    console.log("Message is empty, not sending.");
    return;
  }

  console.log("Sending message:", messageText);

  // Add message to Firestore
  try {
    await addDoc(collection(db, 'messages'), {
      text: messageText,
      timestamp: new Date(),
    });
    console.log("Message sent successfully!");
    messageInput.value = ''; // Clear input field
  } catch (error) {
    console.error('Error sending message:', error);
  }
}

// Listen for new messages in Firestore
const messagesQuery = query(collection(db, 'messages'), orderBy('timestamp'));
onSnapshot(messagesQuery, (snapshot) => {
  messagesContainer.innerHTML = ''; // Clear existing messages
  snapshot.forEach((doc) => {
    const message = doc.data();
    const messageElement = document.createElement('div');
    messageElement.textContent = message.text;
    messagesContainer.appendChild(messageElement);
  });
});
