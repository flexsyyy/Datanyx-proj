# Mushroom Sensor Monitor - Project Report

## Overview

Built a React.js + TypeScript single-page application to monitor a live mushroom sensor API from AWS. The app polls data every 3 seconds, displays real-time readings with smooth value transitions, and maintains a history log to verify AWS connectivity and data integrity.

---

## Project Structure

```
src/
├── App.tsx                          # Main app with hash-based routing
├── main.tsx                         # React entry point
├── config.ts                        # API URL and helper functions
├── types/
│   └── sensor.ts                    # TypeScript interfaces
├── store/
│   └── sensorHistory.ts             # Shared state store with localStorage
├── components/
│   ├── MushroomMonitorPage.tsx      # Live monitor with polling
│   ├── MushroomMonitorPage.css      # Monitor styles
│   ├── SensorHistoryPage.tsx        # History viewer with AWS verification
│   └── SensorHistoryPage.css        # History styles
```

---

## Key Features Implemented

### 1. Live API Polling (MushroomMonitorPage)

**Endpoint:** `https://a9tpfpdyxh.execute-api.ap-south-1.amazonaws.com/status`

**Implementation:**
```typescript
useEffect(() => {
  fetchSensorData();  // Initial fetch
  
  intervalRef.current = window.setInterval(() => {
    fetchSensorData();
  }, 3000);  // Poll every 3 seconds
  
  return () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
    }
  };
}, []);
```

**API Response Format:**
```json
{
  "data": [{
    "device_id": "sim-device-01",
    "mushroom_type": "oyster",
    "timestamp": "2025-11-29T17:09:32.800776+00:00",
    "temperature_c": 23.78,
    "humidity_pct": 93.5,
    "co2_ppm": 926,
    "light_lux": 146,
    "status": "good"
  }]
}
```

---

### 2. Value Smoothing (Prevents Jumpy UI)

**Problem:** Raw API values change randomly each poll, causing jarring visual updates.

**Solution:** Exponential smoothing with factor 0.4

```typescript
const smoothValue = (oldValue: number, newValue: number): number => {
  return oldValue + 0.4 * (newValue - oldValue);
};

// Applied to all numeric fields:
setDisplayReading((prevDisplay) => ({
  ...latestReading,
  temperature_c: smoothValue(prevDisplay.temperature_c, latestReading.temperature_c),
  humidity_pct: smoothValue(prevDisplay.humidity_pct, latestReading.humidity_pct),
  co2_ppm: smoothValue(prevDisplay.co2_ppm, latestReading.co2_ppm),
  light_lux: smoothValue(prevDisplay.light_lux, latestReading.light_lux),
}));
```

**Result:** Values transition gradually instead of jumping, creating a smooth user experience.

---

### 3. History Store with localStorage (sensorHistory.ts)

**Purpose:** Persist all API responses for verification and debugging.

**Key Design Decisions:**

1. **Used `useSyncExternalStore`** - React 18's recommended way to subscribe to external stores
2. **localStorage persistence** - History survives page refreshes
3. **Max 500 entries** - Prevents unbounded growth

**Store Implementation:**
```typescript
let historyState: SensorHistoryEntry[] = loadFromStorage();
const listeners = new Set<Listener>();

export function addHistoryEntry(entry: SensorHistoryEntry): void {
  historyState = [...historyState, entry].slice(-MAX_ENTRIES);
  saveToStorage(historyState);
  emit();  // Notify all subscribers
}

export function getHistorySnapshot(): SensorHistoryEntry[] {
  return historyState;  // Return same reference (critical for useSyncExternalStore)
}

export function useSensorHistory() {
  const history = useSyncExternalStore(subscribe, getHistorySnapshot, getHistorySnapshot);
  return { history, clear: clearHistory };
}
```

**Data Captured Per Entry:**
```typescript
interface SensorHistoryEntry {
  reading: SensorReading;           // Full sensor data
  fetchedAt: string;                // Client-side timestamp (ISO)
  responseStatus: number;           // HTTP status code
  responseHeaders: Record<string, string>;  // All response headers
}
```

---

### 4. AWS Verification (SensorHistoryPage)

**Purpose:** Prove data is actually coming from AWS API Gateway.

**AWS Header Detection:**
```typescript
function hasAwsHeaders(headers: Record<string, string>): boolean {
  const lowerKeys = Object.keys(headers).map(k => k.toLowerCase());
  return lowerKeys.some(k => 
    k.startsWith('x-amz') || 
    k.startsWith('x-amzn') || 
    k === 'apigw-requestid' ||
    k.includes('apigw') ||
    k.includes('amazon')
  );
}
```

**Headers Observed from AWS:**
- `apigw-requestid: U0NYLgpyBcwEJaA=` ← API Gateway request ID
- `access-control-allow-origin: *`
- `content-type: application/json`

**UI Features:**
- Table showing all recorded entries with timestamps
- "AWS" column: Green "Yes" / Red "No" based on header detection
- Expandable "Details" panel showing raw JSON reading + full response headers
- "Fetch once" button for manual testing
- "Export JSON" to download full history
- "Clear" to reset

---

### 5. Navigation (App.tsx)

**Simple hash-based routing:**
```typescript
const [route, setRoute] = useState<string>(() => window.location.hash || '#/monitor');

useEffect(() => {
  const onHashChange = () => setRoute(window.location.hash || '#/monitor');
  window.addEventListener('hashchange', onHashChange);
  return () => window.removeEventListener('hashchange', onHashChange);
}, []);

// Render based on route
{route === '#/history' ? <SensorHistoryPage /> : <MushroomMonitorPage />}
```

**Routes:**
- `#/monitor` - Live sensor display (default)
- `#/history` - Historical data viewer

---

## Bug Fixes

### 1. Duplicate Default Export Error

**Problem:** `HistoryPage.tsx` had two default exports:
```typescript
export { default } from './SensorHistoryPage';  // Line 1
// ... component code ...
export default HistoryPage;  // Line 150
```

**Fix:** Deleted the duplicate file, kept only `SensorHistoryPage.tsx`.

---

### 2. Infinite Loop in useSyncExternalStore

**Error:**
```
Warning: The result of getSnapshot should be cached to avoid an infinite loop
Error: Maximum update depth exceeded
```

**Problem:** `getHistorySnapshot` was returning a new array every call:
```typescript
// BAD - creates new reference every call
export function getHistorySnapshot() {
  return [...historyState];
}
```

**Why it broke:** `useSyncExternalStore` compares snapshots by reference (`Object.is`). New array = always different = infinite re-renders.

**Fix:**
```typescript
// GOOD - returns same reference, only changes when data actually changes
export function getHistorySnapshot() {
  return historyState;
}
```

---

## Technologies Used

| Technology | Purpose |
|------------|---------|
| React 18 | UI framework |
| TypeScript | Type safety |
| Vite | Build tool & dev server |
| useSyncExternalStore | External state subscription |
| localStorage | History persistence |
| fetch API | HTTP requests |
| CSS (no libs) | Styling |

---

## How to Run

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Open browser
# http://localhost:5173/#/monitor  (live monitor)
# http://localhost:5173/#/history  (history viewer)
```

---

## Verification Steps

1. **Open Monitor page** - Wait 10+ seconds for several readings
2. **Switch to History page** - See all recorded entries
3. **Check AWS column** - Should show "Yes" for all rows
4. **Click "View" on any row** - Inspect raw headers including `apigw-requestid`
5. **Refresh page** - History persists (localStorage)
6. **Click "Fetch once"** - Manual test, entry appears immediately

---

## Files Summary

| File | Lines | Purpose |
|------|-------|---------|
| `src/App.tsx` | 34 | Router + navigation |
| `src/components/MushroomMonitorPage.tsx` | 244 | Live monitor with smoothing |
| `src/components/SensorHistoryPage.tsx` | 161 | History viewer + AWS check |
| `src/store/sensorHistory.ts` | 76 | Shared state + localStorage |
| `src/config.ts` | 18 | API URL + region parsing |
| `src/types/sensor.ts` | 19 | TypeScript interfaces |

---

## Conclusion

The application successfully:
- ✅ Polls AWS API every 3 seconds
- ✅ Displays live sensor data with smooth transitions
- ✅ Records all responses with full HTTP headers
- ✅ Verifies AWS origin via `apigw-requestid` header
- ✅ Persists history in localStorage
- ✅ Provides detailed inspection of each API response

The History page definitively proves data is coming from AWS API Gateway (ap-south-1 region) and being properly recorded.

