"""
ML API Server for Mushroom Yield Prediction
Exposes the XGBoost model via a REST API
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import os

app = Flask(__name__)
CORS(app)

# Get the directory where this script is located
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(SCRIPT_DIR, "xgb_mushroom_model.joblib")

# Load the saved model
print(f"Loading model from: {MODEL_PATH}")
model = joblib.load(MODEL_PATH)
print("[OK] Model loaded successfully!")

# Feature columns in the exact order used during training
# NOTE: Order must match exactly what the model expects!
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

# Mushroom variety options (order matters for one-hot encoding)
MUSHROOM_VARIETIES = ["Button", "Lions Mane", "Oyster", "Reishi", "Shiitake"]


def classify_yield(harvest_cycle: int) -> dict:
    """
    Classify harvest cycle into yield category
    
    Harvest cycles:
    - 6: High yield
    - 5: Good yield
    - 4: Medium yield
    - 3: Low yield
    """
    if harvest_cycle == 6:
        return {
            "category": "HIGH",
            "color": "#4ade80",  # green
            "description": "Excellent conditions! Expected high yield.",
            "harvest_cycle": harvest_cycle
        }
    elif harvest_cycle == 5:
        return {
            "category": "GOOD",
            "color": "#a3e635",  # lime
            "description": "Good conditions. Healthy yield expected.",
            "harvest_cycle": harvest_cycle
        }
    elif harvest_cycle == 4:
        return {
            "category": "MEDIUM",
            "color": "#fbbf24",  # yellow
            "description": "Moderate conditions. Some adjustments recommended.",
            "harvest_cycle": harvest_cycle
        }
    else:  # harvest_cycle == 3
        return {
            "category": "LOW",
            "color": "#f87171",  # red
            "description": "Suboptimal conditions. Significant improvements needed.",
            "harvest_cycle": harvest_cycle
        }


def prepare_features(data: dict) -> dict:
    """
    Prepare input data with one-hot encoded mushroom variety
    """
    species = data.get("species", "Oyster")
    
    # Create feature dictionary
    features = {
        "humidity_pct": data.get("humidity_pct", 85),
        "CO2_ppm": data.get("co2_ppm", 800),
        "substrate_moisture_pct": data.get("substrate_moisture", 65),
        "light_lux": data.get("light_lux", 200),
        "water_quality_index": data.get("water_quality_index", 80),
        "temp_C": data.get("temperature_c", 22),
    }
    
    # One-hot encode mushroom variety
    for variety in MUSHROOM_VARIETIES:
        features[f"mushroom_variety_{variety}"] = 1 if species == variety else 0
    
    return features


@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        "ok": True,
        "service": "ML Yield Predictor",
        "model": "XGBClassifier",
        "features": FEATURES
    })


@app.route('/api/predict', methods=['POST'])
def predict():
    """
    Predict harvest cycle and yield classification
    
    Expected JSON body:
    {
        "species": "Oyster",
        "temperature_c": 22,
        "humidity_pct": 85,
        "co2_ppm": 800,
        "light_lux": 200,
        "substrate_moisture": 65,
        "water_quality_index": 80
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        # Prepare features with one-hot encoding
        features = prepare_features(data)
        
        # Create DataFrame with correct feature order
        df_input = pd.DataFrame([features])[FEATURES]
        
        # Predict using the loaded model (XGBoost returns 0–3 → shift to 3–6)
        raw_prediction = model.predict(df_input)[0]
        harvest_cycle = int(raw_prediction + 3)
        
        # Classify the yield
        yield_info = classify_yield(harvest_cycle)
        
        # Add input data to response for reference
        yield_info["input"] = {
            "species": data.get("species", "Oyster"),
            "temperature_c": features["temp_C"],
            "humidity_pct": features["humidity_pct"],
            "co2_ppm": features["CO2_ppm"],
            "substrate_moisture": features["substrate_moisture_pct"],
            "light_lux": features["light_lux"],
            "water_quality_index": features["water_quality_index"],
        }
        
        print(f"[PREDICT] {data.get('species', 'Oyster')} -> Cycle {harvest_cycle} ({yield_info['category']})")
        
        return jsonify(yield_info)
        
    except Exception as e:
        print(f"[ERROR] Prediction error: {e}")
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    PORT = int(os.environ.get('ML_PORT', 3002))
    print(f"\n[ML API] Yield Predictor starting on http://localhost:{PORT}")
    print(f"   Health: GET  http://localhost:{PORT}/api/health")
    print(f"   Predict: POST http://localhost:{PORT}/api/predict\n")
    app.run(host='0.0.0.0', port=PORT, debug=False)

