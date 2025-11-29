import React, { useState } from 'react';
import './MLPredictorPage.css';

// Mushroom species options
const MUSHROOM_SPECIES = ['Oyster', 'Shiitake', 'Lions Mane', 'Button', 'Reishi'] as const;
type MushroomSpecies = typeof MUSHROOM_SPECIES[number];

// Input form state
interface FormData {
  species: MushroomSpecies;
  humidity: number;
  co2: number;
  substrate_moisture: number;
  light_intensity: number;
  water_quality: number;
  temperature: number;
}

// Prediction response
interface PredictionResult {
  harvest_cycle: number;
  yield_category: 'HIGH' | 'GOOD' | 'MEDIUM' | 'LOW';
  yield_color: string;
  description: string;
  input_received: Record<string, unknown>;
}

const FASTAPI_URL = 'http://localhost:8000';

const MLPredictorPage: React.FC = () => {
  // Form state with default values
  const [formData, setFormData] = useState<FormData>({
    species: 'Oyster',
    humidity: 85,
    co2: 800,
    substrate_moisture: 65,
    light_intensity: 500,
    water_quality: 80,
    temperature: 22,
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'species' ? value : parseFloat(value) || 0,
    }));
  };

  // Submit prediction request
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPrediction(null);

    try {
      const response = await fetch(`${FASTAPI_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error: ${response.status}`);
      }

      const result: PredictionResult = await response.json();
      setPrediction(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get prediction');
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setFormData({
      species: 'Oyster',
      humidity: 85,
      co2: 800,
      substrate_moisture: 65,
      light_intensity: 500,
      water_quality: 80,
      temperature: 22,
    });
    setPrediction(null);
    setError(null);
  };

  return (
    <div className="ml-predictor-container">
      <div className="ml-predictor-card">
        <div className="card-header">
          <h1>🍄 Mushroom Yield Predictor</h1>
          <p>Enter environmental conditions to predict harvest cycle</p>
        </div>

        <form onSubmit={handleSubmit} className="predictor-form">
          {/* Species Selection */}
          <div className="form-group">
            <label htmlFor="species">Mushroom Species</label>
            <select
              id="species"
              name="species"
              value={formData.species}
              onChange={handleChange}
            >
              {MUSHROOM_SPECIES.map(species => (
                <option key={species} value={species}>{species}</option>
              ))}
            </select>
          </div>

          {/* Temperature */}
          <div className="form-group">
            <label htmlFor="temperature">Temperature (°C)</label>
            <input
              type="number"
              id="temperature"
              name="temperature"
              value={formData.temperature}
              onChange={handleChange}
              step="0.1"
              placeholder="e.g., 22"
            />
          </div>

          {/* Humidity */}
          <div className="form-group">
            <label htmlFor="humidity">Humidity (%)</label>
            <input
              type="number"
              id="humidity"
              name="humidity"
              value={formData.humidity}
              onChange={handleChange}
              min="0"
              max="100"
              placeholder="e.g., 85"
            />
          </div>

          {/* CO2 */}
          <div className="form-group">
            <label htmlFor="co2">CO₂ Concentration (ppm)</label>
            <input
              type="number"
              id="co2"
              name="co2"
              value={formData.co2}
              onChange={handleChange}
              min="0"
              placeholder="e.g., 800"
            />
          </div>

          {/* Light Intensity */}
          <div className="form-group">
            <label htmlFor="light_intensity">Light Intensity (lux)</label>
            <input
              type="number"
              id="light_intensity"
              name="light_intensity"
              value={formData.light_intensity}
              onChange={handleChange}
              min="0"
              placeholder="e.g., 500"
            />
          </div>

          {/* Substrate Moisture */}
          <div className="form-group">
            <label htmlFor="substrate_moisture">Substrate Moisture (%)</label>
            <input
              type="number"
              id="substrate_moisture"
              name="substrate_moisture"
              value={formData.substrate_moisture}
              onChange={handleChange}
              min="0"
              max="100"
              placeholder="e.g., 65"
            />
          </div>

          {/* Water Quality */}
          <div className="form-group">
            <label htmlFor="water_quality">Water Quality Index (0-100)</label>
            <input
              type="number"
              id="water_quality"
              name="water_quality"
              value={formData.water_quality}
              onChange={handleChange}
              min="0"
              max="100"
              placeholder="e.g., 80"
            />
          </div>

          {/* Action Buttons */}
          <div className="form-actions">
            <button type="submit" className="btn-predict" disabled={loading}>
              {loading ? 'Predicting...' : '🔮 Predict Yield'}
            </button>
            <button type="button" className="btn-reset" onClick={handleReset}>
              Reset
            </button>
          </div>
        </form>

        {/* Error Display */}
        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Prediction Result */}
        {prediction && (
          <div className="prediction-result" style={{ borderColor: prediction.yield_color }}>
            <div className="result-header">
              <h2>Prediction Result</h2>
            </div>
            
            <div className="result-body">
              <div 
                className="yield-badge"
                style={{ backgroundColor: prediction.yield_color }}
              >
                {prediction.yield_category} YIELD
              </div>
              
              <div className="harvest-cycle">
                <span className="label">Harvest Cycle:</span>
                <span className="value">{prediction.harvest_cycle}</span>
                <span className="scale">(6 = high yield, 3 = low yield)</span>
              </div>
              
              <p className="description">{prediction.description}</p>
              
              <div className="input-summary">
                <h4>Input Summary:</h4>
                <ul>
                  <li><strong>Species:</strong> {prediction.input_received.species as string}</li>
                  <li><strong>Temperature:</strong> {prediction.input_received.temperature as number}°C</li>
                  <li><strong>Humidity:</strong> {prediction.input_received.humidity as number}%</li>
                  <li><strong>CO₂:</strong> {prediction.input_received.co2 as number} ppm</li>
                  <li><strong>Light:</strong> {prediction.input_received.light_intensity as number} lux</li>
                  <li><strong>Substrate Moisture:</strong> {prediction.input_received.substrate_moisture as number}%</li>
                  <li><strong>Water Quality:</strong> {prediction.input_received.water_quality as number}/100</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MLPredictorPage;


