import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/layout/Navigation";
import { KPICard } from "@/components/ui/kpi-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUnits } from "@/contexts/UnitsContext";
import {
  Thermometer,
  Droplets,
  Wind,
  Activity,
  AlertTriangle,
  Bell,
  CheckCircle,
  Clock,
  Leaf,
} from "lucide-react";

// Health Index Component
function HealthIndex({ value, label }: { value: number; label: string }) {
  const getColor = (val: number) => {
    if (val >= 80) return "text-success";
    if (val >= 60) return "text-warning";
    return "text-critical";
  };

  const getGradient = (val: number) => {
    if (val >= 80) return "from-success/20 to-success/5";
    if (val >= 60) return "from-warning/20 to-warning/5";
    return "from-critical/20 to-critical/5";
  };

  return (
    <Card className={`p-6 bg-gradient-to-br ${getGradient(value)} border-0`}>
      <div className="flex items-center gap-4">
        <div className="relative">
          <svg className="w-20 h-20 transform -rotate-90">
            <circle
              cx="40"
              cy="40"
              r="35"
              stroke="currentColor"
              strokeWidth="6"
              fill="none"
              className="text-muted/20"
            />
            <circle
              cx="40"
              cy="40"
              r="35"
              stroke="currentColor"
              strokeWidth="6"
              fill="none"
              strokeDasharray={`${(value / 100) * 220} 220`}
              strokeLinecap="round"
              className={getColor(value)}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-xl font-bold ${getColor(value)}`}>{value}%</span>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">{label}</h3>
          <p className="text-sm text-muted-foreground">Overall system health</p>
        </div>
      </div>
    </Card>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { formatTemperature, formatSpeed, temperatureUnit, speedUnit } = useUnits();

  const alerts = [
    {
      id: 1,
      severity: "warning",
      title: "CO2 Levels Elevated",
      message: "Shelter A: CO2 at 1,100 ppm (optimal: 800-1000 ppm)",
      time: "5 minutes ago",
    },
    {
      id: 2,
      severity: "info",
      title: "Misting Cycle Complete",
      message: "Shelter B: Humidity restored to 85%",
      time: "15 minutes ago",
    },
  ];

  const activeBatches = [
    {
      id: 1,
      name: "Oyster Mushroom Batch #12",
      stage: "Fruiting",
      progress: 75,
      daysRemaining: 5,
      shelter: "Shelter A",
    },
    {
      id: 2,
      name: "Shiitake Batch #8",
      stage: "Colonization",
      progress: 45,
      daysRemaining: 12,
      shelter: "Shelter B",
    },
  ];

  const recentEvents = [
    {
      type: "success",
      title: "Temperature Adjusted",
      shelter: "Shelter A",
      time: "10 min ago",
    },
    {
      type: "warning",
      title: "Airflow Alert",
      shelter: "Shelter B",
      time: "25 min ago",
    },
    {
      type: "info",
      title: "Substrate Check",
      shelter: "Shelter C",
      time: "1 hour ago",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground">
            Real-time monitoring across all your mushroom growing chambers
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard
            title="Temperature"
            value={formatTemperature(24.5)}
            unit={temperatureUnit}
            trend="stable"
            trendValue={`±${formatTemperature(0.2)}`}
            optimal={`${formatTemperature(22)}-${formatTemperature(26)}${temperatureUnit}`}
            status="normal"
            icon={<Thermometer className="h-5 w-5" />}
          />
          <KPICard
            title="Humidity"
            value={87}
            unit="%"
            trend="up"
            trendValue="+2%"
            optimal="80-90%"
            status="normal"
            icon={<Droplets className="h-5 w-5" />}
          />
          <KPICard
            title="CO2 Level"
            value={1050}
            unit="ppm"
            trend="up"
            trendValue="+150 ppm"
            optimal="800-1000"
            status="warning"
            icon={<Wind className="h-5 w-5" />}
          />
          <KPICard
            title="Airflow"
            value={formatSpeed(3.2)}
            unit={speedUnit}
            trend="stable"
            trendValue={`±${formatSpeed(0.1)}`}
            optimal={`${formatSpeed(2.5)}-${formatSpeed(4.0)}`}
            status="normal"
            icon={<Activity className="h-5 w-5" />}
          />
        </div>

        {/* Health Index and Active Batches */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <HealthIndex value={87} label="Farm Health Index" />

          <Card className="lg:col-span-2 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Leaf className="h-5 w-5 text-primary" />
                Active Batches
              </h2>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {activeBatches.length} Active
              </Badge>
            </div>
            <div className="space-y-4">
              {activeBatches.map((batch) => (
                <div key={batch.id} className="p-4 bg-muted/30 rounded-xl border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-foreground">{batch.name}</h3>
                    <Badge variant="outline" className="text-xs">{batch.shelter}</Badge>
                  </div>
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-sm text-muted-foreground">Stage: <span className="text-foreground font-medium">{batch.stage}</span></span>
                    <span className="text-sm text-muted-foreground">{batch.daysRemaining} days remaining</span>
                  </div>
                  <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-accent rounded-full transition-all"
                      style={{ width: `${batch.progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-muted-foreground">Progress</span>
                    <span className="text-xs font-medium text-foreground">{batch.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Alerts */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Active Alerts
                </h2>
                <Button variant="outline" size="sm" onClick={() => navigate("/alerts")}>
                  View All
                </Button>
              </div>

              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg border border-border hover:border-primary/50 transition-all alert-slide"
                  >
                    <div
                      className={`p-2 rounded-lg flex-shrink-0 ${
                        alert.severity === "warning"
                          ? "bg-warning/10 text-warning"
                          : "bg-info/10 text-info"
                      }`}
                    >
                      {alert.severity === "warning" ? (
                        <AlertTriangle className="h-5 w-5" />
                      ) : (
                        <CheckCircle className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground mb-1">
                        {alert.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {alert.message}
                      </p>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {alert.time}
                        </span>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => navigate("/alerts")}>
                      View
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Recent Events */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Recent Events</h2>
            <div className="space-y-4">
              {recentEvents.map((event, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 pb-4 border-b border-border last:border-0 last:pb-0"
                >
                  <div
                    className={`p-2 rounded-lg flex-shrink-0 ${
                      event.type === "success"
                        ? "bg-success/10 text-success"
                        : event.type === "warning"
                        ? "bg-warning/10 text-warning"
                        : "bg-info/10 text-info"
                    }`}
                  >
                    {event.type === "success" ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : event.type === "warning" ? (
                      <AlertTriangle className="h-4 w-4" />
                    ) : (
                      <Activity className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground">
                      {event.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {event.shelter}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {event.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Shelter Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          {[
            { name: "Shelter A", tempC: 24.5, humidity: "87%", stage: "Fruiting", status: "active" },
            { name: "Shelter B", tempC: 23.8, humidity: "85%", stage: "Colonization", status: "active" },
            { name: "Shelter C", tempC: 22.1, humidity: "82%", stage: "Incubation", status: "active" },
          ].map((shelter, index) => (
            <Card
              key={index}
              className="p-5 hover:shadow-md hover:border-primary/30 transition-all cursor-pointer rounded-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">{shelter.name}</h3>
                <Badge className="bg-success/10 text-success border-0 text-xs font-medium">
                  Active
                </Badge>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Stage</span>
                  <span className="font-medium text-foreground">{shelter.stage}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Temperature</span>
                  <span className="font-medium text-foreground">{formatTemperature(shelter.tempC)}{temperatureUnit}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Humidity</span>
                  <span className="font-medium text-foreground">{shelter.humidity}</span>
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-4 hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => navigate("/shelters")}
                >
                  View Details
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
