import joblib
import pandas as pd

# Load the saved model (make sure this file is in the same folder)
model = joblib.load("xgb_mushroom_model.joblib")

# Feature columns in the exact order used during training
FEATURES = [
    "humidity_pct",
    "CO2_ppm",
    "substrate_moisture_pct",
    "light_lux",
    "water_quality_index",
    "temp_C",
    "mushroom_variety_Button",
    "mushroom_variety_Oyster",
    "mushroom_variety_Shiitake",
    "mushroom_variety_Lions Mane",
    "mushroom_variety_Reishi"
]

def predict_yield(input_data: dict) -> int:
    """
    Predict harvest cycle (3–6) based on environmental input + mushroom variety.

    Parameters:
        input_data (dict): Must contain all FEATURES as keys with valid values.

    Returns:
        int: Predicted harvest cycle (3 to 6)
    """
    # Create a DataFrame with the correct feature order
    df_input = pd.DataFrame([input_data])[FEATURES]
    
    # Predict using the loaded model (XGBoost returns 0–3 → shift to 3–6)
    prediction = model.predict(df_input)[0]
    
    return int(prediction + 3)
