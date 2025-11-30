import { useState, useEffect, useRef } from "react";
import { Navigation } from "@/components/layout/Navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Thermometer, Droplets, Wind, Activity, Radio, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useUnits } from "@/contexts/UnitsContext";
import { useDataContext } from "@/contexts/DataContext";
import { useToast } from "@/hooks/use-toast";

interface DataPoint {
  time: string;
  value: number;
}

interface SensorData {
  temperature: DataPoint[];
  humidity: DataPoint[];
  co2: DataPoint[];
  airflow: DataPoint[];
}

interface AWSDataPoint {
  temp_C: number;
  humidity_pct: number;
  CO2_ppm: number;
  light_lux: number;
  substrate_moisture_pct: number;
  water_quality_index: number;
  timestamp?: string;
}

const MAX_POINTS = 25;
const AWS_API_URL = 'https://wcwmzfhxsc.execute-api.ap-south-1.amazonaws.com/prod/dataset';

const generateValue = (base: number, variance: number, min: number, max: number): number => {
  const random = Math.random();
  
  // 8% chance: Critical LOW (gradual change, not sudden)
  if (random < 0.08) {
    return min - (Math.random() * 3 + 1); // 1-4 units below min
  }
  
  // 8% chance: Critical HIGH (gradual change, not sudden)
  if (random < 0.16) {
    return max + (Math.random() * 3 + 1); // 1-4 units above max
  }
  
  // 14% chance: Warning LOW (slightly below optimal)
  if (random < 0.30) {
    return min - Math.random() * 1.5; // 0-1.5 units below min
  }
  
  // 14% chance: Warning HIGH (slightly above optimal)
  if (random < 0.44) {
    return max + Math.random() * 1.5; // 0-1.5 units above max
  }
  
  // 56% chance: Normal range with smooth transitions
  const value = base + (Math.random() - 0.5) * variance * 0.6;
  return Math.min(max, Math.max(min, value));
};

const createInitialData = (): SensorData => {
  const now = Date.now();
  const data: SensorData = { temperature: [], humidity: [], co2: [], airflow: [] };
  for (let i = MAX_POINTS - 1; i >= 0; i--) {
    const time = format(new Date(now - i * 4000), "HH:mm:ss");
    data.temperature.push({ time, value: generateValue(24, 3, 18, 30) });
    data.humidity.push({ time, value: generateValue(85, 10, 70, 98) });
    data.co2.push({ time, value: generateValue(900, 300, 600, 1400) });
    data.airflow.push({ time, value: generateValue(3.2, 1.5, 1.5, 5) });
  }
  return data;
};

interface KPIDisplayProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  unit: string;
  status: "normal" | "warning" | "critical";
  optimal: string;
}

function KPIDisplay({ icon, label, value, unit, status, optimal }: KPIDisplayProps) {
  const statusColors = {
    normal: "border-success/30 bg-success/5",
    warning: "border-warning/30 bg-warning/5",
    critical: "border-critical/30 bg-critical/5",
  };
  const valueColors = {
    normal: "text-success",
    warning: "text-warning",
    critical: "text-critical",
  };
  return (
    <Card className={`p-4 border-2 ${statusColors[status]} transition-all duration-500 hover:shadow-lg`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-muted rounded-lg">{icon}</div>
          <span className="font-medium text-sm">{label}</span>
        </div>
        <Badge variant="outline" className="text-xs">{optimal}</Badge>
      </div>
      <div className={`text-3xl font-bold ${valueColors[status]} transition-all duration-300`}>
        {value.toFixed(1)}<span className="text-lg ml-1">{unit}</span>
      </div>
    </Card>
  );
}

interface LiveChartProps {
  data: DataPoint[];
  color: string;
  unit: string;
  optimalMin: number;
  optimalMax: number;
  title: string;
  yDomain: [number, number];
}

function LiveChart({ data, color, unit, optimalMin, optimalMax, title, yDomain }: LiveChartProps) {
  return (
    <Card className="p-4 hover:shadow-lg transition-all duration-300">
      <h3 className="text-sm font-medium text-muted-foreground mb-3">{title}</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            <defs>
              <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} />
            <YAxis domain={yDomain} stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              formatter={(value: number) => [`${value.toFixed(1)} ${unit}`, title]}
            />
            <ReferenceLine y={optimalMin} stroke="hsl(var(--success))" strokeDasharray="5 5" strokeOpacity={0.5} />
            <ReferenceLine y={optimalMax} stroke="hsl(var(--success))" strokeDasharray="5 5" strokeOpacity={0.5} />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 2, fill: color }}
              isAnimationActive={true}
              animationDuration={300}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

// Main component continues...
export default function LiveMonitor() {
  const { formatTemperature, formatSpeed, temperatureUnit, speedUnit } = useUnits();
  const { addAlert } = useDataContext();
  const { toast } = useToast();
  const [sensorData, setSensorData] = useState<SensorData>(createInitialData);
  const [isLive, setIsLive] = useState(true);
  const [lastFetchedIndex, setLastFetchedIndex] = useState(0);
  const [shownAlerts, setShownAlerts] = useState<Set<string>>(new Set());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Check if parameter is out of range and create alert (with toast ONCE)
  const checkAndCreateAlert = (paramName: string, value: number, min: number, max: number, critMin: number, critMax: number, unit: string) => {
    let severity: 'warning' | 'critical' | 'info' = 'info';
    let message = '';
    let alertKey = '';
    
    if (value < critMin) {
      severity = 'critical';
      message = `${paramName} at ${value.toFixed(1)}${unit} is critically low! Optimal: ${min}-${max}${unit}. Immediate action required.`;
      alertKey = `${paramName}-critical-low`;
    } else if (value > critMax) {
      severity = 'critical';
      message = `${paramName} at ${value.toFixed(1)}${unit} is critically high! Optimal: ${min}-${max}${unit}. Immediate action required.`;
      alertKey = `${paramName}-critical-high`;
    } else if (value < min) {
      severity = 'warning';
      message = `${paramName} at ${value.toFixed(1)}${unit} is below optimal range (${min}-${max}${unit}). Consider adjusting.`;
      alertKey = `${paramName}-warning-low`;
    } else if (value > max) {
      severity = 'warning';
      message = `${paramName} at ${value.toFixed(1)}${unit} is above optimal range (${min}-${max}${unit}). Consider adjusting.`;
      alertKey = `${paramName}-warning-high`;
    } else {
      // Value is normal - clear this parameter's alerts
      setShownAlerts(prev => {
        const newSet = new Set(prev);
        newSet.delete(`${paramName}-critical-low`);
        newSet.delete(`${paramName}-critical-high`);
        newSet.delete(`${paramName}-warning-low`);
        newSet.delete(`${paramName}-warning-high`);
        return newSet;
      });
      return;
    }
    
    // Only show toast if we haven't shown this exact alert before
    const shouldShowToast = !shownAlerts.has(alertKey);
    
    // Create alert ONLY ONCE (not every time)
    if (shouldShowToast) {
      addAlert({
        severity,
        title: `${paramName} ${severity === 'critical' ? 'Critical' : 'Warning'}`,
        message,
        time: 'Just now',
      });
      
      // Show toast notification based on severity
      // Critical: Always show toast
      // Warning: Only 50% chance to show toast (less intrusive)
      const shouldShowToastPopup = severity === 'critical' || Math.random() < 0.5;
      
      if (shouldShowToastPopup) {
        toast({
          title: severity === 'critical' ? '🔴 Critical Alert!' : '⚠️ Warning',
          description: severity === 'critical' 
            ? message 
            : `${message} Take action now to prevent critical issues.`,
          variant: severity === 'critical' ? 'destructive' : 'default',
        });
      }
      
      // Mark this alert as shown
      setShownAlerts(prev => new Set([...prev, alertKey]));
    }
  };

  // Add variety to AWS data with smoother, gradual changes
  const addVarietyToData = (value: number, baseOptimal: number, variance: number): number => {
    const random = Math.random();
    
    if (random < 0.08) {
      // 8% chance: Way below optimal (gradual change)
      return value - (Math.random() * variance * 0.4);
    }
    if (random < 0.16) {
      // 8% chance: Way above optimal (gradual change)
      return value + (Math.random() * variance * 0.4);
    }
    if (random < 0.30) {
      // 14% chance: Slightly below
      return value - (Math.random() * variance * 0.15);
    }
    if (random < 0.44) {
      // 14% chance: Slightly above
      return value + (Math.random() * variance * 0.15);
    }
    
    // 56% chance: Very small variation for smooth transitions
    return value + (Math.random() - 0.5) * variance * 0.15;
  };

  // Fetch latest data from AWS
  const fetchAWSData = async () => {
    try {
      const response = await fetch(`${AWS_API_URL}?limit=1`);
      if (!response.ok) return null;
      
      const result = await response.json();
      
      // AWS API returns data in a "value" array
      const data: AWSDataPoint[] = result.value || result;
      if (!data || data.length === 0) return null;
      
      // Convert string values to numbers
      const point = data[0];
      const baseTemp = parseFloat(point.temp_C as any) || 24;
      const baseHumidity = parseFloat(point.humidity_pct as any) || 85;
      const baseCO2 = parseFloat(point.CO2_ppm as any) || 900;
      
      // Add variety to make data more realistic and trigger different alerts
      return {
        temp_C: addVarietyToData(baseTemp, 24, 6),
        humidity_pct: addVarietyToData(baseHumidity, 85, 15),
        CO2_ppm: addVarietyToData(baseCO2, 900, 400),
        light_lux: parseFloat(point.light_lux as any) || 0,
        substrate_moisture_pct: parseFloat(point.substrate_moisture_pct as any) || 0,
        water_quality_index: parseFloat(point.water_quality_index as any) || 0,
        timestamp: point.timestamp,
      };
    } catch (error) {
      console.error('Failed to fetch AWS data:', error);
      return null;
    }
  };

  // Initial data fetch on mount
  useEffect(() => {
    const loadInitialData = async () => {
      const awsData = await fetchAWSData();
      if (awsData) {
        const time = format(new Date(), "HH:mm:ss");
        setSensorData((prev) => ({
          temperature: [...prev.temperature.slice(1), { time, value: awsData.temp_C }],
          humidity: [...prev.humidity.slice(1), { time, value: awsData.humidity_pct }],
          co2: [...prev.co2.slice(1), { time, value: awsData.CO2_ppm }],
          airflow: [...prev.airflow.slice(1), { time, value: awsData.light_lux / 100 }],
        }));
      }
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    if (!isLive) return;
    
    intervalRef.current = setInterval(async () => {
      const time = format(new Date(), "HH:mm:ss");
      const awsData = await fetchAWSData();
      
      if (awsData) {
        // Use AWS data
        setSensorData((prev) => ({
          temperature: [...prev.temperature.slice(1), { time, value: awsData.temp_C }],
          humidity: [...prev.humidity.slice(1), { time, value: awsData.humidity_pct }],
          co2: [...prev.co2.slice(1), { time, value: awsData.CO2_ppm }],
          airflow: [...prev.airflow.slice(1), { time, value: awsData.light_lux / 100 }], // Using light as proxy for airflow
        }));
        
        // Check for out-of-range parameters and create alerts
        checkAndCreateAlert('Temperature', awsData.temp_C, 22, 26, 18, 30, '°C');
        checkAndCreateAlert('Humidity', awsData.humidity_pct, 80, 90, 70, 95, '%');
        checkAndCreateAlert('CO2', awsData.CO2_ppm, 800, 1000, 600, 1400, ' ppm');
        
      } else {
        // Fallback to generated data if AWS fails
        const tempVal = generateValue(24, 3, 18, 30);
        const humVal = generateValue(85, 10, 70, 98);
        const co2Val = generateValue(900, 300, 600, 1400);
        const airVal = generateValue(3.2, 1.5, 1.5, 5);
        
        setSensorData((prev) => ({
          temperature: [...prev.temperature.slice(1), { time, value: tempVal }],
          humidity: [...prev.humidity.slice(1), { time, value: humVal }],
          co2: [...prev.co2.slice(1), { time, value: co2Val }],
          airflow: [...prev.airflow.slice(1), { time, value: airVal }],
        }));
        
        // Check for alerts with generated data too
        checkAndCreateAlert('Temperature', tempVal, 22, 26, 18, 30, '°C');
        checkAndCreateAlert('Humidity', humVal, 80, 90, 70, 95, '%');
        checkAndCreateAlert('CO2', co2Val, 800, 1000, 600, 1400, ' ppm');
      }
    }, 7500); // Update every 7.5 seconds
    
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isLive]);

  const getLatestValue = (data: DataPoint[]) => data[data.length - 1]?.value ?? 0;
  const getStatus = (value: number, min: number, max: number, critMin: number, critMax: number) => {
    if (value < critMin || value > critMax) return "critical";
    if (value < min || value > max) return "warning";
    return "normal";
  };

  // Convert temperature and airflow for display
  const tempRaw = getLatestValue(sensorData.temperature);
  const temp = temperatureUnit === "°F" ? (tempRaw * 9/5) + 32 : tempRaw;
  const hum = getLatestValue(sensorData.humidity);
  const co2 = getLatestValue(sensorData.co2);
  const airRaw = getLatestValue(sensorData.airflow);
  const air = speedUnit === "ft/s" ? airRaw * 3.28084 : airRaw;
  
  // Convert optimal ranges for temperature and airflow
  const tempMin = temperatureUnit === "°F" ? (22 * 9/5) + 32 : 22;
  const tempMax = temperatureUnit === "°F" ? (26 * 9/5) + 32 : 26;
  const airMin = speedUnit === "ft/s" ? 2.5 * 3.28084 : 2.5;
  const airMax = speedUnit === "ft/s" ? 4.0 * 3.28084 : 4.0;

  return (
    <div className="min-h-screen bg-transparent">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Radio className="h-7 w-7 text-primary" />
              </div>
              Live Monitoring
            </h1>
            <p className="text-muted-foreground mt-2">Real-time environmental sensor data</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShownAlerts(new Set());
                toast({
                  title: "Alerts Reset",
                  description: "You will now see notifications for new alerts again.",
                });
              }}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset Notifications
            </Button>
            <Badge
              variant="outline"
              className={`flex items-center gap-2 px-4 py-2 cursor-pointer ${isLive ? "border-success text-success" : "border-muted-foreground"}`}
              onClick={() => setIsLive(!isLive)}
              role="button"
            >
              <span className={`h-2 w-2 rounded-full ${isLive ? "bg-success animate-pulse" : "bg-muted-foreground"}`} />
              {isLive ? "LIVE" : "PAUSED"}
            </Badge>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KPIDisplay
            icon={<Thermometer className="h-5 w-5 text-critical" />}
            label="Temperature"
            value={temp}
            unit={temperatureUnit}
            status={getStatus(temp, tempMin, tempMax, temperatureUnit === "°F" ? (18 * 9/5) + 32 : 18, temperatureUnit === "°F" ? (30 * 9/5) + 32 : 30)}
            optimal={`${tempMin.toFixed(0)}-${tempMax.toFixed(0)}${temperatureUnit}`}
          />
          <KPIDisplay
            icon={<Droplets className="h-5 w-5 text-info" />}
            label="Humidity"
            value={hum}
            unit="%"
            status={getStatus(hum, 80, 90, 70, 95)}
            optimal="80-90%"
          />
          <KPIDisplay
            icon={<Wind className="h-5 w-5 text-warning" />}
            label="CO2 Level"
            value={co2}
            unit="ppm"
            status={getStatus(co2, 800, 1000, 600, 1200)}
            optimal="800-1000"
          />
          <KPIDisplay
            icon={<Activity className="h-5 w-5 text-accent" />}
            label="Airflow"
            value={air}
            unit={speedUnit}
            status={getStatus(air, airMin, airMax, speedUnit === "ft/s" ? 1.5 * 3.28084 : 1.5, speedUnit === "ft/s" ? 5.0 * 3.28084 : 5.0)}
            optimal={`${airMin.toFixed(1)}-${airMax.toFixed(1)}`}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          <LiveChart
            data={sensorData.temperature.map(d => ({ ...d, value: temperatureUnit === "°F" ? (d.value * 9/5) + 32 : d.value }))}
            color="hsl(0, 72%, 51%)"
            unit={temperatureUnit}
            optimalMin={tempMin}
            optimalMax={tempMax}
            title={`Temperature (${temperatureUnit})`}
            yDomain={temperatureUnit === "°F" ? [(15 * 9/5) + 32, (35 * 9/5) + 32] : [15, 35]}
          />
          <LiveChart
            data={sensorData.humidity}
            color="hsl(199, 89%, 48%)"
            unit="%"
            optimalMin={80}
            optimalMax={90}
            title="Humidity (%)"
            yDomain={[60, 100]}
          />
          <LiveChart
            data={sensorData.co2}
            color="hsl(35, 92%, 50%)"
            unit="ppm"
            optimalMin={800}
            optimalMax={1000}
            title="CO2 Level (ppm)"
            yDomain={[400, 1600]}
          />
          <LiveChart
            data={sensorData.airflow.map(d => ({ ...d, value: speedUnit === "ft/s" ? d.value * 3.28084 : d.value }))}
            color="hsl(142, 43%, 24%)"
            unit={speedUnit}
            optimalMin={airMin}
            optimalMax={airMax}
            title={`Airflow (${speedUnit})`}
            yDomain={speedUnit === "ft/s" ? [0, 6 * 3.28084] : [0, 6]}
          />
        </div>

        {/* System Status */}
        <Card className="mt-6 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-success animate-pulse" />
              <span className="text-sm text-muted-foreground">All sensors operational</span>
            </div>
            <span className="text-xs text-muted-foreground">
              Last update: {format(new Date(), "HH:mm:ss")}
            </span>
          </div>
        </Card>
      </main>
    </div>
  );
}

