import { useState, useMemo } from "react";
import { Navigation } from "@/components/layout/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceArea,
} from "recharts";
import { X, BarChart3, LineChartIcon, GitCompare, Leaf } from "lucide-react";
import { useUnits } from "@/contexts/UnitsContext";

// Mushroom types and their optimal parameters
const mushroomData = {
  oyster: {
    name: "Oyster",
    color: "hsl(142, 43%, 24%)",
    params: { temperature: 22, humidity: 85, co2: 800, airflow: 3.2, substrateMoisture: 65, growthRate: 4.5, yieldPerBatch: 48 },
  },
  shiitake: {
    name: "Shiitake",
    color: "hsl(75, 45%, 45%)",
    params: { temperature: 18, humidity: 80, co2: 700, airflow: 2.8, substrateMoisture: 60, growthRate: 3.2, yieldPerBatch: 35 },
  },
  button: {
    name: "Button",
    color: "hsl(199, 89%, 48%)",
    params: { temperature: 20, humidity: 88, co2: 850, airflow: 2.5, substrateMoisture: 70, growthRate: 5.0, yieldPerBatch: 55 },
  },
  lionsMane: {
    name: "Lion's Mane",
    color: "hsl(35, 92%, 50%)",
    params: { temperature: 21, humidity: 90, co2: 600, airflow: 3.5, substrateMoisture: 68, growthRate: 3.8, yieldPerBatch: 32 },
  },
  reishi: {
    name: "Reishi",
    color: "hsl(0, 72%, 51%)",
    params: { temperature: 25, humidity: 92, co2: 900, airflow: 2.0, substrateMoisture: 72, growthRate: 2.5, yieldPerBatch: 25 },
  },
};

// Parameters will be created dynamically based on units
const createParameters = (temperatureUnit: string, speedUnit: string, weightUnit: string) => [
  { id: "temperature", label: `Temperature (${temperatureUnit})`, unit: temperatureUnit, optimal: { min: 18, max: 26 } },
  { id: "humidity", label: "Humidity (%)", unit: "%", optimal: { min: 75, max: 95 } },
  { id: "co2", label: "CO2 Level (ppm)", unit: "ppm", optimal: { min: 600, max: 1000 } },
  { id: "airflow", label: `Airflow (${speedUnit})`, unit: speedUnit, optimal: { min: 2.0, max: 4.0 } },
  { id: "substrateMoisture", label: "Substrate Moisture (%)", unit: "%", optimal: { min: 55, max: 75 } },
  { id: "growthRate", label: "Growth Rate (cm/day)", unit: "cm/day", optimal: { min: 2, max: 6 } },
  { id: "yieldPerBatch", label: `Yield per Batch (${weightUnit})`, unit: weightUnit, optimal: { min: 20, max: 60 } },
];

type MushroomKey = keyof typeof mushroomData;
type ParameterKey = keyof typeof mushroomData.oyster.params;

export default function Compare() {
  const { formatTemperature, formatWeight, formatSpeed, temperatureUnit, weightUnit, speedUnit } = useUnits();
  const [selectedMushrooms, setSelectedMushrooms] = useState<MushroomKey[]>(["oyster", "shiitake"]);
  const [selectedParams, setSelectedParams] = useState<ParameterKey[]>(["temperature", "humidity", "yieldPerBatch"]);
  const [chartType, setChartType] = useState<"line" | "bar">("bar");
  const [addingMushroom, setAddingMushroom] = useState<string>("");

  const parameters = useMemo(() => createParameters(temperatureUnit, speedUnit, weightUnit), [temperatureUnit, speedUnit, weightUnit]);

  const availableMushrooms = Object.entries(mushroomData)
    .filter(([key]) => !selectedMushrooms.includes(key as MushroomKey))
    .map(([key, val]) => ({ key, name: val.name }));

  const handleAddMushroom = (key: string) => {
    if (key && !selectedMushrooms.includes(key as MushroomKey)) {
      setSelectedMushrooms([...selectedMushrooms, key as MushroomKey]);
      setAddingMushroom("");
    }
  };

  const handleRemoveMushroom = (key: MushroomKey) => {
    if (selectedMushrooms.length > 1) {
      setSelectedMushrooms(selectedMushrooms.filter((m) => m !== key));
    }
  };

  const toggleParam = (paramId: ParameterKey) => {
    setSelectedParams((prev) =>
      prev.includes(paramId) ? prev.filter((p) => p !== paramId) : [...prev, paramId]
    );
  };

  const chartData = useMemo(() => {
    return selectedParams.map((paramId) => {
      const param = parameters.find((p) => p.id === paramId)!;
      const dataPoint: Record<string, string | number> = { name: param.label };
      selectedMushrooms.forEach((mushKey) => {
        let value = mushroomData[mushKey].params[paramId];
        // Convert values based on parameter type
        if (paramId === "temperature" && temperatureUnit === "°F") {
          value = (value * 9/5) + 32;
        } else if (paramId === "airflow" && speedUnit === "ft/s") {
          value = value * 3.28084;
        } else if (paramId === "yieldPerBatch" && weightUnit === "lb") {
          value = value * 2.20462;
        }
        dataPoint[mushroomData[mushKey].name] = value;
      });
      // Convert optimal ranges
      let optimalMin = param.optimal.min;
      let optimalMax = param.optimal.max;
      if (paramId === "temperature" && temperatureUnit === "°F") {
        optimalMin = (optimalMin * 9/5) + 32;
        optimalMax = (optimalMax * 9/5) + 32;
      } else if (paramId === "airflow" && speedUnit === "ft/s") {
        optimalMin = optimalMin * 3.28084;
        optimalMax = optimalMax * 3.28084;
      } else if (paramId === "yieldPerBatch" && weightUnit === "lb") {
        optimalMin = optimalMin * 2.20462;
        optimalMax = optimalMax * 2.20462;
      }
      dataPoint.optimalMin = optimalMin;
      dataPoint.optimalMax = optimalMax;
      return dataPoint;
    });
  }, [selectedMushrooms, selectedParams, parameters, temperatureUnit, speedUnit, weightUnit]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <GitCompare className="h-7 w-7 text-primary" />
            </div>
            Mushroom Comparison
          </h1>
          <p className="text-muted-foreground mt-2">
            Compare environmental requirements and yields across different mushroom varieties
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6 mb-8">
          {/* Mushroom Selection */}
          <Card className="p-5 hover:shadow-lg transition-all duration-300">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Leaf className="h-5 w-5 text-primary" />
              Select Mushrooms
            </h2>
            <div className="space-y-3 mb-4">
              {selectedMushrooms.map((key) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-2 bg-muted/50 rounded-lg animate-fade-in"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: mushroomData[key].color }} />
                    <span className="text-sm font-medium">{mushroomData[key].name}</span>
                  </div>
                  {selectedMushrooms.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 hover:bg-critical/10 hover:text-critical"
                      onClick={() => handleRemoveMushroom(key)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {availableMushrooms.length > 0 && (
              <Select value={addingMushroom} onValueChange={handleAddMushroom}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Add mushroom..." />
                </SelectTrigger>
                <SelectContent>
                  {availableMushrooms.map((m) => (
                    <SelectItem key={m.key} value={m.key}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {availableMushrooms.length === 0 && (
              <p className="text-xs text-muted-foreground mt-2">All mushroom types selected</p>
            )}
            {availableMushrooms.length > 0 && (
              <p className="text-xs text-muted-foreground mt-2">Select mushroom types to compare</p>
            )}
          </Card>

          {/* Parameter Selection */}
          <Card className="p-5 lg:col-span-2 hover:shadow-lg transition-all duration-300">
            <h2 className="font-semibold mb-4">Select Parameters to Compare</h2>
            <div className="grid grid-cols-2 gap-3">
              {parameters.map((param) => (
                <div key={param.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={param.id}
                    checked={selectedParams.includes(param.id as ParameterKey)}
                    onCheckedChange={() => toggleParam(param.id as ParameterKey)}
                  />
                  <Label htmlFor={param.id} className="text-sm cursor-pointer">
                    {param.label}
                  </Label>
                </div>
              ))}
            </div>
          </Card>

          {/* Chart Type Toggle */}
          <Card className="p-5 hover:shadow-lg transition-all duration-300">
            <h2 className="font-semibold mb-4">Chart Type</h2>
            <div className="flex gap-2">
              <Button
                variant={chartType === "bar" ? "default" : "outline"}
                onClick={() => setChartType("bar")}
                className="flex-1"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Bar
              </Button>
              <Button
                variant={chartType === "line" ? "default" : "outline"}
                onClick={() => setChartType("line")}
                className="flex-1"
              >
                <LineChartIcon className="h-4 w-4 mr-2" />
                Line
              </Button>
            </div>
            {/* Legend */}
            <div className="mt-4 space-y-2">
              {selectedMushrooms.map((key) => (
                <div key={key} className="flex items-center gap-2 text-sm">
                  <div className="h-3 w-8 rounded" style={{ backgroundColor: mushroomData[key].color }} />
                  <span>{mushroomData[key].name}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Comparison Charts */}
        {selectedParams.length > 0 ? (
          <Card className="p-6">
            <h2 className="font-semibold mb-6">Parameter Comparison</h2>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === "bar" ? (
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} angle={-20} textAnchor="end" height={60} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    {selectedMushrooms.map((key) => (
                      <Bar
                        key={key}
                        dataKey={mushroomData[key].name}
                        fill={mushroomData[key].color}
                        radius={[4, 4, 0, 0]}
                      />
                    ))}
                  </BarChart>
                ) : (
                  <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} angle={-20} textAnchor="end" height={60} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    {selectedMushrooms.map((key) => (
                      <Line
                        key={key}
                        type="monotone"
                        dataKey={mushroomData[key].name}
                        stroke={mushroomData[key].color}
                        strokeWidth={2}
                        dot={{ r: 5 }}
                        activeDot={{ r: 7 }}
                      />
                    ))}
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </Card>
        ) : (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">Select at least one parameter to compare</p>
          </Card>
        )}

        {/* Optimal Ranges Reference */}
        <Card className="mt-6 p-6">
          <h2 className="font-semibold mb-4">Optimal Ranges Reference</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {parameters.slice(0, 4).map((param) => (
              <div key={param.id} className="p-3 bg-success/5 border border-success/20 rounded-lg">
                <p className="text-sm font-medium">{param.label}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Optimal: {param.optimal.min} - {param.optimal.max} {param.unit}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </main>
    </div>
  );
}

