// Mushroom species we support
export type MushroomSpecies = 'Oyster' | 'Shiitake' | 'Lions Mane' | 'Button' | 'Reishi';

// Sensor payload from the frontend
export interface SensorPayload {
  species?: MushroomSpecies;
  temperature_c?: number;
  humidity_pct?: number;
  co2_ppm?: number;
  light_lux?: number;
  substrate_moisture?: number;
  water_quality_index?: number;
}

// Chat message format
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Request body for the chatbot endpoint
export interface ChatbotRequest {
  sensorPayload?: SensorPayload;
  chatHistory: ChatMessage[];
  userMessage: string;
}

// ML Yield Prediction response
export interface MLPrediction {
  category: 'HIGH' | 'GOOD' | 'MEDIUM' | 'LOW';
  color: string;
  description: string;
  harvest_cycle: number;
  input?: {
    species: string;
    temperature_c: number;
    humidity_pct: number;
    co2_ppm: number;
    substrate_moisture: number;
    light_lux: number;
    water_quality_index: number;
  };
}

// Response from the chatbot endpoint
export interface ChatbotResponse {
  reply: string;
  newHistory: ChatMessage[];
  mlPrediction?: MLPrediction;  // ML model prediction
  error?: string;
}

// Ollama API request format
export interface OllamaRequest {
  model: string;
  messages: ChatMessage[];
  stream: boolean;
  options?: {
    temperature?: number;
    top_p?: number;
  };
}

// Ollama API response format
export interface OllamaResponse {
  model: string;
  created_at: string;
  message: ChatMessage;
  done: boolean;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  eval_count?: number;
}
