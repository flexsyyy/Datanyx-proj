# 🍄 Fungi Advisor Chatbot

An AI-powered mushroom cultivation expert that provides recommendations based on your grow room sensor data. Uses a local Ollama LLM model.

## Prerequisites

1. **Node.js** (v18+ recommended)
2. **Ollama** installed and running locally

## Quick Start

### 1. Install and Start Ollama

```bash
# Install Ollama (if not already installed)
# Windows: Download from https://ollama.ai
# macOS: brew install ollama
# Linux: curl -fsSL https://ollama.ai/install.sh | sh

# Start Ollama server
ollama serve

# Pull the model (in a new terminal)
ollama pull llama3.2:7b
```

### 2. Start the Chatbot Backend

```bash
cd chatbot/server
npm install
npm run dev
```

The server runs on http://localhost:3001

### 3. Start the Frontend

```bash
cd frontend-tests
npm install
npm run dev
```

Open http://localhost:5173/#/chatbot

## Architecture

```
chatbot/
├── server/                    # Express backend
│   ├── src/
│   │   ├── index.ts          # HTTP server entry point
│   │   ├── ollamaClient.ts   # Ollama API wrapper
│   │   ├── systemPrompt.ts   # Fungi expert system prompt
│   │   └── types.ts          # TypeScript interfaces
│   ├── package.json
│   └── tsconfig.json
└── README.md

frontend-tests/
└── src/
    ├── components/
    │   ├── ChatbotPage.tsx   # Main chatbot UI
    │   └── ChatbotPage.css   # Chatbot styles
    └── types/
        └── chatbot.ts        # Frontend type definitions
```

## API Endpoints

### `GET /api/health`
Check if Ollama is running and model is available.

**Response:**
```json
{
  "ok": true,
  "message": "Ollama is ready",
  "model": "llama3.2:7b"
}
```

### `POST /api/chatbot/fungi`
Send a message to the fungi expert.

**Request Body:**
```json
{
  "sensorPayload": {
    "species": "Oyster",
    "stage": "fruiting",
    "temperature_c": 20,
    "humidity_pct": 85,
    "co2_ppm": 800,
    "light_lux": 500,
    "substrate_moisture": "medium",
    "water_quality_index": 80,
    "airflow": "medium",
    "substrate_type": "straw",
    "ph": 6.5,
    "notes": "Some yellowing on caps"
  },
  "chatHistory": [],
  "userMessage": "What should I adjust to improve my yield?"
}
```

**Response:**
```json
{
  "reply": "**Overall Assessment:** Your conditions are generally good...",
  "newHistory": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}
```

## Configuration

Environment variables (create `.env` file in `chatbot/server/`):

```env
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3.2:7b
PORT=3001
```

## Supported Mushroom Species

1. **Button (Agaricus bisporus)** - Spawn run: 20–28°C, Fruiting: 12–18°C
2. **Oyster (Pleurotus)** - Spawn run: 20–25°C, Fruiting: 15–25°C
3. **Shiitake (Lentinula edodes)** - Fruiting: 10–16°C
4. **Milky (Calocybe indica)** - All stages: 30–32°C

## Sensor Data Fields

| Field | Description | Example |
|-------|-------------|---------|
| species | Mushroom type | Oyster |
| stage | Growth stage | fruiting |
| temperature_c | Temperature in Celsius | 20 |
| humidity_pct | Relative humidity % | 85 |
| co2_ppm | CO₂ concentration | 800 |
| light_lux | Light intensity | 500 |
| substrate_moisture | low/medium/high | medium |
| water_quality_index | 0-100 scale | 80 |
| airflow | FAE level | medium |
| substrate_type | Growing medium | straw |
| ph | Substrate pH | 6.5 |
| notes | Free text observations | - |

## Troubleshooting

### "Cannot connect to chatbot server"
- Make sure the backend is running: `cd chatbot/server && npm run dev`
- Check if port 3001 is available

### "Model not found"
- Pull the model: `ollama pull llama3.2:7b`
- Or change `OLLAMA_MODEL` to a model you have

### "Ollama server not responding"
- Start Ollama: `ollama serve`
- Check if running on port 11434

### Slow responses
- First query loads the model (can take 10-30s)
- Subsequent queries are faster
- Consider using a smaller model like `llama3.2:3b`

## Using Different Models

You can use any Ollama model by setting `OLLAMA_MODEL`:

```bash
# Smaller/faster
OLLAMA_MODEL=llama3.2:3b npm run dev

# Larger/smarter
OLLAMA_MODEL=llama3.2:70b npm run dev

# Other models
OLLAMA_MODEL=mistral:7b npm run dev
```

## Development

### Backend only
```bash
cd chatbot/server
npm run dev      # Watch mode
npm run start    # Production mode
```

### Frontend only
```bash
cd frontend-tests
npm run dev
```

### Both (use two terminals)
```bash
# Terminal 1
cd chatbot/server && npm run dev

# Terminal 2
cd frontend-tests && npm run dev
```

