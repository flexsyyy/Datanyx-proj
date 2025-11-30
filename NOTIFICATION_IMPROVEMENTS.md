# Live Monitor Notification Improvements

## ✅ Changes Implemented

### 1. **Toast Notifications Show ONCE** 🔔

**Problem:** Toast popups were repeating every time data was checked (every 3.5 seconds)

**Solution:** Implemented smart alert tracking system
- Each unique alert gets a unique key (e.g., "Temperature-critical-high")
- Toast notification pops up ONLY the first time that specific alert occurs
- Alert is added to the alerts list every time (for record keeping)
- No more repeated toast spam!

**Example:**
```typescript
// First time Temperature goes critical high → Toast appears
// Next updates with high temp → No toast, but alert stays in list
// If Temperature goes critical LOW → New toast (different alert type)
```

### 2. **Reset Notifications Button** 🔄

Added a "Reset Notifications" button next to the LIVE badge:
- Click to clear the shown alerts tracker
- Allows you to see toast notifications again for repeated issues
- Useful for testing or when you want fresh notifications

**Location:** Top-right of Live Monitor page, next to "LIVE" badge

### 3. **Increased Sensor Variability** 📊

**Enhanced `generateValue()` function:**
- **50% more variance** in normal fluctuations
- **20% chance of extreme values** (outside normal range)
- More frequent alerts for testing and monitoring

**What This Means:**
- More diverse alerts (Temperature high, CO2 low, Humidity critical, etc.)
- Better testing of alert system
- More realistic monitoring simulation

**Alert Trigger Ranges:**

| Parameter | Normal | Warning | Critical |
|-----------|--------|---------|----------|
| **Temperature** | 22-26°C | <22 or >26 | <18 or >30 |
| **Humidity** | 80-90% | <80 or >90 | <70 or >95 |
| **CO2** | 800-1000 ppm | <800 or >1000 | <600 or >1200 |

---

## 🎯 How It Works

### Alert Flow:

```
Sensor Data Update
    ↓
Check if out of range
    ↓
Generate alert key (e.g., "CO2-warning-high")
    ↓
Has this alert been shown? ────→ YES → Add to alerts list (no toast)
    ↓ NO
Show toast popup + Add to alerts list
    ↓
Mark alert as shown
```

### Unique Alert Keys:

Each alert type has a unique identifier:
- `Temperature-critical-high`
- `Temperature-critical-low`
- `Temperature-warning-high`
- `Temperature-warning-low`
- `Humidity-critical-high`
- `Humidity-critical-low`
- ... and so on

This ensures:
✅ Different alert types each get one toast
✅ No spam from repeated checks
✅ All alerts still logged in alerts page

---

## 📱 User Experience

### First Alert:
1. Parameter goes out of range
2. 🎉 **Toast popup appears** (top-right corner)
3. Alert added to alerts list
4. Bell notification count increases

### Subsequent Updates:
1. Parameter still out of range
2. ❌ **No toast** (already shown)
3. Alert continues to be logged
4. Can view all alerts in `/alerts` page

### Reset Notifications:
1. Click "Reset Notifications" button
2. Shown alerts tracker is cleared
3. Next out-of-range value triggers toast again

---

## 🧪 Testing Guide

### Test Unique Toasts:
1. Go to http://localhost:8081/live-monitor
2. Wait for first alert (toast appears)
3. Wait 10 seconds (same alert, no new toast)
4. Click "Reset Notifications"
5. Wait for next alert (toast appears again)

### Test Alert Variety:
1. With increased variability, you should see:
   - Temperature going high AND low
   - Humidity warnings
   - CO2 critical alerts
   - Different combinations
2. Each unique alert type shows toast once

### Test Alert Persistence:
1. Click bell icon in navigation
2. See recent alerts (top 5)
3. Go to `/alerts` page
4. All alerts are listed (even those without toasts)

---

## 🎨 Visual Changes

### Reset Button:
- Icon: ↻ (RotateCcw)
- Label: "Reset Notifications"
- Position: Next to LIVE/PAUSED badge
- Color: Outline button (consistent with design)

### Toast Notifications:
- ⚠️ Icon added to title
- Critical alerts: Red background (destructive variant)
- Warning alerts: Default styling
- Auto-dismiss after 5 seconds

---

## 📊 Benefits

1. **No Spam:** Toasts only show once per unique alert
2. **Complete Record:** All alerts still logged in alerts page
3. **Variety:** More diverse alerts due to increased variability
4. **Control:** Reset button gives users control
5. **Professional:** Clean, non-repetitive notification system

---

## 🔧 Technical Details

**State Management:**
```typescript
const [shownAlerts, setShownAlerts] = useState<Set<string>>(new Set());
```

**Alert Key Generation:**
```typescript
const alertKey = `${paramName}-${severity}-${value < min ? 'low' : 'high'}`;
```

**Toast Check:**
```typescript
const shouldShowToast = !shownAlerts.has(alertKey);
```

**Variability Enhancement:**
```typescript
// 50% more variance
const enhancedVariance = variance * 1.5;

// 20% chance of extreme value
if (Math.random() < 0.2) {
  // Generate value outside normal range
}
```

---

## ✅ Summary

- ✅ Toasts pop up **once per unique alert type**
- ✅ All alerts still logged in alerts page
- ✅ "Reset Notifications" button to see toasts again
- ✅ 50% more variability in sensor data
- ✅ 20% chance of extreme values (triggers more alerts)
- ✅ Bell notification counter still works
- ✅ No spam, professional UX

**Perfect for production use!** 🚀

