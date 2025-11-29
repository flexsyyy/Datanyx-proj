import { useState, useMemo } from "react";
import { Navigation } from "@/components/layout/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import {
  Thermometer,
  Droplets,
  Wind,
  Activity,
  Upload,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Calendar as CalendarIcon,
  Loader2,
  FileSpreadsheet,
  Leaf,
} from "lucide-react";
import { format, subDays, isWithinInterval, startOfDay, endOfDay, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import { useUnits } from "@/contexts/UnitsContext";

// Types
interface PredictionResult {
  yieldAmount: number;
  status: "ideal" | "suboptimal" | "high-risk";
  contaminationRisk: number;
  confidence: number;
}

interface EnvironmentalData {
  temperature: number;
  humidity: number;
  co2: number;
  airflow: number;
  substrateMoisture: number;
  mushroomType: string;
}

interface HistoricalDataPoint {
  date: string;
  predictedYield: number;
  actualYield: number;
  temperature: number;
  humidity: number;
  co2: number;
}

// Generate sample historical data
const generateHistoricalData = (): HistoricalDataPoint[] => {
  const data: HistoricalDataPoint[] = [];
  for (let i = 60; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const baseYield = 45 + Math.random() * 20;
    data.push({
      date: format(date, "yyyy-MM-dd"),
      predictedYield: baseYield + Math.random() * 5 - 2.5,
      actualYield: baseYield + Math.random() * 8 - 4,
      temperature: 22 + Math.random() * 4,
      humidity: 82 + Math.random() * 10,
      co2: 800 + Math.random() * 400,
    });
  }
  return data;
};

const historicalData = generateHistoricalData();

export default function Predict() {
  const { formatTemperature, formatWeight, formatSpeed, temperatureUnit, weightUnit, speedUnit } = useUnits();
  const [formData, setFormData] = useState<EnvironmentalData>({
    temperature: 24,
    humidity: 85,
    co2: 900,
    airflow: 3.0,
    substrateMoisture: 65,
    mushroomType: "oyster",
  });
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const filteredData = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return historicalData;
    
    // Normalize dates to start of day for proper comparison
    const startDate = startOfDay(dateRange.from);
    const endDate = endOfDay(dateRange.to);
    
    const filtered = historicalData.filter((d) => {
      const dataDate = startOfDay(parseISO(d.date));
      return isWithinInterval(dataDate, { start: startDate, end: endDate });
    });
    
    // Sort by date to ensure proper ordering
    return filtered.sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  }, [dateRange]);

  // Calculate optimal tick interval based on data length
  const xAxisInterval = useMemo(() => {
    const dataLength = filteredData.length;
    if (dataLength <= 7) return 0; // Show all ticks
    if (dataLength <= 14) return 1; // Show every other tick
    if (dataLength <= 30) return Math.floor(dataLength / 7); // Show ~7 ticks
    return Math.floor(dataLength / 10); // Show ~10 ticks for larger ranges
  }, [filteredData.length]);

  // Create a unique key for chart re-rendering based on date range
  const chartKey = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return 'default';
    return `${format(dateRange.from, 'yyyy-MM-dd')}-${format(dateRange.to, 'yyyy-MM-dd')}`;
  }, [dateRange]);

  const handlePredict = () => {
    setIsLoading(true);
    setTimeout(() => {
      const { temperature, humidity, co2, substrateMoisture } = formData;
      let status: PredictionResult["status"] = "ideal";
      let contaminationRisk = 5;
      let yieldAmount = 52;
      if (temperature < 20 || temperature > 28 || humidity < 75 || humidity > 95) {
        status = "suboptimal";
        contaminationRisk = 25;
        yieldAmount = 38;
      }
      if (co2 > 1200 || substrateMoisture < 50 || substrateMoisture > 80) {
        status = "high-risk";
        contaminationRisk = 65;
        yieldAmount = 22;
      }
      setPrediction({
        yieldAmount: yieldAmount + Math.random() * 8 - 4,
        status,
        contaminationRisk,
        confidence: 87 + Math.random() * 10,
      });
      setIsLoading(false);
    }, 1500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setUploadedFile(file);
  };

  const getStatusConfig = (status: PredictionResult["status"]) => {
    switch (status) {
      case "ideal":
        return { color: "bg-success text-success-foreground", icon: CheckCircle, label: "Ideal Conditions" };
      case "suboptimal":
        return { color: "bg-warning text-warning-foreground", icon: AlertTriangle, label: "Suboptimal" };
      case "high-risk":
        return { color: "bg-critical text-critical-foreground", icon: AlertTriangle, label: "High Contamination Risk" };
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="h-7 w-7 text-primary" />
            </div>
            Yield Prediction
          </h1>
          <p className="text-muted-foreground mt-2">
            Enter environmental parameters or upload batch data to predict yield outcomes
          </p>
        </div>
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Manual Input Form */}
          <Card className="lg:col-span-2 p-6 hover:shadow-lg transition-all duration-300">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Leaf className="h-5 w-5 text-primary" />
              Environmental Parameters
            </h2>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-2">
                <Label htmlFor="mushroom-type">Mushroom Type</Label>
                <Select
                  value={formData.mushroomType}
                  onValueChange={(v) => setFormData({ ...formData, mushroomType: v })}
                >
                  <SelectTrigger id="mushroom-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="oyster">Oyster</SelectItem>
                    <SelectItem value="shiitake">Shiitake</SelectItem>
                    <SelectItem value="button">Button</SelectItem>
                    <SelectItem value="lions-mane">Lion's Mane</SelectItem>
                    <SelectItem value="reishi">Reishi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="temperature" className="flex items-center gap-2">
                  <Thermometer className="h-4 w-4 text-primary" /> Temperature ({temperatureUnit})
                </Label>
                <Input
                  id="temperature"
                  type="text"
                  inputMode="decimal"
                  value={formData.temperature}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9.]/g, '');
                    setFormData({ ...formData, temperature: parseFloat(val) || 0 });
                  }}
                  className="transition-all focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="humidity" className="flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-info" /> Humidity (%)
                </Label>
                <Input
                  id="humidity"
                  type="text"
                  inputMode="decimal"
                  value={formData.humidity}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9.]/g, '');
                    setFormData({ ...formData, humidity: parseFloat(val) || 0 });
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="co2" className="flex items-center gap-2">
                  <Wind className="h-4 w-4 text-warning" /> CO2 Level (ppm)
                </Label>
                <Input
                  id="co2"
                  type="text"
                  inputMode="numeric"
                  value={formData.co2}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    setFormData({ ...formData, co2: parseInt(val) || 0 });
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="airflow" className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-accent" /> Airflow ({speedUnit})
                </Label>
                <Input
                  id="airflow"
                  type="text"
                  inputMode="decimal"
                  value={formData.airflow}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9.]/g, '');
                    setFormData({ ...formData, airflow: parseFloat(val) || 0 });
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="substrate" className="flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-success" /> Substrate Moisture (%)
                </Label>
                <Input
                  id="substrate"
                  type="text"
                  inputMode="decimal"
                  value={formData.substrateMoisture}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9.]/g, '');
                    setFormData({ ...formData, substrateMoisture: parseFloat(val) || 0 });
                  }}
                />
              </div>
            </div>
            <Button
              onClick={handlePredict}
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary-dark transition-all duration-300 transform hover:scale-[1.02]"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Predict Yield
                </>
              )}
            </Button>
          </Card>

          {/* File Upload & Prediction Results */}
          <div className="space-y-6">
            <Card className="p-6 hover:shadow-lg transition-all duration-300">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                Upload Batch Data
              </h2>
              <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <FileSpreadsheet className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">
                    {uploadedFile ? uploadedFile.name : "Drop CSV/Excel file or click to browse"}
                  </p>
                </label>
              </div>
              {uploadedFile && (
                <Badge variant="secondary" className="mt-3 animate-fade-in">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  File ready for analysis
                </Badge>
              )}
            </Card>

            {prediction && (
              <Card className="p-6 animate-scale-in hover:shadow-lg transition-all duration-300">
                <h2 className="text-lg font-semibold mb-4">Prediction Results</h2>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-muted/50 rounded-xl">
                    <p className="text-sm text-muted-foreground mb-1">Predicted Yield</p>
                    <p className="text-4xl font-bold text-primary animate-count-up">
                      {formatWeight(prediction.yieldAmount)} {weightUnit}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Harvest per Cycle</p>
                      <p className="text-lg font-semibold text-foreground">
                        {formatWeight(prediction.yieldAmount * 0.85)} {weightUnit}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Est. Cycles/Month</p>
                      <p className="text-lg font-semibold text-foreground">2-3</p>
                    </div>
                  </div>
                  {(() => {
                    const config = getStatusConfig(prediction.status);
                    const Icon = config.icon;
                    return (
                      <Badge className={cn("w-full justify-center py-2", config.color)}>
                        <Icon className="h-4 w-4 mr-2" />
                        {config.label}
                      </Badge>
                    );
                  })()}
                  {prediction.status === "high-risk" && (
                    <div className="p-3 bg-critical/10 border border-critical/20 rounded-lg">
                      <p className="text-sm text-critical font-medium">
                        ⚠️ Contamination Risk: {prediction.contaminationRisk}%
                      </p>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Confidence</span>
                    <span className="font-medium">{prediction.confidence.toFixed(0)}%</span>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Charts Section */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <h2 className="text-lg font-semibold">Historical Trends</h2>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full md:w-auto justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d, yyyy")}
                      </>
                    ) : (
                      format(dateRange.from, "MMM d, yyyy")
                    )
                  ) : (
                    "Pick date range"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Yield Comparison Chart */}
            <div className="h-80 w-full overflow-hidden">
              <h3 className="text-sm font-medium text-muted-foreground mb-4">Predicted vs Actual Yield ({weightUnit})</h3>
              {filteredData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p>No data available for the selected date range</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%" key={`line-${chartKey}`}>
                  <LineChart 
                    data={filteredData}
                    margin={{ top: 5, right: 10, left: 0, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(v) => {
                        try {
                          return format(parseISO(v), "MMM d");
                        } catch {
                          return format(new Date(v), "MMM d");
                        }
                      }}
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={11}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      interval={xAxisInterval}
                      minTickGap={10}
                    />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={11}
                    domain={['auto', 'auto']}
                    width={50}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    labelFormatter={(v) => {
                      try {
                        return format(parseISO(v), "MMM d, yyyy");
                      } catch {
                        return format(new Date(v), "MMM d, yyyy");
                      }
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Line
                    type="monotone"
                    dataKey="predictedYield"
                    name="Predicted"
                    stroke="hsl(142, 43%, 24%)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="actualYield"
                    name="Actual"
                    stroke="hsl(75, 45%, 45%)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Environmental Trends Chart */}
            <div className="h-80 w-full overflow-hidden">
              <h3 className="text-sm font-medium text-muted-foreground mb-4">Environmental Parameters</h3>
              {filteredData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p>No data available for the selected date range</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%" key={`area-${chartKey}`}>
                  <AreaChart 
                    data={filteredData}
                    margin={{ top: 5, right: 10, left: 0, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(v) => {
                        try {
                          return format(parseISO(v), "MMM d");
                        } catch {
                          return format(new Date(v), "MMM d");
                        }
                      }}
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={11}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      interval={xAxisInterval}
                      minTickGap={10}
                    />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={11}
                    domain={['auto', 'auto']}
                    width={50}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    labelFormatter={(v) => {
                      try {
                        return format(parseISO(v), "MMM d, yyyy");
                      } catch {
                        return format(new Date(v), "MMM d, yyyy");
                      }
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Area
                    type="monotone"
                    dataKey="temperature"
                    name={`Temp (${temperatureUnit})`}
                    stroke="hsl(0, 72%, 51%)"
                    fill="hsl(0, 72%, 51%, 0.1)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="humidity"
                    name="Humidity (%)"
                    stroke="hsl(199, 89%, 48%)"
                    fill="hsl(199, 89%, 48%, 0.1)"
                    strokeWidth={2}
                  />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}

