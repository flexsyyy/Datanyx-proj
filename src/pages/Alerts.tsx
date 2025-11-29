import { useState } from "react";
import { Navigation } from "@/components/layout/Navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, AlertCircle, Info, CheckCircle, Clock, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Alert {
  id: number;
  severity: string;
  title: string;
  description: string;
  chamber: string;
  time: string;
  action: string;
  resolved: boolean;
}

const initialAlerts: Alert[] = [
  {
    id: 1,
    severity: "critical",
    title: "CO2 levels dangerously high",
    description: "High CO2 can inhibit mushroom pinning. Immediate ventilation is recommended.",
    chamber: "Chamber B2",
    time: "5m ago",
    action: "Increase ventilation immediately",
    resolved: false,
  },
  {
    id: 2,
    severity: "warning",
    title: "Humidity dropping below optimal",
    description: "Low humidity may cause primordia to abort. Monitor and adjust misting frequency.",
    chamber: "Chamber A1",
    time: "1h ago",
    action: "Check humidifier settings",
    resolved: false,
  },
  {
    id: 3,
    severity: "info",
    title: "Substrate colonization at 95%",
    description: "The current batch is almost ready for the next growth stage. Prepare for fruiting conditions.",
    chamber: "Chamber C3",
    time: "4h ago",
    action: "Prepare fruiting conditions",
    resolved: true,
  },
  {
    id: 4,
    severity: "warning",
    title: "Temperature trending high",
    description: "Temperature reached a high level, which may stress developing primordia.",
    chamber: "Chamber B2",
    time: "2h ago",
    action: "Activate cooling system",
    resolved: true,
  },
];

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [isFixDialogOpen, setIsFixDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleMarkAllAsRead = () => {
    setAlerts(alerts.map((alert) => ({ ...alert, resolved: true })));
    toast({
      title: "All alerts marked as read",
      description: "All active alerts have been marked as resolved.",
    });
  };

  const handleApplyFix = (alert: Alert) => {
    setSelectedAlert(alert);
    setIsFixDialogOpen(true);
  };

  const confirmApplyFix = () => {
    if (selectedAlert) {
      setAlerts(
        alerts.map((a) =>
          a.id === selectedAlert.id ? { ...a, resolved: true } : a
        )
      );
      toast({
        title: "Fix applied successfully",
        description: `${selectedAlert.action} - Alert has been resolved.`,
      });
    }
    setIsFixDialogOpen(false);
    setSelectedAlert(null);
  };

  const activeAlerts = alerts.filter((a) => !a.resolved);
  const resolvedAlerts = alerts.filter((a) => a.resolved);

  const getAlertIcon = (severity: string) => {
    const iconClasses = "h-5 w-5";
    const bgClasses = {
      critical: "bg-critical/10 p-2 rounded-full",
      warning: "bg-warning/10 p-2 rounded-full",
      info: "bg-info/10 p-2 rounded-full",
    };

    switch (severity) {
      case "critical":
        return (
          <div className={bgClasses.critical}>
            <AlertTriangle className={cn(iconClasses, "text-critical")} />
          </div>
        );
      case "warning":
        return (
          <div className={bgClasses.warning}>
            <AlertCircle className={cn(iconClasses, "text-warning")} />
          </div>
        );
      case "info":
        return (
          <div className={bgClasses.info}>
            <Info className={cn(iconClasses, "text-info")} />
          </div>
        );
      default:
        return <AlertCircle className={iconClasses} />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return (
          <Badge className="bg-critical/10 text-critical border-0 font-semibold uppercase text-xs tracking-wide">
            Critical
          </Badge>
        );
      case "warning":
        return (
          <Badge className="bg-warning/10 text-warning border-0 font-semibold uppercase text-xs tracking-wide">
            Warning
          </Badge>
        );
      case "info":
        return (
          <Badge className="bg-info/10 text-info border-0 font-semibold uppercase text-xs tracking-wide">
            Info
          </Badge>
        );
      default:
        return <Badge>{severity}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Alerts</h1>
            <p className="text-muted-foreground mt-2">
              Monitor and manage all system alerts and notifications
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleMarkAllAsRead}
            disabled={activeAlerts.length === 0}
          >
            Mark All as Read
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Alerts</p>
                <p className="text-3xl font-bold text-foreground mt-1">{activeAlerts.length}</p>
              </div>
              <div className="p-3 bg-critical/10 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-critical" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resolved Today</p>
                <p className="text-3xl font-bold text-foreground mt-1">{resolvedAlerts.length}</p>
              </div>
              <div className="p-3 bg-success/10 rounded-lg">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Response Time</p>
                <p className="text-3xl font-bold text-foreground mt-1">8m</p>
              </div>
              <div className="p-3 bg-info/10 rounded-lg">
                <Clock className="h-6 w-6 text-info" />
              </div>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="active" className="space-y-6">
          <TabsList>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="all">All Alerts</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {activeAlerts.length === 0 ? (
              <Card className="p-8 text-center">
                <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
                <p className="text-muted-foreground">No active alerts. All systems running smoothly!</p>
              </Card>
            ) : (
              activeAlerts.map((alert) => (
                <Card
                  key={alert.id}
                  className={cn(
                    "p-5 hover:shadow-md transition-all animate-fade-in rounded-xl border",
                    alert.severity === "critical" && "border-critical/20 bg-critical/5",
                    alert.severity === "warning" && "border-warning/20 bg-warning/5"
                  )}
                >
                  <div className="flex items-start gap-4">
                    {getAlertIcon(alert.severity)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                        {getSeverityBadge(alert.severity)}
                        <span className="text-xs text-muted-foreground">{alert.time}</span>
                      </div>
                      <h3 className="text-base font-semibold text-foreground mb-1">
                        {alert.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {alert.description}
                      </p>
                      <div className="flex items-center gap-3 mt-3 text-xs">
                        <span className="px-2 py-0.5 bg-muted rounded-full text-muted-foreground">{alert.chamber}</span>
                        <span className="flex items-center gap-1 text-primary">
                          <Wrench className="h-3 w-3" />
                          {alert.action}
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <Button
                        size="sm"
                        onClick={() => handleApplyFix(alert)}
                        className={cn(
                          "font-medium",
                          alert.severity === "critical"
                            ? "bg-critical hover:bg-critical/90 text-white"
                            : "bg-primary hover:bg-primary-dark text-white"
                        )}
                      >
                        Apply Fix
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            {alerts.map((alert) => (
              <Card
                key={alert.id}
                className={cn(
                  "p-5 hover:shadow-md transition-all rounded-xl border",
                  alert.resolved && "opacity-70"
                )}
              >
                <div className="flex items-start gap-4">
                  {getAlertIcon(alert.severity)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                      {getSeverityBadge(alert.severity)}
                      {alert.resolved && (
                        <Badge className="bg-success/10 text-success border-0 font-semibold uppercase text-xs tracking-wide">
                          Resolved
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">{alert.time}</span>
                    </div>
                    <h3 className="text-base font-semibold text-foreground mb-1">
                      {alert.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {alert.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="resolved" className="space-y-4">
            {alerts
              .filter((alert) => alert.resolved)
              .map((alert) => (
                <Card
                  key={alert.id}
                  className="p-5 hover:shadow-md transition-all rounded-xl border opacity-70"
                >
                  <div className="flex items-start gap-4">
                    {getAlertIcon(alert.severity)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                        <Badge className="bg-success/10 text-success border-0 font-semibold uppercase text-xs tracking-wide">
                          Resolved
                        </Badge>
                        <span className="text-xs text-muted-foreground">{alert.time}</span>
                      </div>
                      <h3 className="text-base font-semibold text-foreground mb-1">
                        {alert.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {alert.description}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
          </TabsContent>
        </Tabs>

        {/* Apply Fix Confirmation Dialog */}
        <Dialog open={isFixDialogOpen} onOpenChange={setIsFixDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Apply Fix</DialogTitle>
              <DialogDescription>
                Are you sure you want to apply the following fix?
              </DialogDescription>
            </DialogHeader>
            {selectedAlert && (
              <div className="py-4">
                <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                  <p className="font-medium text-foreground">{selectedAlert.title}</p>
                  <p className="text-sm text-muted-foreground">{selectedAlert.chamber}</p>
                  <div className="flex items-center gap-2 text-sm text-primary mt-2">
                    <Wrench className="h-4 w-4" />
                    <span className="font-medium">{selectedAlert.action}</span>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsFixDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={confirmApplyFix}>
                Confirm & Apply
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
