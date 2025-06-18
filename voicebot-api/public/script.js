const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const voiceBtn = document.getElementById('voice-btn');
const synth = window.speechSynthesis;

// Add a message to the chat
function addMessage(text, isUser) {
    const msgDiv = document.createElement('div');
    msgDiv.className = isUser ? 'user-message' : 'bot-message';
    msgDiv.textContent = text;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Speak text aloud with error handling
function speak(text) {
    if (!synth) {
        console.error("Speech synthesis not supported in this browser.");
        addMessage("Sorry, speech synthesis is not supported in this browser.", false);
        return;
    }
    if (synth.speaking) synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event);
        addMessage("Sorry, I couldn't speak that message.", false);
    };
    synth.speak(utterance);
}

// Send message to ChatGPT API
async function sendToChatGPT(message) {
    try {
        const response = await fetch('http://localhost:5000/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.error) {
            throw new Error(data.error);
        }

        const reply = data.reply;
        addMessage(reply, false);
        speak(reply);
    } catch (error) {
        console.error("API Error:", error);
        addMessage("Sorry, I'm having trouble responding. Please try again.", false);
    }
}

// Voice recognition with better browser support
function startVoiceInput() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        addMessage("Sorry, voice input is not supported in this browser.", false);
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US'; // Set language for better accuracy
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        userInput.value = transcript;
        handleSend();
    };
    recognition.onerror = (event) => {
        console.error("Voice recognition error:", event);
        addMessage("Sorry, I couldn't understand your voice input. Please try again or type instead.", false);
    };
    recognition.start();
}

// Handle send button
function handleSend() {
    const message = userInput.value.trim();
    if (!message) return;
    addMessage(message, true);
    userInput.value = '';
    sendToChatGPT(message);
}

// Event listeners
sendBtn.addEventListener('click', handleSend);
userInput.addEventListener('keypress', (e) => e.key === 'Enter' && handleSend());
voiceBtn.addEventListener('click', startVoiceInput);

// Initial greeting
setTimeout(() => {
    const greeting = "Hi! I'm your AI voice assistant. Ask me anything about my life, skills, or goals!";
    addMessage(greeting, false);
    speak(greeting);
}, 1000);