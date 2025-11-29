"""
FastAPI Backend for Mushroom Yield Prediction
Connects to the XGBoost ML model and predicts harvest cycle
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Literal
import joblib
import pandas as pd
import os

# Initialize FastAPI app
app = FastAPI(
    title="Mushroom Yield Predictor API",
    description="Predicts harvest cycle based on environmental conditions",
    version="1.0.0"
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the ML model
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(SCRIPT_DIR, "xgb_mushroom_model.joblib")

print(f"Loading model from: {MODEL_PATH}")
model = joblib.load(MODEL_PATH)
print("[OK] Model loaded successfully!")

# Feature columns in the exact order used during training
FEATURES = [
    "humidity_pct",
    "CO2_ppm",
    "substrate_moisture_pct",
    "light_lux",
    "water_quality_index",
    "temp_C",
    "mushroom_variety_Button",
    "mushroom_variety_Lions Mane",
    "mushroom_variety_Oyster",
    "mushroom_variety_Reishi",
    "mushroom_variety_Shiitake"
]

# Mushroom varieties (order matters for one-hot encoding)
MUSHROOM_VARIETIES = ["Button", "Lions Mane", "Oyster", "Reishi", "Shiitake"]


# Request model
class PredictionRequest(BaseModel):
    species: Literal["Oyster", "Shiitake", "Lions Mane", "Button", "Reishi"] = Field(
        ..., description="Mushroom species"
    )
    humidity: float = Field(..., ge=0, le=100, description="Humidity percentage (0-100)")
    co2: float = Field(..., ge=0, description="CO2 concentration in ppm")
    substrate_moisture: float = Field(..., ge=0, le=100, description="Substrate moisture percentage")
    light_intensity: float = Field(..., ge=0, description="Light intensity in lux")
    water_quality: float = Field(..., ge=0, le=100, description="Water quality index (0-100)")
    temperature: float = Field(..., description="Temperature in Celsius")


# Response model
class PredictionResponse(BaseModel):
    harvest_cycle: int = Field(..., description="Predicted harvest cycle (3-6)")
    yield_category: Literal["HIGH", "GOOD", "MEDIUM", "LOW"] = Field(
        ..., description="Yield classification"
    )
    yield_color: str = Field(..., description="Color code for the yield category")
    description: str = Field(..., description="Description of the prediction")
    input_received: dict = Field(..., description="Input data that was processed")


def classify_yield(harvest_cycle: int) -> dict:
    """Classify harvest cycle into yield category"""
    if harvest_cycle == 6:
        return {
            "yield_category": "HIGH",
            "yield_color": "#4ade80",
            "description": "Excellent conditions! Expected high yield."
        }
    elif harvest_cycle == 5:
        return {
            "yield_category": "GOOD",
            "yield_color": "#a3e635",
            "description": "Good conditions. Healthy yield expected."
        }
    elif harvest_cycle == 4:
        return {
            "yield_category": "MEDIUM",
            "yield_color": "#fbbf24",
            "description": "Moderate conditions. Some adjustments recommended."
        }
    else:  # harvest_cycle == 3
        return {
            "yield_category": "LOW",
            "yield_color": "#f87171",
            "description": "Suboptimal conditions. Significant improvements needed."
        }


@app.get("/")
async def root():
    """Root endpoint with API info"""
    return {
        "name": "Mushroom Yield Predictor API",
        "version": "1.0.0",
        "endpoints": {
            "predict": "POST /predict",
            "health": "GET /health"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "model_loaded": True,
        "features": FEATURES,
        "varieties": MUSHROOM_VARIETIES
    }


@app.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    """
    Predict harvest cycle based on environmental conditions
    
    Returns harvest cycle (3-6) and yield classification (HIGH/GOOD/MEDIUM/LOW)
    """
    try:
        # Prepare features with one-hot encoding
        features = {
            "humidity_pct": request.humidity,
            "CO2_ppm": request.co2,
            "substrate_moisture_pct": request.substrate_moisture,
            "light_lux": request.light_intensity,
            "water_quality_index": request.water_quality,
            "temp_C": request.temperature,
        }
        
        # One-hot encode mushroom variety
        for variety in MUSHROOM_VARIETIES:
            features[f"mushroom_variety_{variety}"] = 1 if request.species == variety else 0
        
        # Create DataFrame with correct feature order
        df_input = pd.DataFrame([features])[FEATURES]
        
        # Predict using the model (XGBoost returns 0-3 -> shift to 3-6)
        raw_prediction = model.predict(df_input)[0]
        harvest_cycle = int(raw_prediction + 3)
        
        # Get yield classification
        yield_info = classify_yield(harvest_cycle)
        
        print(f"[PREDICT] {request.species} -> Cycle {harvest_cycle} ({yield_info['yield_category']})")
        
        return PredictionResponse(
            harvest_cycle=harvest_cycle,
            yield_category=yield_info["yield_category"],
            yield_color=yield_info["yield_color"],
            description=yield_info["description"],
            input_received={
                "species": request.species,
                "humidity": request.humidity,
                "co2": request.co2,
                "substrate_moisture": request.substrate_moisture,
                "light_intensity": request.light_intensity,
                "water_quality": request.water_quality,
                "temperature": request.temperature
            }
        )
        
    except Exception as e:
        print(f"[ERROR] Prediction failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    PORT = int(os.environ.get("PORT", 8000))
    print(f"\n[FastAPI] Starting server on http://localhost:{PORT}")
    print(f"   Docs: http://localhost:{PORT}/docs")
    print(f"   Health: http://localhost:{PORT}/health")
    print(f"   Predict: POST http://localhost:{PORT}/predict\n")
    uvicorn.run(app, host="0.0.0.0", port=PORT)


