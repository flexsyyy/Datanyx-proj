// Mushroom species we support
export type MushroomSpecies = 'Oyster' | 'Shiitake' | 'Lions Mane' | 'Button' | 'Reishi';

// Sensor payload for the chatbot
export interface SensorPayload {
  species: MushroomSpecies;
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

// ML Yield Prediction from the model
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
  mlPrediction?: MLPrediction;
  error?: string;
}

// Default sensor values
export const DEFAULT_SENSOR_PAYLOAD: SensorPayload = {
  species: 'Oyster',
  temperature_c: 20,
  humidity_pct: 85,
  co2_ppm: 800,
  light_lux: 500,
  substrate_moisture: 65,
  water_quality_index: 80,
};
