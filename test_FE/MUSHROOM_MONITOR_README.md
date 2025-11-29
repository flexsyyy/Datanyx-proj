# Mushroom Sensor Monitor Component

A simple React component for monitoring live mushroom sensor data from an API.

## Files Created

- `src/components/MushroomMonitorPage.tsx` - Main React component
- `src/components/MushroomMonitorPage.css` - Styling for the component

## Features

- ✅ Polls API every 3 seconds
- ✅ Smooth value transitions (exponential smoothing with factor 0.4)
- ✅ Stores last 20 temperature readings for history
- ✅ Dark theme with minimal UI
- ✅ Status indicators (good/warning/bad)
- ✅ Mini temperature time-series chart
- ✅ Error handling and loading states

## Usage

### In your App.tsx (TypeScript):

```tsx
import React from 'react';
import MushroomMonitorPage from './src/components/MushroomMonitorPage';

function App() {
  return (
    <div className="App">
      <MushroomMonitorPage />
    </div>
  );
}

export default App;
```

### In your App.jsx (JavaScript):

If your project uses JavaScript instead of TypeScript, you can either:
1. Use the TypeScript file (if your build system supports it)
2. Or I can generate a JavaScript version for you

Just import the component and render it:

```jsx
import React from 'react';
import MushroomMonitorPage from './src/components/MushroomMonitorPage';

function App() {
  return (
    <div className="App">
      <MushroomMonitorPage />
    </div>
  );
}

export default App;
```

## Component Details

### Smoothing Algorithm

The component uses exponential smoothing to prevent values from jumping drastically:
- Formula: `newDisplay = oldDisplay + 0.4 * (apiValue - oldDisplay)`
- Applied to: temperature_c, humidity_pct, co2_ppm, light_lux

### API Endpoint

The component polls:
```
https://a9tpfpdyxh.execute-api.ap-south-1.amazonaws.com/status
```

### Status Colors

- 🟢 **Green** - "good"
- 🟡 **Yellow** - "warning"  
- 🔴 **Red** - "bad"

## Project Structure

Make sure your project structure looks like this:

```
your-react-app/
├── src/
│   └── components/
│       ├── MushroomMonitorPage.tsx
│       └── MushroomMonitorPage.css
└── App.tsx (or App.jsx)
```

Adjust the import path in `App.tsx` based on your actual project structure.

