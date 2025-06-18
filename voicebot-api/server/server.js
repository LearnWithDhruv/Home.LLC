const express = require('express');
const cors = require('cors');
require('dotenv').config();
const OpenAI = require('openai');

const fetch = require('node-fetch');
const { Headers, Request, Response } = fetch;

globalThis.fetch = fetch;
globalThis.Headers = Headers;
globalThis.Request = Request;
globalThis.Response = Response;

(async () => {
  const { Blob } = await import('fetch-blob');
  const { FormData } = await import('formdata-node');

  globalThis.Blob = Blob;
  globalThis.FormData = FormData;

  const app = express();
  app.use(cors());
  app.use(express.json());

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  app.post('/chat', async (req, res) => {
    const { message } = req.body;

    // Validate input
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Invalid or missing message' });
    }

    try {
      const chatCompletion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo", // Updated to a more accessible model
        messages: [
          {
            role: "system",
            content: "You are a warm, articulate assistant answering personality questions honestly and thoughtfully like a real human.",
          },
          {
            role: "user",
            content: message,
          },
        ],
        max_tokens: 150, // Limit response length for faster processing
        temperature: 0.7, // Balanced creativity and coherence
      });

      const reply = chatCompletion.choices[0].message.content.trim();
      res.json({ reply });
    } catch (err) {
      console.error("OpenAI API Error:", err);
      res.status(500).json({ error: "Failed to get response from OpenAI. Please check your API key or try again later." });
    }
  });

  // Add a health check endpoint
  app.get('/', (req, res) => {
    res.json({ status: "Server is running", message: "Welcome to the VoiceBot API" });
  });

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
})();