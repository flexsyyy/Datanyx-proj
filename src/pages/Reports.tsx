import { Navigation } from "@/components/layout/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState } from "react";
import { Download, TrendingUp, TrendingDown, BarChart3, Calendar as CalendarIcon, FileDown } from "lucide-react";
import { DateRange } from "react-day-picker";
import { format, subDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useUnits } from "@/contexts/UnitsContext";

export default function Reports() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const { toast } = useToast();
  const { formatWeight, weightUnit } = useUnits();

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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <div className="h-64 bg-muted/30 rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">Chart placeholder</p>
              </div>
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
              </h3>
              <div className="h-80 bg-muted/30 rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">
                  Temperature, Humidity, CO2 trends over time
                </p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="yield">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Yield vs Environment Correlation
              </h3>
              <div className="h-80 bg-muted/30 rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">
                  Correlation analysis between environment parameters and yield
                </p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
