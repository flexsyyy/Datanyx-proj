import React, { useMemo, useState } from 'react';
import { useSensorHistory, addHistoryEntry } from '../store/sensorHistory';
import { API_URL, getApiHost, getAwsRegionFromHost } from '../config';
import { ApiResponse } from '../types/sensor';
import './SensorHistoryPage.css';

function formatLocal(ts: string): string {
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return ts;
  }
}

function hasAwsHeaders(headers: Record<string, string>): boolean {
  const keys = Object.keys(headers);
  const lowerKeys = keys.map(k => k.toLowerCase());
  return lowerKeys.some(k => 
    k.startsWith('x-amz') || 
    k.startsWith('x-amzn') || 
    k === 'apigw-requestid' ||
    k.includes('apigw') ||
    k.includes('amazon')
  );
}

const SensorHistoryPage: React.FC = () => {
  const { history, clear } = useSensorHistory();
  const [manualFetchLoading, setManualFetchLoading] = useState(false);
  const [manualFetchError, setManualFetchError] = useState<string | null>(null);

  const apiHost = useMemo(() => getApiHost(API_URL), []);
  const region = useMemo(() => getAwsRegionFromHost(apiHost), [apiHost]);

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mushroom_sensor_history.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const fetchOnce = async () => {
    setManualFetchLoading(true);
    setManualFetchError(null);
    try {
      const response = await fetch(API_URL, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const headersObject = Object.fromEntries(response.headers.entries());
      const data: ApiResponse = await response.json();
      if (!data.data || data.data.length === 0) throw new Error('Empty data array');
      const latest = data.data[0];
      addHistoryEntry({
        reading: latest,
        fetchedAt: new Date().toISOString(),
        responseStatus: response.status,
        responseHeaders: headersObject,
      });
    } catch (e) {
      setManualFetchError(e instanceof Error ? e.message : 'Fetch failed');
    } finally {
      setManualFetchLoading(false);
    }
  };

  return (
    <div className="history-container">
      <div className="history-card">
        <div className="history-header">
          <div>
            <h1 className="history-title">Sensor History</h1>
            <div className="history-subtitle">
              Data Source: <span className="mono">{apiHost}</span>
              {region && <span className="region-chip">region: {region}</span>}
            </div>
          </div>
          <div className="history-actions">
            <button className="btn" onClick={fetchOnce} disabled={manualFetchLoading}>
              {manualFetchLoading ? 'Fetching…' : 'Fetch once'}
            </button>
            <button className="btn" onClick={exportJson}>Export JSON</button>
            <button className="btn btn-danger" onClick={clear}>Clear</button>
          </div>
        </div>

        {manualFetchError && <div className="error-banner">Manual fetch error: {manualFetchError}</div>}

        {history.length === 0 ? (
          <div className="no-history">No history yet. Keep the Monitor page open to collect data.</div>
        ) : (
          <div className="table-wrap">
            <table className="history-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Fetched</th>
                  <th>Device</th>
                  <th>Type</th>
                  <th>Temp (°C)</th>
                  <th>Humidity (%)</th>
                  <th>CO₂ (ppm)</th>
                  <th>Light (lux)</th>
                  <th>Status</th>
                  <th>HTTP</th>
                  <th>AWS</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {history.map((entry, idx) => {
                  const aws = hasAwsHeaders(entry.responseHeaders);
                  const status = entry.reading.status;
                  return (
                    <tr key={`${entry.fetchedAt}-${idx}`}>
                      <td>{idx + 1}</td>
                      <td className="mono">{formatLocal(entry.fetchedAt)}</td>
                      <td className="mono">{entry.reading.device_id}</td>
                      <td>{entry.reading.mushroom_type}</td>
                      <td>{entry.reading.temperature_c.toFixed(2)}</td>
                      <td>{entry.reading.humidity_pct.toFixed(2)}</td>
                      <td>{entry.reading.co2_ppm.toFixed(0)}</td>
                      <td>{entry.reading.light_lux.toFixed(0)}</td>
                      <td>
                        <span className={`status-dot ${status}`}></span>
                        <span className="status-text">{status}</span>
                      </td>
                      <td>{entry.responseStatus}</td>
                      <td className={aws ? 'aws-yes' : 'aws-no'}>{aws ? 'Yes' : 'No'}</td>
                      <td>
                        <details>
                          <summary>View</summary>
                          <div className="details-panel">
                            <div>
                              <div className="details-title">Raw Reading</div>
                              <pre className="code-block">{JSON.stringify(entry.reading, null, 2)}</pre>
                            </div>
                            <div>
                              <div className="details-title">Response Headers</div>
                              <pre className="code-block">{JSON.stringify(entry.responseHeaders, null, 2)}</pre>
                            </div>
                          </div>
                        </details>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SensorHistoryPage;


