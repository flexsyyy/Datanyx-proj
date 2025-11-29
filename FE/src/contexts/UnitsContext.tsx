import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type UnitSystem = "metric" | "imperial";

interface UnitsContextType {
  units: UnitSystem;
  setUnits: (units: UnitSystem) => void;
  formatTemperature: (celsius: number) => string;
  formatWeight: (kg: number) => string;
  formatSpeed: (mps: number) => string;
  temperatureUnit: string;
  weightUnit: string;
  speedUnit: string;
}

const UnitsContext = createContext<UnitsContextType | undefined>(undefined);

export function UnitsProvider({ children }: { children: ReactNode }) {
  const [units, setUnitsState] = useState<UnitSystem>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("units") as UnitSystem) || "metric";
    }
    return "metric";
  });

  const setUnits = (newUnits: UnitSystem) => {
    setUnitsState(newUnits);
    localStorage.setItem("units", newUnits);
  };

  // Conversion functions
  const celsiusToFahrenheit = (c: number) => (c * 9) / 5 + 32;
  const kgToLb = (kg: number) => kg * 2.20462;
  const mpsToFps = (mps: number) => mps * 3.28084;

  const formatTemperature = (celsius: number): string => {
    if (units === "imperial") {
      return `${celsiusToFahrenheit(celsius).toFixed(1)}`;
    }
    return `${celsius.toFixed(1)}`;
  };

  const formatWeight = (kg: number): string => {
    if (units === "imperial") {
      return `${kgToLb(kg).toFixed(1)}`;
    }
    return `${kg.toFixed(1)}`;
  };

  const formatSpeed = (mps: number): string => {
    if (units === "imperial") {
      return `${mpsToFps(mps).toFixed(1)}`;
    }
    return `${mps.toFixed(1)}`;
  };

  const temperatureUnit = units === "imperial" ? "°F" : "°C";
  const weightUnit = units === "imperial" ? "lb" : "kg";
  const speedUnit = units === "imperial" ? "ft/s" : "m/s";

  return (
    <UnitsContext.Provider
      value={{
        units,
        setUnits,
        formatTemperature,
        formatWeight,
        formatSpeed,
        temperatureUnit,
        weightUnit,
        speedUnit,
      }}
    >
      {children}
    </UnitsContext.Provider>
  );
}

export function useUnits() {
  const context = useContext(UnitsContext);
  if (context === undefined) {
    throw new Error("useUnits must be used within a UnitsProvider");
  }
  return context;
}

