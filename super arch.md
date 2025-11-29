## Datanyx Project – Super Architecture

This document provides a comprehensive, high-signal overview of the Datanyx project: architecture, services, key files, APIs, and core functions. It covers both the current AWS_test frontend + Chatbot + ML services, as well as the additional frontend introduced via the `src/` directory after merging branches.

### High-Level System
- **Frontend (AWS_test)**: Vite + React TypeScript app for live monitor, dataset browser, ML predictor, and the fungi chatbot UI.
- **Chatbot Backend (Backend/server)**: Express server that calls a local Ollama LLM and (optionally) the ML API, returning expert guidance.
- **ML API (Backend/ML model)**: Model-serving layer that predicts harvest cycle and yield category from sensor data.
- **External AWS APIs**:
  - Live status endpoint for the monitor page.
  - Dataset endpoint for browsing historical data.

Data flow (typical):
1) AWS_test → dataset/status (AWS) for monitoring/browsing
2) AWS_test → Chatbot Backend → Ollama (+ optional ML API) for expert suggestions
3) AWS_test → ML API (direct, on the “ML Predictor” page) for yield prediction


## Services and Ports
- Chatbot Backend (Express): http://localhost:3001
- ML API (Flask): http://localhost:3002
- ML API (FastAPI alternative): http://localhost:8000
- Frontend (AWS_test): http://localhost:5173
- Ollama: http://localhost:11434

Use `start_all.py` to boot the default stack (Flask ML API + Express + AWS_test + Ollama):

```12:22:S:\Projects\Datanyx-proj\start_all.py
Services:
• ML Yield Predictor   - http://localhost:3002
• Chatbot Backend      - http://localhost:3001
• Frontend             - http://localhost:5173
• Ollama LLM           - http://localhost:11434
```


## Directory Structure (Key)
- `AWS_test/` – Main React SPA (monitor, dataset, chatbot UI, ML predictor)
  - `src/App.tsx` – Hash-based router for pages
  - `src/config.ts` – API constants + dataset fetcher
  - `src/components/` – Pages and UI (Monitor, Chatbot, Predictor)
  - `src/types/` – Chatbot DTOs
- `Backend/`
  - `server/` – Express chatbot backend (Ollama + ML API integration)
    - `src/index.ts` – HTTP endpoints
    - `src/ollamaClient.ts` – Ollama + ML glue
    - `src/systemPrompt.ts` – Fungi expert system prompt
    - `src/types.ts` – Shared server types
  - `ML model/` – Model serving
    - `ml_api.py` – Flask server at `:3002` (default used by Chatbot)
    - `fastapi_server.py` – Alternative FastAPI at `:8000` (used by ML Predictor page)
    - `pythonml.py` – Thin model wrapper (no HTTP)
    - `xgb_mushroom_model.joblib` – Trained model
- `src/` – Additional modern React app (pages: Dashboard, LiveMonitor, etc.) with a built-in, UI-only chatbot widget
- `test_FE/` – Prior frontend test implementation (includes `types/sensor.ts` and `store/sensorHistory.ts` that mirror AWS_test needs)
- `start_all.py` – Orchestration script


## APIs

### 1) External AWS APIs (used by Frontend)
- **Status API** (Monitor page live data)
  - URL: from `AWS_test/src/config.ts` → `API_URL`
  - Example: `https://a9tpfpdyxh.execute-api.ap-south-1.amazonaws.com/status`
  - Response shape (simplified):
    - `{ data: SensorReading[] }` with fields `device_id`, `timestamp`, `temperature_c`, `humidity_pct`, `co2_ppm`, `light_lux`, etc.

- **Dataset API** (Dataset browser)
  - URL: from `AWS_test/src/config.ts` → `DATASET_API_URL`
  - Default: `https://wcwmzfhxsc.execute-api.ap-south-1.amazonaws.com/prod/dataset`
  - Query params: `species?` (Oyster/Shiitake/Lions Mane/Button/Reishi), `limit` (default 200)
  - Returns array of rows with keys: `timestamp`, `humidity_pct`, `CO2_ppm`, `substrate_moisture_pct`, `light_lux`, `water_quality_index`, `temp_C`, `harvest_cycle`, `mushroom_variety`

```39:50:S:\Projects\Datanyx-proj\AWS_test\src\config.ts
export async function fetchFungiDataset(options: FetchDatasetOptions = {}): Promise<FungiRow[]> {
  const { species, limit = 200 } = options;
  const params = new URLSearchParams();
  params.set('limit', String(limit));
  if (species) params.set('species', species);
  const url = `${DATASET_API_URL}?${params.toString()}`;
  const response = await fetch(url, { cache: 'no-store' });
```


### 2) ML API (Model Serving)
There are two interchangeable implementations:

- Flask (Default, used by Chatbot): http://localhost:3002
  - `GET /api/health` → service info + features
  - `POST /api/predict` → predict harvest cycle and yield classification
    - Body:
      - `species`, `temperature_c`, `humidity_pct`, `co2_ppm`, `light_lux`, `substrate_moisture`, `water_quality_index`
    - Returns:
      - `{ category, color, description, harvest_cycle, input: { ... } }`
    - Mapping: harvest_cycle 6=HIGH, 5=GOOD, 4=MEDIUM, 3=LOW

```118:131:S:\Projects\Datanyx-proj\Backend\ML model\ml_api.py
@app.route('/api/predict', methods=['POST'])
def predict():
    """
    Predict harvest cycle and yield classification
    Expected JSON body: { species, temperature_c, humidity_pct, co2_ppm, light_lux, substrate_moisture, water_quality_index }
    """
```

```44:61:S:\Projects\Datanyx-proj\Backend\ML model\ml_api.py
def classify_yield(harvest_cycle: int) -> dict:
    # 6: HIGH, 5: GOOD, 4: MEDIUM, 3: LOW
    if harvest_cycle == 6:
        return { "category": "HIGH", "color": "#4ade80", "description": "Excellent conditions!", "harvest_cycle": harvest_cycle }
    elif harvest_cycle == 5:
        return { "category": "GOOD", "color": "#a3e635", "description": "Good conditions.", "harvest_cycle": harvest_cycle }
```

- FastAPI (Alternative, used by ML Predictor page): http://localhost:8000
  - `GET /health`
  - `POST /predict` → similar semantics but field names match its request model (`humidity`, `co2`, `light_intensity`, etc.)
  - UI text in `AWS_test` reflects: “6 = high yield, 3 = low yield”

```133:147:S:\Projects\Datanyx-proj\Backend\ML model\fastapi_server.py
@app.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    # Prepare features, one-hot encode species, model.predict -> (0..3) + 3 → (3..6)
    # Return harvest_cycle, yield_category, yield_color, description, input_received
```


### 3) Chatbot Backend (Express, Ollama integration)
- Base URL: http://localhost:3001
- Endpoints:
  - `GET /api/health` → Ollama health + model presence
  - `POST /api/chatbot/fungi` → Accepts chat + optional sensor payload, returns LLM reply (+ optional ML prediction pass-through)

```15:23:S:\Projects\Datanyx-proj\Backend\server\src\index.ts
// Health check endpoint
app.get('/api/health', async (_req, res) => {
  const health = await checkOllamaHealth();
  res.json(health);
});
```

```21:31:S:\Projects\Datanyx-proj\Backend\server\src\index.ts
// Main chatbot endpoint
app.post('/api/chatbot/fungi', async (req, res) => {
  const body: ChatbotRequest = req.body;
  const { sensorPayload, chatHistory = [], userMessage } = body;
  // validation, call askFungiExpert(...), return ChatbotResponse
```

- Server types and shapes:
```21:31:S:\Projects\Datanyx-proj\Backend\server\src\types.ts
export interface ChatbotRequest {
  sensorPayload?: SensorPayload;
  chatHistory: ChatMessage[];
  userMessage: string;
}
```

```28:34:S:\Projects\Datanyx-proj\Backend\server\src\types.ts
export interface MLPrediction {
  category: 'HIGH' | 'GOOD' | 'MEDIUM' | 'LOW';
  color: string;
  description: string;
  harvest_cycle: number;
}
```

- Ollama + ML integration points:
```12:25:S:\Projects\Datanyx-proj\Backend\server\src\ollamaClient.ts
export async function getMLPrediction(payload: SensorPayload): Promise<MLPrediction | null> {
  const response = await fetch(`${ML_API_URL}/api/predict`, { method: 'POST', ... });
  const prediction: MLPrediction = await response.json();
  return prediction;
}
```

```114:131:S:\Projects\Datanyx-proj\Backend\server\src\ollamaClient.ts
export async function askFungiExpert(params: { sensorPayload?: SensorPayload; chatHistory: ChatMessage[]; freeTextQuestion?: string; }) {
  // (1) Optionally call ML API for prediction
  // (2) Build user message including sensor + ML context
  // (3) Call Ollama /api/chat
  // (4) Return assistant reply + new history + mlPrediction
}
```

```188:214:S:\Projects\Datanyx-proj\Backend\server\src\ollamaClient.ts
export async function checkOllamaHealth() {
  // Calls OLLAMA_HOST/api/tags and verifies OLLAMA_MODEL presence
}
```


## Frontend (AWS_test) – Pages and Core Functions

### Router and Pages
`AWS_test/src/App.tsx` provides hash routes:
- `#/monitor` → Live sensor monitor
- `#/history` → Sensor history (store-backed; see note below)
- `#/dataset` → AWS dataset browser (filter by species; default limit)
- `#/predictor` → ML predictor (FastAPI)
- `#/chatbot` → Fungi advisor chatbot (Express + Ollama)

```221:233:S:\Projects\Datanyx-proj\AWS_test\src\App.tsx
switch (route) {
  case '#/history': return <SensorHistoryPage />;
  case '#/chatbot': return <ChatbotPage />;
  case '#/dataset': return <DatasetPage />;
  case '#/predictor': return <MLPredictorPage />;
  default: return <MushroomMonitorPage />;
}
```

Note: `SensorHistoryPage` and `types/sensor`/`store/sensorHistory` exist in `test_FE/`. If you intend to use history in `AWS_test`, ensure those modules are copied or imported consistently.


### Live Monitor (`MushroomMonitorPage.tsx`)
- Polls AWS status API every 3s
- Adds random variation to improve UI dynamics
- Computes metric and overall status (good/warning/bad)
- Rotates displayed mushroom type over time
- Writes entries into history store

Key helpers:
```31:49:S:\Projects\Datanyx-proj\AWS_test\src\components\MushroomMonitorPage.tsx
const getMetricStatus = (...) => { ... };
const calculateOverallStatus = (...) => { ... };
```

```61:70:S:\Projects\Datanyx-proj\AWS_test\src\components\MushroomMonitorPage.tsx
const smoothValue = (...) => oldValue + 0.4 * (newValue - oldValue);
const addVariation = (...) => value + randomDelta;
```

```72:80:S:\Projects\Datanyx-proj\AWS_test\src\components\MushroomMonitorPage.tsx
const fetchSensorData = async () => {
  const response = await fetch(API_URL, { cache: 'no-store' });
  const data: ApiResponse = await response.json();
  // pick latest reading, add variation, compute status, push to history
};
```


### Chatbot UI (`ChatbotPage.tsx`)
- Sends `ChatbotRequest` to `http://localhost:3001/api/chatbot/fungi`
- Optionally includes sensor payload
- Displays returned `newHistory` and ML prediction (if provided)

```55:76:S:\Projects\Datanyx-proj\AWS_test\src\components\ChatbotPage.tsx
const handleSendMessage = async () => {
  const requestBody = { sensorPayload, chatHistory, userMessage };
  const response = await fetch(CHATBOT_API_URL, { method: 'POST', ... });
  const data: ChatbotResponse = await response.json();
  setChatHistory(data.newHistory);
  if (data.mlPrediction) setMlPrediction(data.mlPrediction);
}
```


### ML Predictor (`MLPredictorPage.tsx`)
- Calls FastAPI service (`http://localhost:8000/predict`)
- Uses request fields: `species, humidity, co2, substrate_moisture, light_intensity, water_quality, temperature`
- Presents yield badge + harvest cycle

```56:82:S:\Projects\Datanyx-proj\AWS_test\src\components\MLPredictorPage.tsx
const handleSubmit = async (e) => {
  const response = await fetch(`${FASTAPI_URL}/predict`, { method: 'POST', ... });
  const result: PredictionResult = await response.json();
  setPrediction(result);
};
```


## Backend (Express) – Core Functions

### `askFungiExpert(...)`
- Optionally fetches ML prediction (`getMLPrediction`)
- Builds user message consolidating sensor data + ML insights
- Calls Ollama `/api/chat` and returns assistant reply with updated history

```114:131:S:\Projects\Datanyx-proj\Backend\server\src\ollamaClient.ts
export async function askFungiExpert(params) {
  let mlPrediction: MLPrediction | null = null;
  if (sensorPayload) mlPrediction = await getMLPrediction(sensorPayload);
  const userContent = buildUserMessage(sensorPayload, freeTextQuestion, mlPrediction);
  const messages = [{ role: 'system', content: FUNGI_EXPERT_SYSTEM_PROMPT }, ...chatHistory, { role: 'user', content: userContent }];
  // POST to OLLAMA_HOST/api/chat
}
```

### `getMLPrediction(...)`
- POSTs standardized payload to ML API (Flask by default at `ML_API_URL`)

```12:25:S:\Projects\Datanyx-proj\Backend\server\src\ollamaClient.ts
export async function getMLPrediction(payload: SensorPayload): Promise<MLPrediction | null> { /* ... */ }
```

### `checkOllamaHealth()`
- Verifies server responsiveness and model availability

```188:214:S:\Projects\Datanyx-proj\Backend\server\src\ollamaClient.ts
export async function checkOllamaHealth(): Promise<{ ok: boolean; message: string; model: string }> { /* ... */ }
```


## Model Serving (ML model)

### Flask (`ml_api.py`) – default for Chatbot Backend
- `classify_yield(harvest_cycle)`
- `prepare_features(data)` – input mapping + one-hot species
- `GET /api/health`
- `POST /api/predict` – returns `{category,color,description,harvest_cycle,input}`

```84:104:S:\Projects\Datanyx-proj\Backend\ML model\ml_api.py
def prepare_features(data: dict) -> dict:
    features = { ... } # humidity_pct, CO2_ppm, substrate_moisture_pct, light_lux, water_quality_index, temp_C
    for variety in MUSHROOM_VARIETIES:
        features[f"mushroom_variety_{variety}"] = 1 if species == variety else 0
    return features
```

### FastAPI (`fastapi_server.py`) – used by ML Predictor page
- Pydantic `PredictionRequest`/`PredictionResponse`
- Same one-hot + model pipeline
- `GET /health`, `POST /predict`


## Environment Variables (Key)
- Chatbot Backend:
  - `PORT` (default 3001)
  - `OLLAMA_HOST` (default `http://localhost:11434`)
  - `OLLAMA_MODEL` (e.g., `llama3` or `llama3.2:7b`)
  - `ML_API_URL` (default `http://localhost:3002` for Flask) – The code calls `${ML_API_URL}/api/predict`
- ML API (Flask):
  - `ML_PORT` (default 3002)
- ML API (FastAPI):
  - `PORT` (default 8000)
- Frontend (AWS_test):
  - `VITE_FUNGI_DATASET_API` (optional override for dataset endpoint)


## Run Commands
- One shot (recommended): `python start_all.py`
- Individually:
  - ML API (Flask): `cd Backend/ML model && python ml_api.py`
  - ML API (FastAPI): `cd Backend/ML model && python fastapi_server.py`
  - Chatbot Backend: `cd Backend/server && npm run dev`
  - Frontend: `cd AWS_test && npm run dev`
  - Ollama: `ollama serve` (+ `ollama pull llama3` if required)


## File Map (Selected)
- Frontend: `AWS_test/src/components/`
  - `MushroomMonitorPage.tsx` – live polling, smoothing, status computation
  - `ChatbotPage.tsx` – LLM chat UI, ML panel
  - `MLPredictorPage.tsx` – direct ML predictions (FastAPI)
  - `.../*.css` – styles
- Chatbot Backend:
  - `src/index.ts` – `/api/health`, `/api/chatbot/fungi`
  - `src/ollamaClient.ts` – `getMLPrediction`, `askFungiExpert`, `checkOllamaHealth`
  - `src/systemPrompt.ts` – `FUNGI_EXPERT_SYSTEM_PROMPT`
  - `src/types.ts` – DTOs (`SensorPayload`, `ChatbotRequest`, `ChatbotResponse`, `MLPrediction`, `OllamaRequest/Response`)
- ML Model:
  - `ml_api.py` (Flask) and `fastapi_server.py` (FastAPI)
  - `pythonml.py` core `predict_yield(input)` function (non-HTTP helper)


## Notes and Consistency
- Yield scale conventions differ across earlier versions; this repo’s live UIs align on “6 = high yield, 3 = low yield,” which matches the Flask and FastAPI implementations shown.
- `AWS_test` history store/types are located in `test_FE/src/store` and `test_FE/src/types`. If using history in `AWS_test`, copy or import those modules to avoid missing imports.
- The `src/` React app includes a UI-only chatbot component (`src/components/Chatbot.tsx`) that does not hit the Express backend; it provides a simple guided assistant for that app.


## Appendix – System Prompt
```1:8:S:\Projects\Datanyx-proj\Backend\server\src\systemPrompt.ts
export const FUNGI_EXPERT_SYSTEM_PROMPT = `You are a mushroom cultivation and fungi health expert assistant.
You will receive sensor data ... Provide specific, actionable recommendations
`;
```



