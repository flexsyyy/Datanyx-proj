import React, { useState, useRef, useEffect } from 'react';
import {
  ChatMessage,
  ChatbotResponse,
  SensorPayload,
  DEFAULT_SENSOR_PAYLOAD,
  MushroomSpecies,
  MLPrediction,
} from '../types/chatbot';
import './ChatbotPage.css';

const CHATBOT_API_URL = 'http://localhost:3001/api/chatbot/fungi';
const HEALTH_API_URL = 'http://localhost:3001/api/health';

const ChatbotPage: React.FC = () => {
  // Chat state
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Sensor form state
  const [sensorPayload, setSensorPayload] = useState<SensorPayload>(DEFAULT_SENSOR_PAYLOAD);
  const [includeSensorData, setIncludeSensorData] = useState(true);
  
  // ML Prediction state
  const [mlPrediction, setMlPrediction] = useState<MLPrediction | null>(null);
  
  // Server health state
  const [serverHealth, setServerHealth] = useState<{ ok: boolean; message: string; model?: string } | null>(null);
  
  // Ref for auto-scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Check server health on mount
  useEffect(() => {
    checkServerHealth();
  }, []);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);
  
  const checkServerHealth = async () => {
    try {
      const response = await fetch(HEALTH_API_URL);
      const data = await response.json();
      setServerHealth(data);
    } catch {
      setServerHealth({ ok: false, message: 'Cannot connect to chatbot server. Is it running?' });
    }
  };
  
  const handleSendMessage = async () => {
    if (!userInput.trim() && !includeSensorData) return;
    
    setIsLoading(true);
    setError(null);
    
    const messageToSend = userInput.trim() || 'Please analyze my current conditions and provide recommendations.';
    
    try {
      const requestBody = {
        sensorPayload: includeSensorData ? sensorPayload : undefined,
        chatHistory,
        userMessage: messageToSend,
      };
      
      const response = await fetch(CHATBOT_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      
      const data: ChatbotResponse = await response.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setChatHistory(data.newHistory);
        setUserInput('');
        // Update ML prediction if available
        if (data.mlPrediction) {
          setMlPrediction(data.mlPrediction);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleNewConversation = () => {
    setChatHistory([]);
    setError(null);
    setMlPrediction(null);
  };
  
  const updateSensor = <K extends keyof SensorPayload>(key: K, value: SensorPayload[K]) => {
    setSensorPayload(prev => ({ ...prev, [key]: value }));
  };
  
  // Format message content with basic markdown-like styling
  const formatMessage = (content: string) => {
    // Split by newlines and process
    const lines = content.split('\n');
    return lines.map((line, i) => {
      // Bold text
      let formatted = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      // Bullet points
      if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
        return <li key={i} className="message-bullet" dangerouslySetInnerHTML={{ __html: formatted.replace(/^[\s]*[-•]\s*/, '') }} />;
      }
      return <p key={i} dangerouslySetInnerHTML={{ __html: formatted }} />;
    });
  };
  
  return (
    <div className="chatbot-container">
      {/* Left Panel - Sensor Form */}
      <div className="sensor-panel">
        <div className="panel-header">
          <h2>🍄 Grow Room Data</h2>
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={includeSensorData}
              onChange={(e) => setIncludeSensorData(e.target.checked)}
            />
            Include in message
          </label>
        </div>
        
        <div className="sensor-form">
          {/* Species */}
          <div className="form-group">
            <label>Mushroom Species</label>
            <select
              value={sensorPayload.species}
              onChange={(e) => updateSensor('species', e.target.value as MushroomSpecies)}
            >
              <option value="Oyster">Oyster</option>
              <option value="Shiitake">Shiitake</option>
              <option value="Lions Mane">Lions Mane</option>
              <option value="Button">Button</option>
              <option value="Reishi">Reishi</option>
            </select>
          </div>
          
          {/* Temperature */}
          <div className="form-group">
            <label>Temperature (°C)</label>
            <input
              type="number"
              value={sensorPayload.temperature_c ?? ''}
              onChange={(e) => updateSensor('temperature_c', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="e.g., 20"
              step="0.1"
            />
          </div>
          
          {/* Humidity */}
          <div className="form-group">
            <label>Humidity (%)</label>
            <input
              type="number"
              value={sensorPayload.humidity_pct ?? ''}
              onChange={(e) => updateSensor('humidity_pct', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="e.g., 85"
              min="0"
              max="100"
            />
          </div>
          
          {/* CO2 */}
          <div className="form-group">
            <label>CO₂ (ppm)</label>
            <input
              type="number"
              value={sensorPayload.co2_ppm ?? ''}
              onChange={(e) => updateSensor('co2_ppm', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="e.g., 800"
            />
          </div>
          
          {/* Light */}
          <div className="form-group">
            <label>Light Intensity (lux)</label>
            <input
              type="number"
              value={sensorPayload.light_lux ?? ''}
              onChange={(e) => updateSensor('light_lux', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="e.g., 500"
            />
          </div>
          
          {/* Substrate Moisture */}
          <div className="form-group">
            <label>Substrate Moisture Level (%)</label>
            <input
              type="number"
              value={sensorPayload.substrate_moisture ?? ''}
              onChange={(e) => updateSensor('substrate_moisture', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="e.g., 65"
              min="0"
              max="100"
            />
          </div>
          
          {/* Water Quality */}
          <div className="form-group">
            <label>Water Quality Index (0-100)</label>
            <input
              type="number"
              value={sensorPayload.water_quality_index ?? ''}
              onChange={(e) => updateSensor('water_quality_index', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="e.g., 80"
              min="0"
              max="100"
            />
          </div>
          
        </div>
      </div>
      
      {/* Right Panel - Chat */}
      <div className="chat-panel">
        <div className="panel-header">
          <h2>🧠 Fungi Expert</h2>
          <div className="header-actions">
            {serverHealth && (
              <span className={`health-status ${serverHealth.ok ? 'ok' : 'error'}`}>
                {serverHealth.ok ? `✓ ${serverHealth.model}` : '✗ Offline'}
              </span>
            )}
            <button className="btn-secondary" onClick={handleNewConversation}>
              New Chat
            </button>
          </div>
        </div>
        
        {/* Server Status Warning */}
        {serverHealth && !serverHealth.ok && (
          <div className="server-warning">
            <strong>Server Issue:</strong> {serverHealth.message}
            <button onClick={checkServerHealth} className="btn-link">Retry</button>
          </div>
        )}
        
        {/* ML Prediction Display */}
        {mlPrediction && (
          <div className="ml-prediction-panel" style={{ borderColor: mlPrediction.color }}>
            <div className="prediction-header">
              <span className="prediction-icon">🧠</span>
              <span className="prediction-title">ML Yield Prediction</span>
            </div>
            <div className="prediction-body">
              <div 
                className="prediction-badge" 
                style={{ backgroundColor: mlPrediction.color }}
              >
                {mlPrediction.category} YIELD
              </div>
              <div className="prediction-details">
                <div className="prediction-cycle">
                  <span className="label">Harvest Cycle:</span>
                  <span className="value">{mlPrediction.harvest_cycle}</span>
                  <span className="scale">(3=fastest → 6=slowest)</span>
                </div>
                <p className="prediction-description">{mlPrediction.description}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Messages */}
        <div className="messages-container">
          {chatHistory.length === 0 ? (
            <div className="empty-chat">
              <div className="empty-icon">🍄</div>
              <h3>Welcome to Fungi Expert</h3>
              <p>I'm here to help with your mushroom cultivation!</p>
              <p>Fill in your grow room data on the left, then ask me anything about:</p>
              <ul>
                <li>• Optimal conditions for your species</li>
                <li>• Diagnosing problems</li>
                <li>• Improving yield</li>
                <li>• Contamination control</li>
              </ul>
            </div>
          ) : (
            chatHistory.map((msg, idx) => (
              <div key={idx} className={`message ${msg.role}`}>
                <div className="message-header">
                  {msg.role === 'user' ? '👤 You' : '🍄 Fungi Expert'}
                </div>
                <div className="message-content">
                  {formatMessage(msg.content)}
                </div>
              </div>
            ))
          )}
          
          {isLoading && (
            <div className="message assistant loading">
              <div className="message-header">🍄 Fungi Expert</div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Error Display */}
        {error && (
          <div className="error-banner">
            {error}
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}
        
        {/* Input Area */}
        <div className="input-area">
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about mushroom cultivation, or just click Send to analyze your data..."
            rows={2}
            disabled={isLoading || (serverHealth && !serverHealth.ok)}
          />
          <button
            className="btn-primary"
            onClick={handleSendMessage}
            disabled={isLoading || (serverHealth && !serverHealth.ok)}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatbotPage;

