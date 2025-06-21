require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('../public'));

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Dhruv Khatter's Personal Profile
const DHRUV_PROFILE = {
  name: "Dhruv Khatter",
  title: "Machine Learning Engineer",
  contact: "9817812811 | dhruvkhatter2003@gmail.com",
  
  lifeStory: `I'm Dhruv Khatter, a Machine Learning Engineer passionate about building AI that solves real-world problems. 
  My journey began with a love for mathematics at Sant Gyaneshwar Model School (97% in 12th CBSE), evolved through my 
  Computer Science degree at DCRUST (8.1 CGPA), and now focuses on developing production-grade ML systems. 
  I've interned at Scifor Technologies and Nelson Research, and currently build GenAI solutions at ThinkRobotics.`,

  superpower: `My #1 superpower is bridging theory and practice - whether it's breaking down complex ML concepts into 
  actionable insights, optimizing backend systems at Scifor, or implementing computer vision models at Nelson Research. 
  I combine technical depth (Top 1% in AI competitions) with practical deployment skills (Docker, Flask, cloud infra).`,

  growthAreas: `1) Scaling ML systems - currently leading edge device deployments at ThinkRobotics
  2) Cross-functional leadership - mentored 1000+ students as GDSC AI/ML Lead
  3) Advanced architectures - built RAG systems with Neo4j and won startup awards`,

  misconception: `People think I'm just an algorithm specialist, but my work spans full-stack implementation - 
  from REST APIs at Scifor to React/Next.js in my Friday SaaS project. I'm equally passionate about 
  ethical AI and making technology accessible through mentorship.`,

  pushingBoundaries: `I constantly challenge myself with projects outside my comfort zone:
  - Deployed models on edge devices (Jetson Nano/Raspberry Pi)
  - Built a cybersecurity RAG system with OCR and knowledge graphs
  - Won startup awards while maintaining top 4% Leetcode and 2% Kaggle rankings`,

  funFact: `I once trained a recipe-generation model that invented 'chocolate-chili pasta' - surprisingly delicious! 
  This experimental mindset carries into my professional work, like when I implemented SPARQL queries for 
  dynamic knowledge graph construction.`,

  education: `• B.Tech CSE (Data Science) @ DCRUST (8.1 CGPA)
• 12th CBSE @ Sant Gyaneshwar Model School (97%)
• Stanford Python, DeepLearning.AI certifications (94% avg)`,

  experience: `THINKROBOTICS (Current): Building GenAI on edge devices
NELSON RESEARCH: Computer vision + RAG systems
SCIFOR TECH: Backend APIs & cloud optimization`,

  achievements: `• Google DSC Lead | Smart India Hackathon Finalist
• Top 1% AI competitions | Microsoft Certified Data Analyst
• 200+ Leetcode (Top 4%) | Kaggle Expert (Top 2%)
• Best Startup Award @ India Electronics Expo 2025`,

  projects: `CYBERSECURITY RAG: Neo4j+LangChain system
KNOWLEDGE GRAPH CONSTRUCTOR: With D3.js visualization
FRIDAY SAAS: GPT-4 powered multi-tool platform`,

  skills: `LANGUAGES: Python, C++, TypeScript, SQL
ML: CV, NLP, LLMs, U-Net/CNN/RNN
TOOLS: Docker, Flask, React, Next.js, ROS`
};

const PERSONAL_QUESTIONS = {
  // Personal identity
  'life story|about you|background|who are you': DHRUV_PROFILE.lifeStory,
  'contact|email|phone|how to reach you': `You can reach me at ${DHRUV_PROFILE.contact} or through my LinkedIn/Github profiles.`,
  
  // Professional strengths
  'superpower|best at|strength|what are you good at': DHRUV_PROFILE.superpower,
  'skills|technologies|what do you know': `My technical toolkit includes:\n${DHRUV_PROFILE.skills}`,
  
  // Growth
  'grow|improve|growth areas|what are you working on': DHRUV_PROFILE.growthAreas,
  'learn|studying|courses': DHRUV_PROFILE.education,
  
  // Experience
  'experience|work|jobs|internships': DHRUV_PROFILE.experience,
  'projects|build|developed': `Notable projects:\n${DHRUV_PROFILE.projects}`,
  
  // Achievements
  'achievements|awards|accomplishments': DHRUV_PROFILE.achievements,
  'leetcode|kaggle|coding': `I maintain competitive programming skills:\n${DHRUV_PROFILE.achievements.split('\n')[3]}`,
  
  // Personal insights
  'misconception|wrong about you|misunderstand': DHRUV_PROFILE.misconception,
  'boundaries|limits|challenge|how do you push yourself': DHRUV_PROFILE.pushingBoundaries,
  'fun fact|interesting thing|something surprising': DHRUV_PROFILE.funFact,
  
  // Education
  'education|degree|school|college': DHRUV_PROFILE.education,
  'grades|marks|cgpa': `Academic performance:\n${DHRUV_PROFILE.education}`
};

app.post('/chat', async (req, res) => {
  const { message } = req.body;
  
  // Check if it's a personal question
  for (const [pattern, response] of Object.entries(PERSONAL_QUESTIONS)) {
    if (new RegExp(pattern, 'i').test(message)) {
      return res.json({ reply: response });
    }
  }

  // Fall back to Groq API for other questions
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an AI assistant helping to represent Dhruv Khatter, a Machine Learning Engineer. 
                  For personal questions about Dhruv, refer to this context:
                  ${JSON.stringify(DHRUV_PROFILE, null, 2)}
                  
                  Otherwise, respond as a helpful, knowledgeable assistant with Dhruv's tone:
                  - Technical but approachable
                  - Enthusiastic about AI/ML
                  - Professional yet friendly`
        },
        {
          role: "user",
          content: message
        }
      ],
      model: "mixtral-8x7b-32768",
      temperature: 0.7,
      max_tokens: 1024
    });

    const reply = chatCompletion.choices[0]?.message?.content || "I'm not sure how to respond to that.";
    res.json({ reply });
  } catch (error) {
    console.error("Groq API Error:", error);
    res.status(500).json({ 
      reply: "I'm having some technical difficulties. Please try again in a moment." 
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
