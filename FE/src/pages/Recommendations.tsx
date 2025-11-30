import { useState } from "react";
import { Navigation } from "@/components/layout/Navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUnits } from "@/contexts/UnitsContext";
import {
  Thermometer,
  Droplets,
  Wind,
  Activity,
  Leaf,
  Lightbulb,
  CheckCircle,
  AlertTriangle,
  Clock,
  Sprout,
} from "lucide-react";

interface MushroomRecommendation {
  name: string;
  scientificName: string;
  temperature: { min: number; max: number; optimal: number };
  humidity: { min: number; max: number; optimal: number };
  co2: { min: number; max: number; optimal: number };
  airflow: { min: number; max: number; optimal: number };
  substrateMoisture: { min: number; max: number; optimal: number };
  lightHours: number;
  growthCycle: string;
  substrate: string[];
  commonIssues: { problem: string; solution: string }[];
  harvestTips: string[];
}

const mushroomData: Record<string, MushroomRecommendation> = {
  oyster: {
    name: "Oyster Mushroom",
    scientificName: "Pleurotus ostreatus",
    temperature: { min: 18, max: 24, optimal: 21 },
    humidity: { min: 80, max: 95, optimal: 90 },
    co2: { min: 400, max: 1000, optimal: 600 },
    airflow: { min: 2.0, max: 4.0, optimal: 3.0 },
    substrateMoisture: { min: 60, max: 75, optimal: 68 },
    lightHours: 12,
    growthCycle: "14-21 days from spawn to harvest",
    substrate: ["Straw", "Coffee grounds", "Sawdust", "Cardboard"],
    commonIssues: [
      { problem: "Long thin stems", solution: "Increase fresh air exchange and light exposure" },
      { problem: "Yellow/brown caps", solution: "Reduce temperature and increase humidity" },
      { problem: "Slow pinning", solution: "Lower temperature by 2-3°C and increase humidity to 90%" },
    ],
    harvestTips: [
      "Harvest when cap edges begin to flatten but before they curl upward",
      "Twist and pull gently at the base, or cut with a clean knife",
      "Expect 2-3 flushes with 7-10 days between each",
    ],
  },
  shiitake: {
    name: "Shiitake",
    scientificName: "Lentinula edodes",
    temperature: { min: 16, max: 24, optimal: 20 },
    humidity: { min: 75, max: 90, optimal: 85 },
    co2: { min: 400, max: 1200, optimal: 800 },
    airflow: { min: 1.5, max: 3.5, optimal: 2.5 },
    substrateMoisture: { min: 55, max: 70, optimal: 62 },
    lightHours: 10,
    growthCycle: "60-120 days colonization, then 7-14 days fruiting",
    substrate: ["Hardwood sawdust", "Oak logs", "Supplemented sawdust blocks"],
    commonIssues: [
      { problem: "Cracked caps", solution: "Increase humidity and reduce air movement" },
      { problem: "No fruiting", solution: "Cold shock by reducing temp to 10-15°C for 24hrs" },
      { problem: "Soft/waterlogged", solution: "Reduce humidity and improve drainage" },
    ],
    harvestTips: [
      "Harvest when veil is still slightly curled under, before it fully flattens",
      "Cut at stem base leaving a small stub to prevent contamination",
      "Allow 2-3 weeks rest between flushes",
    ],
  },
  button: {
    name: "Button Mushroom",
    scientificName: "Agaricus bisporus",
    temperature: { min: 14, max: 20, optimal: 17 },
    humidity: { min: 80, max: 90, optimal: 85 },
    co2: { min: 800, max: 1500, optimal: 1000 },
    airflow: { min: 1.0, max: 2.5, optimal: 1.8 },
    substrateMoisture: { min: 60, max: 70, optimal: 65 },
    lightHours: 0,
    growthCycle: "16-21 days from casing to harvest",
    substrate: ["Composted manure", "Straw-based compost", "Commercial mushroom compost"],
    commonIssues: [
      { problem: "Dry casing layer", solution: "Mist lightly and cover with wet newspaper" },
      { problem: "Green mold", solution: "Remove affected area immediately, improve ventilation" },
      { problem: "Irregular pinning", solution: "Ensure even moisture distribution in casing" },
    ],
    harvestTips: [
      "Harvest when cap is still closed and firm",
      "Twist gently to remove - do not pull",
      "Harvest daily for best quality",
    ],
  },
  "lions-mane": {
    name: "Lion's Mane",
    scientificName: "Hericium erinaceus",
    temperature: { min: 18, max: 24, optimal: 21 },
    humidity: { min: 85, max: 95, optimal: 90 },
    co2: { min: 400, max: 800, optimal: 500 },
    airflow: { min: 2.5, max: 4.5, optimal: 3.5 },
    substrateMoisture: { min: 60, max: 70, optimal: 65 },
    lightHours: 12,
    growthCycle: "14-21 days from pins to harvest",
    substrate: ["Hardwood sawdust", "Supplemented sawdust", "Beech or oak logs"],
    commonIssues: [
      { problem: "Yellow/brown color", solution: "Increase humidity and reduce direct light" },
      { problem: "Compact growth", solution: "Increase fresh air exchange significantly" },
      { problem: "Slow development", solution: "Ensure proper humidity and temperatures" },
    ],
    harvestTips: [
      "Harvest when spines are 0.5-1cm long, before they start to yellow",
      "Cut at the base with a sharp knife",
      "Best consumed fresh - does not store well",
    ],
  },
  reishi: {
    name: "Reishi",
    scientificName: "Ganoderma lucidum",
    temperature: { min: 22, max: 28, optimal: 25 },
    humidity: { min: 75, max: 90, optimal: 82 },
    co2: { min: 400, max: 1500, optimal: 1000 },
    airflow: { min: 1.0, max: 2.5, optimal: 1.5 },
    substrateMoisture: { min: 55, max: 70, optimal: 62 },
    lightHours: 12,
    growthCycle: "60-90 days for full antler/conk development",
    substrate: ["Hardwood sawdust", "Oak logs", "Supplemented hardwood"],
    commonIssues: [
      { problem: "Antler form vs conk", solution: "High CO2 = antlers, high FAE = conks" },
      { problem: "Contamination", solution: "Maintain strict sterility, reduce moisture" },
      { problem: "Slow growth", solution: "Increase temperature and check substrate moisture" },
    ],
    harvestTips: [
      "Harvest when white growing edge disappears and surface becomes lacquered",
      "Cut at base or allow to dry on substrate",
      "Can be dried whole for long-term storage and later processing",
    ],
  },
};

export default function Recommendations() {
  const [selectedMushroom, setSelectedMushroom] = useState("oyster");
  const { formatTemperature, temperatureUnit } = useUnits();
  const data = mushroomData[selectedMushroom];

  return (
    <div className="min-h-screen bg-transparent">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Lightbulb className="h-7 w-7 text-primary" />
            </div>
            Growing Recommendations
          </h1>
          <p className="text-muted-foreground mt-2">
            Optimal environmental conditions and guidance for your selected mushroom type
          </p>
        </div>

        {/* Mushroom Selector */}
        <Card className="p-6 mb-8">
          <div className="flex items-center gap-4">
            <Sprout className="h-6 w-6 text-primary" />
            <div className="flex-1">
              <label className="text-sm font-medium text-muted-foreground">Select Mushroom Type</label>
              <Select value={selectedMushroom} onValueChange={setSelectedMushroom}>
                <SelectTrigger className="mt-1 max-w-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="oyster">Oyster Mushroom</SelectItem>
                  <SelectItem value="shiitake">Shiitake</SelectItem>
                  <SelectItem value="button">Button Mushroom</SelectItem>
                  <SelectItem value="lions-mane">Lion's Mane</SelectItem>
                  <SelectItem value="reishi">Reishi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Badge variant="secondary" className="text-xs">
              {data.scientificName}
            </Badge>
          </div>
        </Card>

        {/* Optimal Parameters Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <Card className="p-5 hover:shadow-lg transition-all border-l-4 border-l-primary">
            <div className="flex items-center gap-3 mb-3">
              <Thermometer className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Temperature</h3>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {formatTemperature(data.temperature.optimal)}{temperatureUnit}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Range: {formatTemperature(data.temperature.min)}-{formatTemperature(data.temperature.max)}{temperatureUnit}
            </p>
          </Card>

          <Card className="p-5 hover:shadow-lg transition-all border-l-4 border-l-info">
            <div className="flex items-center gap-3 mb-3">
              <Droplets className="h-5 w-5 text-info" />
              <h3 className="font-semibold">Humidity</h3>
            </div>
            <p className="text-2xl font-bold text-foreground">{data.humidity.optimal}%</p>
            <p className="text-sm text-muted-foreground mt-1">
              Range: {data.humidity.min}-{data.humidity.max}%
            </p>
          </Card>

          <Card className="p-5 hover:shadow-lg transition-all border-l-4 border-l-warning">
            <div className="flex items-center gap-3 mb-3">
              <Wind className="h-5 w-5 text-warning" />
              <h3 className="font-semibold">CO2 Level</h3>
            </div>
            <p className="text-2xl font-bold text-foreground">{data.co2.optimal} ppm</p>
            <p className="text-sm text-muted-foreground mt-1">
              Range: {data.co2.min}-{data.co2.max} ppm
            </p>
          </Card>

          <Card className="p-5 hover:shadow-lg transition-all border-l-4 border-l-accent">
            <div className="flex items-center gap-3 mb-3">
              <Activity className="h-5 w-5 text-accent" />
              <h3 className="font-semibold">Airflow</h3>
            </div>
            <p className="text-2xl font-bold text-foreground">{data.airflow.optimal} m/s</p>
            <p className="text-sm text-muted-foreground mt-1">
              Range: {data.airflow.min}-{data.airflow.max} m/s
            </p>
          </Card>

          <Card className="p-5 hover:shadow-lg transition-all border-l-4 border-l-success">
            <div className="flex items-center gap-3 mb-3">
              <Droplets className="h-5 w-5 text-success" />
              <h3 className="font-semibold">Substrate Moisture</h3>
            </div>
            <p className="text-2xl font-bold text-foreground">{data.substrateMoisture.optimal}%</p>
            <p className="text-sm text-muted-foreground mt-1">
              Range: {data.substrateMoisture.min}-{data.substrateMoisture.max}%
            </p>
          </Card>

          <Card className="p-5 hover:shadow-lg transition-all border-l-4 border-l-muted-foreground">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold">Light Exposure</h3>
            </div>
            <p className="text-2xl font-bold text-foreground">{data.lightHours} hrs/day</p>
            <p className="text-sm text-muted-foreground mt-1">Indirect light recommended</p>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Growth Cycle & Substrate */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Leaf className="h-5 w-5 text-primary" />
              Growth Information
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Growth Cycle</p>
                <p className="font-medium">{data.growthCycle}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Recommended Substrates</p>
                <div className="flex flex-wrap gap-2">
                  {data.substrate.map((s) => (
                    <Badge key={s} variant="secondary">{s}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Harvest Tips */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              Harvest Tips
            </h3>
            <ul className="space-y-3">
              {data.harvestTips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Common Issues & Solutions */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Common Issues & Solutions
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {data.commonIssues.map((issue, i) => (
              <div key={i} className="p-4 bg-muted/30 rounded-lg border border-border">
                <p className="font-medium text-critical mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  {issue.problem}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="text-success font-medium">Solution: </span>
                  {issue.solution}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </main>
    </div>
  );
}

