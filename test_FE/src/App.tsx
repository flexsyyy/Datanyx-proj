import React, { useEffect, useState } from 'react';
import MushroomMonitorPage from './components/MushroomMonitorPage';
import SensorHistoryPage from './components/SensorHistoryPage';
import ChatbotPage from './components/ChatbotPage';
import MLPredictorPage from './components/MLPredictorPage';
import { fetchFungiDataset, FungiRow, DATASET_API_URL, getApiHost } from './config';

// Inline Dataset Page Component
const DatasetPage: React.FC = () => {
  const [rows, setRows] = useState<FungiRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [species, setSpecies] = useState<string>('');
  const [limit, setLimit] = useState<number>(500);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchFungiDataset({ 
        species: species || undefined, 
        limit 
      });
      setRows(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dataset');
      console.error('Dataset fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFilter = () => {
    loadData();
  };

  const speciesOptions = ['', 'Oyster', 'Shiitake', 'Lions Mane', 'Button', 'Reishi'];

  return (
    <div style={{ 
      minHeight: 'calc(100vh - 50px)', 
      background: '#0f172a', 
      padding: 20,
      color: '#e2e8f0',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{ 
        background: '#1e293b', 
        borderRadius: 12, 
        padding: 24,
        maxWidth: 1400,
        margin: '0 auto',
        border: '1px solid #334155'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 24 }}>📊 Dataset Browser</h1>
            <p style={{ margin: '8px 0 0', color: '#94a3b8', fontSize: 14 }}>
              Source: <span style={{ fontFamily: 'monospace' }}>{getApiHost(DATASET_API_URL)}</span>
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <select
              value={species}
              onChange={(e) => setSpecies(e.target.value)}
              style={{
                padding: '8px 12px',
                background: '#0f172a',
                border: '1px solid #334155',
                borderRadius: 6,
                color: '#e2e8f0',
                fontSize: 14
              }}
            >
              {speciesOptions.map(s => (
                <option key={s} value={s}>{s || 'All Species'}</option>
              ))}
            </select>
            <input
              type="number"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value) || 100)}
              min={1}
              max={1000}
              style={{
                padding: '8px 12px',
                background: '#0f172a',
                border: '1px solid #334155',
                borderRadius: 6,
                color: '#e2e8f0',
                fontSize: 14,
                width: 80
              }}
              placeholder="Limit"
            />
            <button
              onClick={handleFilter}
              disabled={loading}
              style={{
                padding: '8px 16px',
                background: '#3b82f6',
                border: 'none',
                borderRadius: 6,
                color: 'white',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                fontSize: 14
              }}
            >
              {loading ? 'Loading...' : 'Fetch'}
            </button>
          </div>
        </div>

        {error && (
          <div style={{ 
            padding: 12, 
            background: '#7f1d1d', 
            border: '1px solid #991b1b',
            borderRadius: 6,
            color: '#fecaca',
            marginBottom: 16
          }}>
            Error: {error}
          </div>
        )}

        {loading && rows.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
            Loading dataset...
          </div>
        ) : rows.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
            No data found. Try adjusting filters.
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 12, color: '#94a3b8', fontSize: 14 }}>
              Showing {rows.length} rows
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse',
                fontSize: 13
              }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #334155' }}>
                    <th style={thStyle}>#</th>
                    <th style={thStyle}>Timestamp</th>
                    <th style={thStyle}>Species</th>
                    <th style={thStyle}>Temp (°C)</th>
                    <th style={thStyle}>Humidity (%)</th>
                    <th style={thStyle}>CO₂ (ppm)</th>
                    <th style={thStyle}>Light (lux)</th>
                    <th style={thStyle}>Substrate (%)</th>
                    <th style={thStyle}>WQI</th>
                    <th style={thStyle}>Cycle</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #334155' }}>
                      <td style={tdStyle}>{idx + 1}</td>
                      <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: 12 }}>{row.timestamp}</td>
                      <td style={tdStyle}>{row.mushroom_variety}</td>
                      <td style={tdStyle}>{Number(row.temp_C)?.toFixed(2)}</td>
                      <td style={tdStyle}>{Number(row.humidity_pct)?.toFixed(1)}</td>
                      <td style={tdStyle}>{Number(row.CO2_ppm)?.toFixed(0)}</td>
                      <td style={tdStyle}>{Number(row.light_lux)?.toFixed(0)}</td>
                      <td style={tdStyle}>{Number(row.substrate_moisture_pct)?.toFixed(1)}</td>
                      <td style={tdStyle}>{row.water_quality_index}</td>
                      <td style={tdStyle}>{row.harvest_cycle}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '10px 12px',
  color: '#94a3b8',
  fontWeight: 600,
  fontSize: 12,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  whiteSpace: 'nowrap'
};

const tdStyle: React.CSSProperties = {
  padding: '10px 12px',
  color: '#e2e8f0',
  whiteSpace: 'nowrap'
};

function App() {
  const [route, setRoute] = useState<string>(() => window.location.hash || '#/monitor');

  useEffect(() => {
    const onHashChange = () => {
      setRoute(window.location.hash || '#/monitor');
    };
    window.addEventListener('hashchange', onHashChange);
    if (!window.location.hash) {
      window.location.hash = '#/monitor';
    }
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const renderPage = () => {
    switch (route) {
      case '#/history':
        return <SensorHistoryPage />;
      case '#/chatbot':
        return <ChatbotPage />;
      case '#/dataset':
        return <DatasetPage />;
      case '#/predictor':
        return <MLPredictorPage />;
      default:
        return <MushroomMonitorPage />;
    }
  };

  const navLinkStyle = (path: string) => ({
    color: '#e2e8f0',
    textDecoration: route === path ? 'underline' : 'none',
    fontWeight: route === path ? 600 : 400,
  });

  return (
    <div className="App">
      <div style={{ background: '#0f172a', padding: '12px 16px', borderBottom: '1px solid #334155' }}>
        <nav style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <a href="#/monitor" style={navLinkStyle('#/monitor')}>Monitor</a>
          <a href="#/history" style={navLinkStyle('#/history')}>History</a>
          <a href="#/dataset" style={navLinkStyle('#/dataset')}>📊 Dataset</a>
          <a href="#/predictor" style={navLinkStyle('#/predictor')}>🔮 ML Predictor</a>
          <a href="#/chatbot" style={navLinkStyle('#/chatbot')}>🍄 Fungi Chatbot</a>
        </nav>
      </div>
      {renderPage()}
    </div>
  );
}

export default App;
