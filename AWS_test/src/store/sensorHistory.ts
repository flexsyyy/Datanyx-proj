import { useSyncExternalStore } from "react";
import { SensorReading } from "../types/sensor";

export interface SensorHistoryEntry {
  reading: SensorReading;
  fetchedAt: string; // ISO when fetch completed on client
  responseStatus: number;
  responseHeaders: Record<string, string>;
}

type Listener = () => void;

const STORAGE_KEY = "mushroom_sensor_history_v1";
const MAX_ENTRIES = 500;

let historyState: SensorHistoryEntry[] = loadFromStorage();
const listeners = new Set<Listener>();

function loadFromStorage(): SensorHistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SensorHistoryEntry[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function saveToStorage(entries: SensorHistoryEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // ignore storage errors
  }
}

function emit(): void {
  for (const l of listeners) l();
}

export function addHistoryEntry(entry: SensorHistoryEntry): void {
  historyState = [...historyState, entry].slice(-MAX_ENTRIES);
  saveToStorage(historyState);
  emit();
}

export function clearHistory(): void {
  historyState = [];
  saveToStorage(historyState);
  emit();
}

export function getHistorySnapshot(): SensorHistoryEntry[] {
  // Return the same reference - it only changes when addHistoryEntry/clearHistory is called
  return historyState;
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useSensorHistory(): {
  history: SensorHistoryEntry[];
  clear: () => void;
} {
  const history = useSyncExternalStore(subscribe, getHistorySnapshot, getHistorySnapshot);
  return { history, clear: clearHistory };
}


