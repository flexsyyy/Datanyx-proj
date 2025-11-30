import React, { createContext, useContext, useState, useEffect } from 'react';
import { SessionStore } from '@/services/storageService';

interface PredictionData {
  yieldRange: { min: number; max: number };
  harvestCycle: number;
  category: string;
  status: 'ideal' | 'suboptimal' | 'high-risk';
  confidence: number;
  contaminationRisk: number;
  timestamp: string;
  inputs: {
    temperature: number;
    humidity: number;
    co2: number;
    species: string;
  };
}

interface Alert {
  id: string;
  severity: 'warning' | 'critical' | 'info';
  title: string;
  message: string;
  time: string;
  timestamp: string;
  predictionData?: any;
}

interface DataContextType {
  latestPrediction: PredictionData | null;
  predictionHistory: PredictionData[];
  alerts: Alert[];
  updatePrediction: (data: PredictionData) => void;
  addAlert: (alert: Omit<Alert, 'id' | 'timestamp'>) => void;
  clearSessionData: () => void;
}

const DataContext = createContext<DataContextType>({} as DataContextType);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [latestPrediction, setLatestPrediction] = useState<PredictionData | null>(() => 
    SessionStore.getLatestPrediction()
  );
  
  const [predictionHistory, setPredictionHistory] = useState<PredictionData[]>(() => 
    SessionStore.getPredictionHistory()
  );
  
  const [alerts, setAlerts] = useState<Alert[]>(() => 
    SessionStore.getAlerts()
  );

  const updatePrediction = (data: PredictionData) => {
    setLatestPrediction(data);
    SessionStore.saveLatestPrediction(data);
    
    const updated = [...predictionHistory, data];
    setPredictionHistory(updated);
    SessionStore.savePredictionHistory(updated);
    
    // Auto-create alert if prediction is concerning
    if (data.status === 'high-risk' || data.category === 'LOW') {
      addAlert({
        severity: 'critical',
        title: 'Low Yield Prediction',
        message: `${data.inputs.species}: Predicted harvest cycle ${data.harvestCycle} (${data.yieldRange.min}-${data.yieldRange.max}kg). Immediate adjustments recommended.`,
        time: 'Just now',
      });
    } else if (data.status === 'suboptimal' || data.category === 'MEDIUM') {
      addAlert({
        severity: 'warning',
        title: 'Suboptimal Conditions Detected',
        message: `${data.inputs.species}: Harvest cycle ${data.harvestCycle}. Consider optimizing temperature (${data.inputs.temperature}°C) and CO2 (${data.inputs.co2}ppm).`,
        time: 'Just now',
      });
    }
  };

  const addAlert = (alert: Omit<Alert, 'id' | 'timestamp'>) => {
    const newAlert: Alert = {
      ...alert,
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    };
    
    const updatedAlerts = [newAlert, ...alerts];
    setAlerts(updatedAlerts);
    SessionStore.saveAlerts(updatedAlerts);
  };

  const clearSessionData = () => {
    SessionStore.clearAll();
    setLatestPrediction(null);
    setPredictionHistory([]);
    setAlerts([]);
  };

  return (
    <DataContext.Provider
      value={{
        latestPrediction,
        predictionHistory,
        alerts,
        updatePrediction,
        addAlert,
        clearSessionData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export const useDataContext = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useDataContext must be used within DataProvider');
  }
  return context;
};

