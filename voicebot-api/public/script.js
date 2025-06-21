const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const voiceBtn = document.getElementById('voice-btn');
const suggestionBtns = document.querySelectorAll('.suggestion-btn');
const synth = window.speechSynthesis;

let isSpeaking = false;
let recognition;

// Add message to chat
function addMessage(text, isUser) {
  const msgDiv = document.createElement('div');
  msgDiv.className = isUser ? 'user-message' : 'bot-message';
  msgDiv.textContent = text;
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Show typing indicator
function showTyping() {
  const typingDiv = document.createElement('div');
  typingDiv.className = 'typing-indicator';
  typingDiv.innerHTML = '<span></span><span></span><span></span>';
  typingDiv.id = 'typing-indicator';
  chatBox.appendChild(typingDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Hide typing indicator
function hideTyping() {
  const typingIndicator = document.getElementById('typing-indicator');
  if (typingIndicator) {
    typingIndicator.remove();
  }
}

// Speak text
function speak(text) {
  if (!synth || isSpeaking) return;
  
  isSpeaking = true;
  const utterance = new SpeechSynthesisUtterance(text);
  
  utterance.onend = () => {
    isSpeaking = false;
  };
  
  utterance.onerror = (event) => {
    console.error('Speech error:', event);
    isSpeaking = false;
  };
  
  synth.speak(utterance);
}

// Stop speaking
function stopSpeaking() {
  if (synth.speaking) {
    synth.cancel();
    isSpeaking = false;
  }
}

// Initialize voice recognition
function initVoiceRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    addMessage("Your browser doesn't support voice recognition.", false);
    return null;
  }
  
  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';
  
  recognition.onstart = () => {
    voiceBtn.innerHTML = '🔴';
    voiceBtn.style.backgroundColor = '#ef476f';
  };
  
  recognition.onend = () => {
    voiceBtn.innerHTML = '🎙️';
    voiceBtn.style.backgroundColor = '#06d6a0';
  };
  
  recognition.onerror = (event) => {
    console.error('Voice recognition error:', event.error);
    addMessage("Sorry, I couldn't understand that. Please try again.", false);
  };
  
  return recognition;
}

// Handle voice input
function startVoiceInput() {
  if (isSpeaking) {
    stopSpeaking();
    return;
  }
  
  if (!recognition) {
    recognition = initVoiceRecognition();
    if (!recognition) return;
  }
  
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    userInput.value = transcript;
    handleSend();
  };
  
  recognition.start();
}

// Send message to server
async function sendToServer(message) {
  showTyping();
  
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
    hideTyping();
    
    if (data.reply) {
      addMessage(data.reply, false);
      speak(data.reply);
    } else {
      addMessage("I didn't get a proper response. Please try again.", false);
    }
  } catch (error) {
    hideTyping();
    console.error('API Error:', error);
    addMessage("Sorry, I'm having trouble connecting. Please try again later.", false);
  }
}

// Handle send
function handleSend() {
  const message = userInput.value.trim();
  if (!message) return;
  
  addMessage(message, true);
  userInput.value = '';
  sendToServer(message);
}

// Event listeners
sendBtn.addEventListener('click', handleSend);
userInput.addEventListener('keypress', (e) => e.key === 'Enter' && handleSend());
voiceBtn.addEventListener('click', startVoiceInput);

// Suggestion buttons
suggestionBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    userInput.value = btn.textContent;
    handleSend();
  });
});

// Initial greeting
setTimeout(() => {
  const greeting = "Hi! I'm Dhruv's AI assistant. Ask me about my work, skills, or anything else!";
  addMessage(greeting, false);
  speak(greeting);
}, 1000);
