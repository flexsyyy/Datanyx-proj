import { ChatMessage, OllamaRequest, OllamaResponse, SensorPayload, MLPrediction } from './types.js';
import { FUNGI_EXPERT_SYSTEM_PROMPT } from './systemPrompt.js';

// Configuration
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3';
const ML_API_URL = process.env.ML_API_URL || 'http://localhost:3002';

/**
 * Call the ML API to get yield prediction
 */
export async function getMLPrediction(payload: SensorPayload): Promise<MLPrediction | null> {
  try {
    const response = await fetch(`${ML_API_URL}/api/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        species: payload.species || 'Oyster',
        temperature_c: payload.temperature_c ?? 22,
        humidity_pct: payload.humidity_pct ?? 85,
        co2_ppm: payload.co2_ppm ?? 800,
        light_lux: payload.light_lux ?? 200,
        substrate_moisture: payload.substrate_moisture ?? 65,
        water_quality_index: payload.water_quality_index ?? 80,
      }),
    });
    
    if (!response.ok) {
      console.error(`ML API error: ${response.status}`);
      return null;
    }
    
    const prediction: MLPrediction = await response.json();
    console.log(`🧠 ML Prediction: ${prediction.category} (Cycle ${prediction.harvest_cycle})`);
    return prediction;
  } catch (error) {
    console.error('Failed to get ML prediction:', error);
    return null;
  }
}

/**
 * Format sensor payload into a readable string for the LLM
 */
function formatSensorData(payload: SensorPayload): string {
  const lines: string[] = [];
  
  if (payload.species) {
    lines.push(`**Mushroom Species:** ${payload.species}`);
  }
  if (payload.temperature_c !== undefined) {
    lines.push(`**Temperature:** ${payload.temperature_c}°C`);
  }
  if (payload.humidity_pct !== undefined) {
    lines.push(`**Humidity:** ${payload.humidity_pct}%`);
  }
  if (payload.co2_ppm !== undefined) {
    lines.push(`**CO2 Concentration:** ${payload.co2_ppm} ppm`);
  }
  if (payload.light_lux !== undefined) {
    lines.push(`**Light Intensity:** ${payload.light_lux} lux`);
  }
  if (payload.substrate_moisture !== undefined) {
    lines.push(`**Substrate Moisture Level:** ${payload.substrate_moisture}%`);
  }
  if (payload.water_quality_index !== undefined) {
    lines.push(`**Water Quality Index:** ${payload.water_quality_index}/100`);
  }
  
  return lines.join('\n');
}

/**
 * Build the user message combining sensor data, ML prediction, and free-text question
 */
function buildUserMessage(sensorPayload?: SensorPayload, freeTextQuestion?: string, mlPrediction?: MLPrediction | null): string {
  const parts: string[] = [];
  
  if (sensorPayload) {
    parts.push('Here is my current grow room sensor data:\n');
    parts.push(formatSensorData(sensorPayload));
    parts.push('');
  }
  
  // Include ML prediction in the message
  if (mlPrediction) {
    parts.push('---');
    parts.push(`**🧠 ML Model Yield Prediction:** ${mlPrediction.category}`);
    parts.push(`**Predicted Harvest Cycle:** ${mlPrediction.harvest_cycle} (3=fastest, 6=slowest)`);
    parts.push(`**Assessment:** ${mlPrediction.description}`);
    parts.push('---\n');
    
    // Add context for the LLM based on prediction
    if (mlPrediction.category === 'LOW' || mlPrediction.category === 'MEDIUM') {
      parts.push('The ML model predicts suboptimal yield. Please analyze which parameters should be adjusted (increased or decreased) to improve the harvest cycle and increase yield.');
    } else {
      parts.push('The ML model predicts good yield. Please confirm if these conditions are optimal and suggest any fine-tuning to maintain or improve performance.');
    }
    parts.push('');
  }
  
  if (freeTextQuestion) {
    parts.push(freeTextQuestion);
  } else if (sensorPayload) {
    parts.push('Please analyze these conditions and provide specific recommendations on which values to increase or decrease for better yield.');
  }
  
  return parts.join('\n');
}

/**
 * Call Ollama API with the fungi expert context
 */
export async function askFungiExpert(params: {
  sensorPayload?: SensorPayload;
  chatHistory: ChatMessage[];
  freeTextQuestion?: string;
}): Promise<{ reply: string; newHistory: ChatMessage[]; mlPrediction?: MLPrediction | null }> {
  const { sensorPayload, chatHistory, freeTextQuestion } = params;
  
  // Get ML prediction if sensor data is provided
  let mlPrediction: MLPrediction | null = null;
  if (sensorPayload) {
    mlPrediction = await getMLPrediction(sensorPayload);
  }
  
  // Build the user message with ML prediction included
  const userContent = buildUserMessage(sensorPayload, freeTextQuestion, mlPrediction);
  const userMessage: ChatMessage = { role: 'user', content: userContent };
  
  // Build messages array: system + history + new user message
  const messages: ChatMessage[] = [
    { role: 'system', content: FUNGI_EXPERT_SYSTEM_PROMPT },
    ...chatHistory,
    userMessage,
  ];
  
  // Prepare Ollama request
  const ollamaRequest: OllamaRequest = {
    model: OLLAMA_MODEL,
    messages,
    stream: false,
    options: {
      temperature: 0.3,
      top_p: 0.9,
    },
  };
  
  // Call Ollama API
  const response = await fetch(`${OLLAMA_HOST}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(ollamaRequest),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ollama API error (${response.status}): ${errorText}`);
  }
  
  const ollamaResponse: OllamaResponse = await response.json();
  
  // Extract assistant reply
  const assistantMessage: ChatMessage = {
    role: 'assistant',
    content: ollamaResponse.message.content,
  };
  
  // Build new history (excluding system message)
  const newHistory: ChatMessage[] = [
    ...chatHistory,
    userMessage,
    assistantMessage,
  ];
  
  return {
    reply: assistantMessage.content,
    newHistory,
    mlPrediction,
  };
}

/**
 * Check if Ollama is running and the model is available
 */
export async function checkOllamaHealth(): Promise<{ ok: boolean; message: string; model: string }> {
  try {
    // Check if Ollama is running
    const tagsResponse = await fetch(`${OLLAMA_HOST}/api/tags`);
    if (!tagsResponse.ok) {
      return { ok: false, message: 'Ollama server not responding', model: OLLAMA_MODEL };
    }
    
    const tags = await tagsResponse.json();
    const models = tags.models || [];
    const modelNames = models.map((m: { name: string }) => m.name);
    
    // Check if our model is available
    const modelAvailable = modelNames.some((name: string) => 
      name === OLLAMA_MODEL || name.startsWith(OLLAMA_MODEL.split(':')[0])
    );
    
    if (!modelAvailable) {
      return {
        ok: false,
        message: `Model "${OLLAMA_MODEL}" not found. Available: ${modelNames.join(', ') || 'none'}. Run: ollama pull ${OLLAMA_MODEL}`,
        model: OLLAMA_MODEL,
      };
    }
    
    return { ok: true, message: 'Ollama is ready', model: OLLAMA_MODEL };
  } catch (error) {
    return {
      ok: false,
      message: `Cannot connect to Ollama at ${OLLAMA_HOST}. Is it running?`,
      model: OLLAMA_MODEL,
    };
  }
}
