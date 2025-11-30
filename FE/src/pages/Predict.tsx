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
  BarChart3,
} from "lucide-react";
import { format, subDays, isWithinInterval, startOfDay, endOfDay, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import { useUnits } from "@/contexts/UnitsContext";
import { useDataContext } from "@/contexts/DataContext";
import { useToast } from "@/hooks/use-toast";

// Types
interface MLPredictionResponse {
  category: 'HIGH' | 'GOOD' | 'MEDIUM' | 'LOW';
  color: string;
  description: string;
  harvest_cycle: number;
  input: {
    species: string;
    temperature_c: number;
    humidity_pct: number;
    co2_ppm: number;
    substrate_moisture: number;
    light_lux: number;
    water_quality_index: number;
  };
}

interface PredictionResult {
  yieldRange: { min: number; max: number };
  yieldEstimate: number;
  status: "ideal" | "suboptimal" | "high-risk";
  contaminationRisk: number;
  confidence: number;
  mlPrediction?: MLPredictionResponse;
  llmRecommendations?: string;
}

interface EnvironmentalData {
  temperature: number;
  humidity: number;
  co2: number;
  airflow: number;
  substrateMoisture: number;
  mushroomType: string;
  lightLux?: number;
  waterQuality?: number;
}

const ML_API_URL = 'http://localhost:3002/api/predict';
const CHATBOT_API_URL = 'http://localhost:3001/api/chatbot/fungi';

interface HistoricalDataPoint {
  date: string;
  predictedYield: number;
  actualYield: number;
  temperature: number;
  humidity: number;
  co2: number;
}

// Generate sample historical data
const generateInitialHistoricalData = (): HistoricalDataPoint[] => {
  const data: HistoricalDataPoint[] = [];
  for (let i = 60; i >= 1; i--) {
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

export default function Predict() {
  const { formatTemperature, formatWeight, formatSpeed, temperatureUnit, weightUnit, speedUnit } = useUnits();
  const { updatePrediction } = useDataContext();
  const { toast } = useToast();
  const [formData, setFormData] = useState<EnvironmentalData>({
    temperature: 24,
    humidity: 85,
    co2: 900,
    airflow: 3.0,
    substrateMoisture: 65,
    mushroomType: "oyster",
    lightLux: 500,
    waterQuality: 80,
  });
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingLLM, setIsLoadingLLM] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  
  // Load historical data from localStorage or generate initial
  const loadHistoricalData = (): HistoricalDataPoint[] => {
    const stored = localStorage.getItem('historicalPredictionData');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('Failed to load historical data:', error);
      }
    }
    return generateInitialHistoricalData();
  };

  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>(loadHistoricalData);
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

  const mapMushroomType = (type: string): string => {
    const mapping: Record<string, string> = {
      'oyster': 'Oyster',
      'shiitake': 'Shiitake',
      'button': 'Button',
      'lions-mane': 'Lions Mane',
      'reishi': 'Reishi',
    };
    return mapping[type] || 'Oyster';
  };

  const handlePredict = async () => {
    setIsLoading(true);
    setPrediction(null);
    
    try {
      // Map form data to ML API format
      const mlPayload = {
        species: mapMushroomType(formData.mushroomType),
        temperature_c: formData.temperature,
        humidity_pct: formData.humidity,
        co2_ppm: formData.co2,
        light_lux: formData.lightLux || 500,
        substrate_moisture: formData.substrateMoisture,
        water_quality_index: formData.waterQuality || 80,
      };

      // Call ML API
      const mlResponse = await fetch(ML_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mlPayload),
      });

      if (!mlResponse.ok) {
        throw new Error(`ML API error: ${mlResponse.statusText}`);
      }

      const mlPrediction: MLPredictionResponse = await mlResponse.json();

      // Calculate accurate yield based on ML model's harvest cycle
      // Harvest cycle from ML model (3-6):
      // - Cycle 6 = HIGH yield (fastest harvest, best conditions)
      // - Cycle 5 = GOOD yield
      // - Cycle 4 = MEDIUM yield
      // - Cycle 3 = LOW yield (slowest harvest, poor conditions)
      
      const harvestCycle = mlPrediction.harvest_cycle;
      let status: PredictionResult["status"] = "ideal";
      let contaminationRisk = 5;
      let yieldAmount = 0;
      
      // Calculate yield RANGE based on harvest cycle
      // The ML model predicts harvest cycle quality, not exact kg
      // We estimate typical yield ranges per cycle
      let yieldMin = 0;
      let yieldMax = 0;
      
      if (harvestCycle === 6) {
        // HIGH: 55-65 kg range
        yieldMin = 55;
        yieldMax = 65;
        status = "ideal";
        contaminationRisk = 5;
        yieldAmount = (yieldMin + yieldMax) / 2;
      } else if (harvestCycle === 5) {
        // GOOD: 45-55 kg range
        yieldMin = 45;
        yieldMax = 55;
        status = "ideal";
        contaminationRisk = 10;
        yieldAmount = (yieldMin + yieldMax) / 2;
      } else if (harvestCycle === 4) {
        // MEDIUM: 35-45 kg range
        yieldMin = 35;
        yieldMax = 45;
        status = "suboptimal";
        contaminationRisk = 25;
        yieldAmount = (yieldMin + yieldMax) / 2;
      } else {
        // LOW (cycle 3): 20-30 kg range
        yieldMin = 20;
        yieldMax = 30;
        status = "high-risk";
        contaminationRisk = 65;
        yieldAmount = (yieldMin + yieldMax) / 2;
      }
      
      // Fine-tune estimate based on specific conditions
      const tempVariation = (formData.temperature - 23) * 0.5; // ±2.5kg max
      const humidityVariation = (formData.humidity - 85) * 0.2; // ±2kg max
      yieldAmount = Math.max(yieldMin, Math.min(yieldMax, yieldAmount + tempVariation + humidityVariation));

      // Get LLM recommendations
      setIsLoadingLLM(true);
      let llmRecommendations = '';
      
      try {
        const llmResponse = await fetch(CHATBOT_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userMessage: `Provide a concise, professional assessment (max 4-5 sentences) with bullet-point recommendations:

ML Prediction: ${mlPrediction.category} yield (harvest cycle: ${mlPrediction.harvest_cycle})
Species: ${mapMushroomType(formData.mushroomType)}
Conditions: Temp ${formData.temperature}°C, Humidity ${formData.humidity}%, CO2 ${formData.co2}ppm, Substrate Moisture ${formData.substrateMoisture}%, Light ${formData.lightLux || 500}lux, Water Quality ${formData.waterQuality || 80}/100

Format your response as:
1. Brief 2-3 sentence overall assessment
2. 3-4 bullet points with specific, actionable recommendations

Keep it concise and professional. No lengthy explanations.`,
            chatHistory: [],
            sensorPayload: {
              species: mapMushroomType(formData.mushroomType) as any,
              temperature_c: formData.temperature,
              humidity_pct: formData.humidity,
              co2_ppm: formData.co2,
              light_lux: formData.lightLux || 500,
              substrate_moisture: formData.substrateMoisture,
              water_quality_index: formData.waterQuality || 80,
            },
          }),
        });

        if (llmResponse.ok) {
          const llmData = await llmResponse.json();
          llmRecommendations = llmData.reply || '';
        }
      } catch (llmError) {
        console.error('LLM API error:', llmError);
        llmRecommendations = 'LLM recommendations unavailable. Please ensure the chatbot server is running.';
      } finally {
        setIsLoadingLLM(false);
      }

      // Calculate confidence based on how optimal the conditions are
      // Higher harvest cycle = better conditions = higher confidence
      let confidence = 0;
      if (harvestCycle === 6) {
        confidence = 92 + Math.random() * 6; // 92-98%
      } else if (harvestCycle === 5) {
        confidence = 85 + Math.random() * 6; // 85-91%
      } else if (harvestCycle === 4) {
        confidence = 75 + Math.random() * 8; // 75-83%
      } else {
        confidence = 65 + Math.random() * 8; // 65-73%
      }

      // Additional confidence adjustments based on parameter stability
      const tempOptimal = formData.temperature >= 20 && formData.temperature <= 26;
      const humidityOptimal = formData.humidity >= 80 && formData.humidity <= 90;
      const co2Optimal = formData.co2 >= 800 && formData.co2 <= 1000;
      
      const optimalCount = [tempOptimal, humidityOptimal, co2Optimal].filter(Boolean).length;
      confidence += (optimalCount - 1.5) * 2; // Adjust ±3% based on parameter optimality
      
      const finalYieldEstimate = Math.round(yieldAmount * 10) / 10; // Round to 1 decimal place
      const finalConfidence = Math.min(98, Math.max(60, Math.round(confidence)));
      
      const predictionResult: PredictionResult = {
        yieldRange: { min: yieldMin, max: yieldMax },
        yieldEstimate: finalYieldEstimate,
        status,
        contaminationRisk,
        confidence: finalConfidence,
        mlPrediction,
        llmRecommendations,
      };
      
      setPrediction(predictionResult);
      
      // Save to global context (sessionStorage)
      updatePrediction({
        yieldRange: { min: yieldMin, max: yieldMax },
        harvestCycle: mlPrediction.harvest_cycle,
        category: mlPrediction.category,
        status,
        confidence: finalConfidence,
        contaminationRisk,
        timestamp: new Date().toISOString(),
        inputs: {
          temperature: formData.temperature,
          humidity: formData.humidity,
          co2: formData.co2,
          species: mapMushroomType(formData.mushroomType),
        },
      });

      // Add this prediction to historical data
      // Predicted yield is what we expect before running ML, actual is the ML result
      const predictedYieldEstimate = 40 + (harvestCycle - 3) * 8; // Rough estimate based on cycle
      
      const newDataPoint: HistoricalDataPoint = {
        date: format(new Date(), "yyyy-MM-dd"),
        predictedYield: predictedYieldEstimate + (Math.random() * 6 - 3), // Estimate with variation
        actualYield: finalYieldEstimate, // Actual ML prediction result
        temperature: formData.temperature,
        humidity: formData.humidity,
        co2: formData.co2,
      };

      setHistoricalData((prev) => {
        const updated = [...prev, newDataPoint];
        // Save to localStorage for persistence
        localStorage.setItem('historicalPredictionData', JSON.stringify(updated));
        return updated;
      });
      
      // Update date range to include today if needed
      setDateRange({
        from: subDays(new Date(), 30),
        to: new Date(),
      });

      // Store latest prediction in localStorage for Dashboard
      const dashboardData = {
        temperature: formData.temperature,
        humidity: formData.humidity,
        co2: formData.co2,
        airflow: formData.airflow,
        timestamp: new Date().toISOString(),
        mushroomType: mapMushroomType(formData.mushroomType),
        yieldPrediction: mlPrediction.category,
      };
      localStorage.setItem('latestPrediction', JSON.stringify(dashboardData));
    } catch (error) {
      console.error('Prediction error:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to get prediction'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // State for batch predictions
  const [batchPredictions, setBatchPredictions] = useState<PredictionResult[]>([]);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);

  const parseCSV = (text: string): any[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const rows = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index]?.trim();
      });
      rows.push(row);
    }
    
    return rows;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadedFile(file);
    setIsBatchProcessing(true);
    setBatchPredictions([]);
    
    try {
      const text = await file.text();
      let rows: any[] = [];
      
      // Parse based on file type
      if (file.name.endsWith('.json')) {
        rows = JSON.parse(text);
        if (!Array.isArray(rows)) rows = [rows];
      } else if (file.name.endsWith('.csv')) {
        rows = parseCSV(text);
      } else {
        toast({
          title: "Unsupported file format",
          description: "Please upload a CSV or JSON file.",
          variant: "destructive",
        });
        setIsBatchProcessing(false);
        return;
      }
      
      // Process each row
      const predictions: PredictionResult[] = [];
      
      for (const row of rows.slice(0, 50)) { // Limit to 50 rows
        try {
          const mlPayload = {
            species: row.species || row.mushroom_type || 'Oyster',
            temperature_c: parseFloat(row.temperature || row.temp_c || row.temperature_c) || 24,
            humidity_pct: parseFloat(row.humidity || row.humidity_pct) || 85,
            co2_ppm: parseFloat(row.co2 || row.co2_ppm) || 900,
            light_lux: parseFloat(row.light || row.light_lux) || 500,
            substrate_moisture: parseFloat(row.substrate_moisture || row.substrate_moisture_pct) || 65,
            water_quality_index: parseFloat(row.water_quality || row.water_quality_index) || 80,
          };
          
          // Call ML API
          const mlResponse = await fetch(ML_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mlPayload),
          });
          
          if (!mlResponse.ok) continue;
          
          const mlPrediction: MLPredictionResponse = await mlResponse.json();
          const harvestCycle = mlPrediction.harvest_cycle;
          
          // Calculate yield range
          let yieldMin = 0, yieldMax = 0, status: PredictionResult["status"] = "ideal";
          let contaminationRisk = 5;
          
          if (harvestCycle === 6) {
            yieldMin = 55; yieldMax = 65; status = "ideal"; contaminationRisk = 5;
          } else if (harvestCycle === 5) {
            yieldMin = 45; yieldMax = 55; status = "ideal"; contaminationRisk = 10;
          } else if (harvestCycle === 4) {
            yieldMin = 35; yieldMax = 45; status = "suboptimal"; contaminationRisk = 25;
          } else {
            yieldMin = 20; yieldMax = 30; status = "high-risk"; contaminationRisk = 65;
          }
          
          const yieldEstimate = (yieldMin + yieldMax) / 2;
          
          const predictionResult = {
            yieldRange: { min: yieldMin, max: yieldMax },
            yieldEstimate,
            status,
            contaminationRisk,
            confidence: harvestCycle === 6 ? 95 : harvestCycle === 5 ? 88 : harvestCycle === 4 ? 78 : 68,
            mlPrediction,
          };
          
          predictions.push(predictionResult);
          
          // Trigger alerts for low yield predictions in batch
          if (status === 'high-risk' || mlPrediction.category === 'LOW') {
            updatePrediction({
              yieldRange: { min: yieldMin, max: yieldMax },
              harvestCycle: mlPrediction.harvest_cycle,
              category: mlPrediction.category,
              status,
              confidence: predictionResult.confidence,
              contaminationRisk,
              timestamp: new Date().toISOString(),
              inputs: {
                temperature: mlPayload.temperature_c,
                humidity: mlPayload.humidity_pct,
                co2: mlPayload.co2_ppm,
                species: mlPayload.species,
              },
            });
          }
          
        } catch (error) {
          console.error('Error processing row:', error);
        }
      }
      
      setBatchPredictions(predictions);
      
      // Summary toast with low yield warning if any
      const lowYieldCount = predictions.filter(p => p.status === 'high-risk').length;
      const mediumYieldCount = predictions.filter(p => p.status === 'suboptimal').length;
      
      toast({
        title: lowYieldCount > 0 ? "⚠️ Batch processing complete - Issues found!" : "✅ Batch processing complete",
        description: lowYieldCount > 0 
          ? `Processed ${predictions.length} predictions. ${lowYieldCount} LOW YIELD warnings found!`
          : `Processed ${predictions.length} predictions. ${predictions.filter(p => p.status === 'ideal').length} with high/good yield.`,
        variant: lowYieldCount > 0 ? 'destructive' : 'default',
      });
      
    } catch (error) {
      toast({
        title: "File processing error",
        description: error instanceof Error ? error.message : "Failed to process file",
        variant: "destructive",
      });
    } finally {
      setIsBatchProcessing(false);
    }
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
    <div className="min-h-screen bg-transparent">
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
                    const numVal = e.target.value === '' ? 0 : parseFloat(e.target.value);
                    setFormData({ ...formData, temperature: isNaN(numVal) ? 0 : numVal });
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
                    const numVal = e.target.value === '' ? 0 : parseFloat(e.target.value);
                    setFormData({ ...formData, humidity: isNaN(numVal) ? 0 : numVal });
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
                    const numVal = e.target.value === '' ? 0 : parseInt(e.target.value);
                    setFormData({ ...formData, co2: isNaN(numVal) ? 0 : numVal });
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
                    const numVal = e.target.value === '' ? 0 : parseFloat(e.target.value);
                    setFormData({ ...formData, airflow: isNaN(numVal) ? 0 : numVal });
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
                    const numVal = e.target.value === '' ? 0 : parseFloat(e.target.value);
                    setFormData({ ...formData, substrateMoisture: isNaN(numVal) ? 0 : numVal });
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="light" className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-warning" /> Light Intensity (lux)
                </Label>
                <Input
                  id="light"
                  type="number"
                  min="0"
                  value={formData.lightLux ?? 500}
                  onChange={(e) => {
                    const numVal = e.target.value === '' ? undefined : parseInt(e.target.value);
                    setFormData({ ...formData, lightLux: numVal });
                  }}
                  placeholder="500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="water" className="flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-info" /> Water Quality Index (0-100)
                </Label>
                <Input
                  id="water"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.waterQuality ?? 80}
                  onChange={(e) => {
                    const numVal = e.target.value === '' ? undefined : parseInt(e.target.value);
                    setFormData({ ...formData, waterQuality: numVal });
                  }}
                  placeholder="80"
                />
              </div>
            </div>
            <Button
              onClick={handlePredict}
              disabled={isLoading || isLoadingLLM}
              className="w-full bg-primary hover:bg-primary-dark transition-all duration-300 transform hover:scale-[1.02]"
              size="lg"
            >
              {isLoading || isLoadingLLM ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {isLoadingLLM ? 'Getting AI recommendations...' : 'Analyzing...'}
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
                  accept=".csv,.json"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <FileSpreadsheet className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">
                    {uploadedFile ? uploadedFile.name : "Drop CSV/JSON file or click to browse"}
                  </p>
                </label>
              </div>
              {uploadedFile && (
                <div className="mt-3 space-y-2">
                  <Badge variant="secondary" className="animate-fade-in">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {isBatchProcessing ? 'Processing...' : `Processed ${batchPredictions.length} predictions`}
                  </Badge>
                  {isBatchProcessing && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analyzing batch data...
                    </div>
                  )}
                </div>
              )}
              
              {/* CSV Format Guide */}
              <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-3">
                <p className="text-sm font-semibold text-foreground mb-2">📄 Accepted File Formats</p>
                
                {/* CSV Format */}
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">CSV Format (with header row):</p>
                  <code className="text-xs text-foreground bg-muted/50 px-2 py-1 rounded block overflow-x-auto">
                    species,temperature,humidity,co2,light,substrate_moisture,water_quality<br/>
                    Oyster,24,85,900,500,65,80<br/>
                    Shiitake,22,82,850,450,68,85
                  </code>
                </div>
                
                {/* JSON Format */}
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">JSON Format (array of objects):</p>
                  <code className="text-xs text-foreground bg-muted/50 px-2 py-1 rounded block overflow-x-auto">
                    [{`{"species":"Oyster","temperature":24,"humidity":85,...}`}]
                  </code>
                </div>
                
                <p className="text-xs text-muted-foreground italic">
                  💡 Tip: File can contain up to 50 readings for batch analysis
                </p>
              </div>
            </Card>

            {/* Batch Predictions Results */}
            {batchPredictions.length > 0 && (
              <Card className="p-6 animate-scale-in hover:shadow-lg transition-all duration-300">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Batch Prediction Results ({batchPredictions.length})
                </h2>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {batchPredictions.map((pred, index) => (
                    <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-all" style={{ borderColor: pred.mlPrediction?.color }}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-muted-foreground">#{index + 1}</span>
                          <Badge className={getStatusConfig(pred.status).color}>
                            {pred.mlPrediction?.category}
                          </Badge>
                          <span className="text-sm text-foreground font-medium">
                            {pred.mlPrediction?.input.species}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-primary">
                            {pred.yieldRange.min}-{pred.yieldRange.max} kg
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Cycle {pred.mlPrediction?.harvest_cycle}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Temp:</span>{" "}
                          <span className="text-foreground font-medium">
                            {pred.mlPrediction?.input.temperature_c}°C
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Humidity:</span>{" "}
                          <span className="text-foreground font-medium">
                            {pred.mlPrediction?.input.humidity_pct}%
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">CO2:</span>{" "}
                          <span className="text-foreground font-medium">
                            {pred.mlPrediction?.input.co2_ppm}ppm
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Avg Yield:</p>
                      <p className="text-lg font-bold text-primary">
                        {(batchPredictions.reduce((sum, p) => sum + p.yieldEstimate, 0) / batchPredictions.length).toFixed(1)} kg
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">High Quality:</p>
                      <p className="text-lg font-bold text-success">
                        {batchPredictions.filter(p => p.mlPrediction?.category === 'HIGH' || p.mlPrediction?.category === 'GOOD').length} / {batchPredictions.length}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {prediction && (
              <Card className="p-6 animate-scale-in hover:shadow-lg transition-all duration-300">
                <h2 className="text-lg font-semibold mb-4">Prediction Results</h2>
                <div className="space-y-4">
                  {prediction.mlPrediction && (
                    <div className="p-3 rounded-lg border" style={{ borderColor: prediction.mlPrediction.color, backgroundColor: `${prediction.mlPrediction.color}15` }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold" style={{ color: prediction.mlPrediction.color }}>
                          {prediction.mlPrediction.category} YIELD
                        </span>
                        <span className="text-xs text-muted-foreground">Cycle {prediction.mlPrediction.harvest_cycle}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{prediction.mlPrediction.description}</p>
                    </div>
                  )}
                  <div className="text-center p-4 bg-muted/50 rounded-xl">
                    <p className="text-sm text-muted-foreground mb-1">Estimated Yield Range</p>
                    <p className="text-4xl font-bold text-primary animate-count-up">
                      {formatWeight(prediction.yieldRange.min)}-{formatWeight(prediction.yieldRange.max)} {weightUnit}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Est. ~{formatWeight(prediction.yieldEstimate)} {weightUnit}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Harvest per Cycle</p>
                      <p className="text-lg font-semibold text-foreground">
                        {formatWeight(prediction.yieldEstimate * 0.85)} {weightUnit}
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
                  {prediction.llmRecommendations && (
                    <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                      <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <Leaf className="h-4 w-4 text-primary" />
                        AI Recommendations
                      </h3>
                      {isLoadingLLM ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Getting recommendations...
                        </div>
                      ) : (
                        <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                          {prediction.llmRecommendations}
                        </p>
                      )}
                    </div>
                  )}
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

