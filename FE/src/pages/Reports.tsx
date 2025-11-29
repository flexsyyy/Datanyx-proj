import { Navigation } from "@/components/layout/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState, useMemo } from "react";
import { Download, TrendingUp, TrendingDown, BarChart3, Calendar as CalendarIcon, FileDown } from "lucide-react";
import { DateRange } from "react-day-picker";
import { format, subDays, isWithinInterval, startOfDay, endOfDay, parseISO } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useUnits } from "@/contexts/UnitsContext";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  Cell,
} from "recharts";

// Generate sample data for charts
const generateYieldData = () => {
  const data = [];
  for (let i = 60; i >= 0; i--) {
    const date = subDays(new Date(), i);
    data.push({
      date: format(date, "yyyy-MM-dd"),
      yield: 40 + Math.random() * 20 + Math.sin(i / 10) * 5,
      target: 50,
    });
  }
  return data;
};

const generateEnvironmentData = () => {
  const data = [];
  for (let i = 60; i >= 0; i--) {
    const date = subDays(new Date(), i);
    data.push({
      date: format(date, "yyyy-MM-dd"),
      temperature: 22 + Math.random() * 4 + Math.sin(i / 15) * 2,
      humidity: 82 + Math.random() * 10 + Math.cos(i / 12) * 3,
      co2: 800 + Math.random() * 400 + Math.sin(i / 8) * 100,
    });
  }
  return data;
};

const generateCorrelationData = () => {
  const params = [
    { name: "Temperature", correlation: 0.72, color: "hsl(0, 72%, 51%)" },
    { name: "Humidity", correlation: 0.68, color: "hsl(199, 89%, 48%)" },
    { name: "CO2 Level", correlation: -0.45, color: "hsl(35, 92%, 50%)" },
    { name: "Airflow", correlation: 0.55, color: "hsl(142, 43%, 24%)" },
    { name: "Substrate Moisture", correlation: 0.61, color: "hsl(75, 45%, 45%)" },
  ];
  return params;
};

const yieldData = generateYieldData();
const environmentData = generateEnvironmentData();
const correlationData = generateCorrelationData();

export default function Reports() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const { toast } = useToast();
  const { formatWeight, formatTemperature, weightUnit, temperatureUnit } = useUnits();

  // Filter data based on date range
  const filteredYieldData = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return yieldData;
    const startDate = startOfDay(dateRange.from);
    const endDate = endOfDay(dateRange.to);
    return yieldData.filter((d) => {
      const dataDate = startOfDay(parseISO(d.date));
      return isWithinInterval(dataDate, { start: startDate, end: endDate });
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [dateRange]);

  const filteredEnvironmentData = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) {
      return environmentData.map(d => ({
        ...d,
        temperature: temperatureUnit === "°F" ? (d.temperature * 9/5) + 32 : d.temperature
      }));
    }
    const startDate = startOfDay(dateRange.from);
    const endDate = endOfDay(dateRange.to);
    return environmentData.filter((d) => {
      const dataDate = startOfDay(parseISO(d.date));
      return isWithinInterval(dataDate, { start: startDate, end: endDate });
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(d => ({
      ...d,
      temperature: temperatureUnit === "°F" ? (d.temperature * 9/5) + 32 : d.temperature
    }));
  }, [dateRange, temperatureUnit]);

  const handleExport = (format: "pdf" | "csv" | "excel") => {
    toast({
      title: "Export Started",
      description: `Your ${format.toUpperCase()} report is being generated. It will download shortly.`,
    });
    // Simulate download delay
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: `Report exported successfully as ${format.toUpperCase()}.`,
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Reports</h1>
            <p className="text-muted-foreground mt-2">
              Historical data and analytics for your mushroom farm
            </p>
          </div>
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d, yyyy")}
                      </>
                    ) : (
                      format(dateRange.from, "MMM d, yyyy")
                    )
                  ) : (
                    "Select date range"
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
            <Popover>
              <PopoverTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-40 p-2" align="end">
                <div className="flex flex-col gap-1">
                  <Button variant="ghost" size="sm" className="justify-start" onClick={() => handleExport("pdf")}>
                    <FileDown className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                  <Button variant="ghost" size="sm" className="justify-start" onClick={() => handleExport("csv")}>
                    <FileDown className="h-4 w-4 mr-2" />
                    CSV
                  </Button>
                  <Button variant="ghost" size="sm" className="justify-start" onClick={() => handleExport("excel")}>
                    <FileDown className="h-4 w-4 mr-2" />
                    Excel
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Yield</p>
                <p className="text-3xl font-bold text-foreground mt-1">{formatWeight(847)}</p>
                <div className="flex items-center gap-1 mt-2 text-success">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm font-medium">+18%</span>
                </div>
              </div>
              <div className="p-3 bg-success/10 rounded-lg">
                <BarChart3 className="h-6 w-6 text-success" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Contamination Rate</p>
                <p className="text-3xl font-bold text-foreground mt-1">2.3%</p>
                <div className="flex items-center gap-1 mt-2 text-success">
                  <TrendingDown className="h-4 w-4" />
                  <span className="text-sm font-medium">-12%</span>
                </div>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Cycle Time</p>
                <p className="text-3xl font-bold text-foreground mt-1">28d</p>
                <div className="flex items-center gap-1 mt-2 text-success">
                  <TrendingDown className="h-4 w-4" />
                  <span className="text-sm font-medium">-2 days</span>
                </div>
              </div>
              <div className="p-3 bg-accent/10 rounded-lg">
                <BarChart3 className="h-6 w-6 text-accent" />
              </div>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="environment">Environment</TabsTrigger>
            <TabsTrigger value="yield">Yield Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Yield Trend
                {dateRange?.from && dateRange?.to && (
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    ({format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d, yyyy")})
                  </span>
                )}
              </h3>
              {filteredYieldData.length === 0 ? (
                <div className="h-64 bg-muted/30 rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">No data available for the selected date range</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={256}>
                  <AreaChart data={filteredYieldData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
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
                      interval={Math.floor(filteredYieldData.length / 8)}
                    />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
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
                      formatter={(value: number, name: string) => {
                        if (name.includes("Yield")) {
                          return [formatWeight(value), name];
                        }
                        return [value, name];
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="yield"
                      name={`Yield (${weightUnit})`}
                      stroke="hsl(142, 43%, 24%)"
                      fill="hsl(142, 43%, 24%, 0.2)"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="target"
                      name="Target"
                      stroke="hsl(0, 72%, 51%)"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Chamber Performance Comparison
              </h3>
              <div className="space-y-4">
                {[
                  { name: "Chamber A1", current: 287, target: 300 },
                  { name: "Chamber B2", current: 265, target: 300 },
                  { name: "Chamber C3", current: 295, target: 300 },
                ].map((chamber) => (
                  <div key={chamber.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">
                        {chamber.name}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {formatWeight(chamber.current)} / {formatWeight(chamber.target)}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${(chamber.current / chamber.target) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="environment">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Environmental Stability Score
                {dateRange?.from && dateRange?.to && (
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    ({format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d, yyyy")})
                  </span>
                )}
              </h3>
              {filteredEnvironmentData.length === 0 ? (
                <div className="h-80 bg-muted/30 rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">No data available for the selected date range</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={filteredEnvironmentData} margin={{ top: 5, right: 10, left: 0, bottom: 60 }}>
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
                      interval={Math.floor(filteredEnvironmentData.length / 8)}
                    />
                    <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={11}
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
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="temperature"
                      name={`Temperature (${temperatureUnit})`}
                      stroke="hsl(0, 72%, 51%)"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="humidity"
                      name="Humidity (%)"
                      stroke="hsl(199, 89%, 48%)"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="co2"
                      name="CO2 (ppm)"
                      stroke="hsl(35, 92%, 50%)"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="yield">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Yield vs Environment Correlation
              </h3>
              <div className="relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-16 transform -rotate-90 whitespace-nowrap text-sm text-muted-foreground font-medium z-10">
                  Correlation Coefficient
                </div>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={correlationData} margin={{ top: 5, right: 30, left: 20, bottom: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="name"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={11}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      interval={0}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={11}
                      domain={[-1, 1]}
                      width={50}
                    />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => value.toFixed(2)}
                  />
                  <Bar dataKey="correlation" name="Correlation" radius={[4, 4, 0, 0]}>
                    {correlationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">
                  <strong>Correlation Interpretation:</strong>
                </p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Values close to +1 indicate strong positive correlation with yield</li>
                  <li>• Values close to -1 indicate strong negative correlation with yield</li>
                  <li>• Values close to 0 indicate weak or no correlation</li>
                </ul>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
