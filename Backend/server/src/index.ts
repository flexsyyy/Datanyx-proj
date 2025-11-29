import express from 'express';
import cors from 'cors';
import { askFungiExpert, checkOllamaHealth } from './ollamaClient.js';
import { ChatbotRequest, ChatbotResponse } from './types.js';

// Load environment variables
const PORT = process.env.PORT || 3001;

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', async (_req, res) => {
  const health = await checkOllamaHealth();
  res.json(health);
});

// Main chatbot endpoint
app.post('/api/chatbot/fungi', async (req, res) => {
  try {
    const body: ChatbotRequest = req.body;
    const { sensorPayload, chatHistory = [], userMessage } = body;
    
    // Validate request
    if (!userMessage && !sensorPayload) {
      res.status(400).json({
        reply: '',
        newHistory: chatHistory,
        error: 'Either userMessage or sensorPayload is required',
      } as ChatbotResponse);
      return;
    }
    
    console.log(`[${new Date().toISOString()}] Fungi chatbot request:`, {
      hasPayload: !!sensorPayload,
      species: sensorPayload?.species,
      stage: sensorPayload?.stage,
      messageLength: userMessage?.length,
      historyLength: chatHistory.length,
    });
    
    // Call Ollama
    const result = await askFungiExpert({
      sensorPayload,
      chatHistory,
      freeTextQuestion: userMessage,
    });
    
    console.log(`[${new Date().toISOString()}] Fungi chatbot response: ${result.reply.substring(0, 100)}...`);
    
    const response: ChatbotResponse = {
      reply: result.reply,
      newHistory: result.newHistory,
    };
    
    res.json(response);
  } catch (error) {
    console.error('Chatbot error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    res.status(500).json({
      reply: '',
      newHistory: req.body?.chatHistory || [],
      error: `Failed to get response: ${errorMessage}`,
    } as ChatbotResponse);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🍄 Fungi Chatbot Server running on http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health`);
  console.log(`   Chatbot API:  POST http://localhost:${PORT}/api/chatbot/fungi\n`);
  
  // Check Ollama on startup
  checkOllamaHealth().then(health => {
    if (health.ok) {
      console.log(`✅ Ollama ready with model: ${health.model}`);
    } else {
      console.warn(`⚠️  ${health.message}`);
    }
  });
});

