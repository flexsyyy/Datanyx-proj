/**
 * Centralized Storage Service
 * Manages sessionStorage (runtime data) and localStorage (persistent preferences)
 */

// Session Storage (cleared on tab close)
export const SessionStore = {
  // Prediction data
  savePredictionHistory: (data: any[]) => {
    sessionStorage.setItem('predictionHistory', JSON.stringify(data));
  },
  
  getPredictionHistory: (): any[] => {
    const stored = sessionStorage.getItem('predictionHistory');
    return stored ? JSON.parse(stored) : [];
  },
  
  saveLatestPrediction: (data: any) => {
    sessionStorage.setItem('latestPrediction', JSON.stringify(data));
  },
  
  getLatestPrediction: (): any | null => {
    const stored = sessionStorage.getItem('latestPrediction');
    return stored ? JSON.parse(stored) : null;
  },
  
  // Alerts
  saveAlerts: (alerts: any[]) => {
    sessionStorage.setItem('alerts', JSON.stringify(alerts));
  },
  
  getAlerts: (): any[] => {
    const stored = sessionStorage.getItem('alerts');
    return stored ? JSON.parse(stored) : [];
  },
  
  addAlert: (alert: any) => {
    const alerts = SessionStore.getAlerts();
    alerts.unshift(alert); // Add to beginning
    SessionStore.saveAlerts(alerts);
    return alerts;
  },
  
  // Reports data
  saveReportsData: (key: string, data: any) => {
    sessionStorage.setItem(key, JSON.stringify(data));
  },
  
  getReportsData: (key: string, defaultValue: any = null): any => {
    const stored = sessionStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  },
  
  // Clear all session data
  clearAll: () => {
    sessionStorage.clear();
  }
};

// Local Storage (persists across sessions)
export const PersistentStore = {
  // User preferences
  saveUnits: (units: any) => {
    localStorage.setItem('userUnits', JSON.stringify(units));
  },
  
  getUnits: (): any => {
    const stored = localStorage.getItem('userUnits');
    return stored ? JSON.parse(stored) : { temp: '°C', weight: 'kg', speed: 'm/s' };
  },
  
  saveTheme: (theme: string) => {
    localStorage.setItem('theme', theme);
  },
  
  getTheme: (): string => {
    return localStorage.getItem('theme') || 'light';
  }
};

