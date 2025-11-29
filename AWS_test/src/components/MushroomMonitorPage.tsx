import React, { useState, useEffect, useRef } from 'react';
import './MushroomMonitorPage.css';
import { API_URL } from '../config';
import { ApiResponse, SensorReading } from '../types/sensor';
import { addHistoryEntry } from '../store/sensorHistory';

// Mushroom types to rotate through
const MUSHROOM_TYPES = ['Oyster', 'Shiitake', 'Lions Mane', 'Button', 'Reishi'];

// Optimal ranges for each metric (for status calculation)
const OPTIMAL_RANGES = {
  temperature: { min: 18, max: 26, warningMin: 15, warningMax: 30 },
  humidity: { min: 80, max: 95, warningMin: 70, warningMax: 98 },
  co2: { min: 400, max: 1500, warningMin: 300, warningMax: 2500 },
  light: { min: 100, max: 500, warningMin: 50, warningMax: 800 },
};

type MetricStatus = 'good' | 'warning' | 'bad';

const MushroomMonitorPage: React.FC = () => {
  const [reading, setReading] = useState<SensorReading | null>(null);
  const [displayReading, setDisplayReading] = useState<SensorReading | null>(null);
  const [history, setHistory] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMushroomType, setCurrentMushroomType] = useState<string>('Oyster');
  const intervalRef = useRef<number | null>(null);
  const mushroomIndexRef = useRef<number>(0);

  // Calculate status for a single metric
  const getMetricStatus = (value: number, range: typeof OPTIMAL_RANGES.temperature): MetricStatus => {
    if (value >= range.min && value <= range.max) return 'good';
    if (value >= range.warningMin && value <= range.warningMax) return 'warning';
    return 'bad';
  };

  // Calculate overall status based on all metrics
  const calculateOverallStatus = (temp: number, humidity: number, co2: number, light: number): MetricStatus => {
    const statuses = [
      getMetricStatus(temp, OPTIMAL_RANGES.temperature),
      getMetricStatus(humidity, OPTIMAL_RANGES.humidity),
      getMetricStatus(co2, OPTIMAL_RANGES.co2),
      getMetricStatus(light, OPTIMAL_RANGES.light),
    ];
    
    if (statuses.includes('bad')) return 'bad';
    if (statuses.includes('warning')) return 'warning';
    return 'good';
  };

  // Get color for metric based on its status
  const getMetricColor = (value: number, range: typeof OPTIMAL_RANGES.temperature): string => {
    const status = getMetricStatus(value, range);
    switch (status) {
      case 'good': return '#4ade80';
      case 'warning': return '#fbbf24';
      case 'bad': return '#f87171';
    }
  };

  // Smoothing function: exponential smoothing with factor 0.4
  const smoothValue = (oldValue: number, newValue: number): number => {
    return oldValue + 0.4 * (newValue - oldValue);
  };

  // Add some random variation to make data more dynamic
  const addVariation = (value: number, maxVariation: number): number => {
    const variation = (Math.random() - 0.5) * 2 * maxVariation;
    return value + variation;
  };

  const fetchSensorData = async () => {
    try {
      const response = await fetch(API_URL, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const headersObject = Object.fromEntries(response.headers.entries());
      const data: ApiResponse = await response.json();
      
      if (!data.data || data.data.length === 0) {
        setError("No data available");
        return;
      }

      const apiReading = data.data[0];
      
      // Add variation to create more dynamic data
      const variedReading: SensorReading = {
        ...apiReading,
        temperature_c: addVariation(apiReading.temperature_c, 3), // ±3°C variation
        humidity_pct: Math.min(100, Math.max(0, addVariation(apiReading.humidity_pct, 8))), // ±8% variation
        co2_ppm: Math.max(0, addVariation(apiReading.co2_ppm, 400)), // ±400ppm variation
        light_lux: Math.max(0, addVariation(apiReading.light_lux, 100)), // ±100lux variation
      };

      // Rotate mushroom type every few readings
      if (Math.random() > 0.7) {
        mushroomIndexRef.current = (mushroomIndexRef.current + 1) % MUSHROOM_TYPES.length;
        setCurrentMushroomType(MUSHROOM_TYPES[mushroomIndexRef.current]);
      }

      // Calculate dynamic status based on actual values
      const calculatedStatus = calculateOverallStatus(
        variedReading.temperature_c,
        variedReading.humidity_pct,
        variedReading.co2_ppm,
        variedReading.light_lux
      );

      const latestReading: SensorReading = {
        ...variedReading,
        mushroom_type: currentMushroomType,
        status: calculatedStatus,
      };

      setReading(latestReading);
      setError(null);

      // Record entry in shared history store
      addHistoryEntry({
        reading: latestReading,
        fetchedAt: new Date().toISOString(),
        responseStatus: response.status,
        responseHeaders: headersObject,
      });

      // Update display reading with smoothing
      setDisplayReading((prevDisplay) => {
        if (!prevDisplay) {
          return latestReading;
        }

        return {
          ...latestReading,
          temperature_c: smoothValue(prevDisplay.temperature_c, latestReading.temperature_c),
          humidity_pct: smoothValue(prevDisplay.humidity_pct, latestReading.humidity_pct),
          co2_ppm: smoothValue(prevDisplay.co2_ppm, latestReading.co2_ppm),
          light_lux: smoothValue(prevDisplay.light_lux, latestReading.light_lux),
        };
      });

      // Update history (keep last 20 temperature readings)
      setHistory((prevHistory) => {
        const newHistory = [...prevHistory, latestReading.temperature_c];
        return newHistory.slice(-20);
      });

      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch sensor data");
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchSensorData();

    // Set up polling interval
    intervalRef.current = window.setInterval(() => {
      fetchSensorData();
    }, 3000);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [currentMushroomType]);

  const formatTimestamp = (timestamp: string): string => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch {
      return timestamp;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "good":
        return "#4ade80"; // green
      case "warning":
        return "#fbbf24"; // yellow
      case "bad":
        return "#f87171"; // red
      default:
        return "#9ca3af"; // gray
    }
  };

  const renderTemperatureChart = () => {
    if (history.length === 0) {
      return <div className="chart-empty">No temperature history yet</div>;
    }

    const maxTemp = Math.max(...history);
    const minTemp = Math.min(...history);
    const range = maxTemp - minTemp || 1;

    return (
      <div className="chart-container">
        {history.map((temp, index) => {
          const height = ((temp - minTemp) / range) * 100;
          const barColor = getMetricColor(temp, OPTIMAL_RANGES.temperature);
          return (
            <div
              key={index}
              className="chart-bar"
              style={{
                height: `${Math.max(height, 5)}%`,
                minHeight: '4px',
                backgroundColor: barColor,
              }}
              title={`${temp.toFixed(1)}°C`}
            />
          );
        })}
      </div>
    );
  };

  if (loading && !reading) {
    return (
      <div className="monitor-container">
        <div className="monitor-card">
          <div className="loading">Loading sensor data...</div>
        </div>
      </div>
    );
  }

  if (error && !reading) {
    return (
      <div className="monitor-container">
        <div className="monitor-card">
          <div className="error">Error: {error}</div>
        </div>
      </div>
    );
  }

  if (!displayReading) {
    return (
      <div className="monitor-container">
        <div className="monitor-card">
          <div className="no-data">No data yet</div>
        </div>
      </div>
    );
  }

  return (
    <div className="monitor-container">
      <div className="monitor-card">
        <div className="card-header">
          <h1 className="device-id">{displayReading.device_id}</h1>
          <div className="status-pill" style={{ backgroundColor: getStatusColor(displayReading.status) }}>
            {displayReading.status.toUpperCase()}
          </div>
        </div>

        <div className="card-body">
          <div className="info-row">
            <span className="label">Mushroom Type:</span>
            <span className="value">{displayReading.mushroom_type}</span>
          </div>

          <div className="info-row">
            <span className="label">Timestamp:</span>
            <span className="value">{formatTimestamp(displayReading.timestamp)}</span>
          </div>

          <div className="sensor-grid">
            <div className="sensor-item" style={{ borderColor: getMetricColor(displayReading.temperature_c, OPTIMAL_RANGES.temperature) }}>
              <div className="sensor-label">Temperature</div>
              <div className="sensor-value" style={{ color: getMetricColor(displayReading.temperature_c, OPTIMAL_RANGES.temperature) }}>
                {displayReading.temperature_c.toFixed(2)}°C
              </div>
              <div className="sensor-range">Optimal: 18-26°C</div>
            </div>

            <div className="sensor-item" style={{ borderColor: getMetricColor(displayReading.humidity_pct, OPTIMAL_RANGES.humidity) }}>
              <div className="sensor-label">Humidity</div>
              <div className="sensor-value" style={{ color: getMetricColor(displayReading.humidity_pct, OPTIMAL_RANGES.humidity) }}>
                {displayReading.humidity_pct.toFixed(2)}%
              </div>
              <div className="sensor-range">Optimal: 80-95%</div>
            </div>

            <div className="sensor-item" style={{ borderColor: getMetricColor(displayReading.co2_ppm, OPTIMAL_RANGES.co2) }}>
              <div className="sensor-label">CO₂</div>
              <div className="sensor-value" style={{ color: getMetricColor(displayReading.co2_ppm, OPTIMAL_RANGES.co2) }}>
                {displayReading.co2_ppm.toFixed(0)} ppm
              </div>
              <div className="sensor-range">Optimal: 400-1500 ppm</div>
            </div>

            <div className="sensor-item" style={{ borderColor: getMetricColor(displayReading.light_lux, OPTIMAL_RANGES.light) }}>
              <div className="sensor-label">Light</div>
              <div className="sensor-value" style={{ color: getMetricColor(displayReading.light_lux, OPTIMAL_RANGES.light) }}>
                {displayReading.light_lux.toFixed(0)} lux
              </div>
              <div className="sensor-range">Optimal: 100-500 lux</div>
            </div>
          </div>
        </div>

        <div className="chart-section">
          <h3 className="chart-title">Temperature History (Last 20 readings)</h3>
          {renderTemperatureChart()}
          <div className="chart-legend">
            <span style={{ color: '#4ade80' }}>● Good</span>
            <span style={{ color: '#fbbf24' }}>● Warning</span>
            <span style={{ color: '#f87171' }}>● Bad</span>
          </div>
        </div>

        {error && (
          <div className="error-banner">Warning: {error}</div>
        )}
      </div>
    </div>
  );
};

export default MushroomMonitorPage;
