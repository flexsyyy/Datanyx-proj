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
import { Thermometer, Droplets, Wind, Activity, Radio } from "lucide-react";
import { format } from "date-fns";
import { useUnits } from "@/contexts/UnitsContext";

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

const MAX_POINTS = 25;

const generateValue = (base: number, variance: number, min: number, max: number): number => {
  const value = base + (Math.random() - 0.5) * variance;
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
  const [sensorData, setSensorData] = useState<SensorData>(createInitialData);
  const [isLive, setIsLive] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isLive) return;
    intervalRef.current = setInterval(() => {
      const time = format(new Date(), "HH:mm:ss");
      setSensorData((prev) => ({
        temperature: [...prev.temperature.slice(1), { time, value: generateValue(24, 3, 18, 30) }],
        humidity: [...prev.humidity.slice(1), { time, value: generateValue(85, 10, 70, 98) }],
        co2: [...prev.co2.slice(1), { time, value: generateValue(900, 300, 600, 1400) }],
        airflow: [...prev.airflow.slice(1), { time, value: generateValue(3.2, 1.5, 1.5, 5) }],
      }));
    }, 3500);
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
    <div className="min-h-screen bg-background">
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
          <Badge
            variant="outline"
            className={`flex items-center gap-2 px-4 py-2 ${isLive ? "border-success text-success" : "border-muted-foreground"}`}
            onClick={() => setIsLive(!isLive)}
            role="button"
          >
            <span className={`h-2 w-2 rounded-full ${isLive ? "bg-success animate-pulse" : "bg-muted-foreground"}`} />
            {isLive ? "LIVE" : "PAUSED"}
          </Badge>
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

