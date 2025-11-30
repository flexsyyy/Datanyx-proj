import { useState, useEffect } from "react";
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
import { useDataContext } from "@/contexts/DataContext";

interface Alert {
  id: string;
  severity: string;
  title: string;
  message: string;
  description?: string;
  chamber?: string;
  time: string;
  action?: string;
  resolved?: boolean;
  timestamp: string;
}

export default function Alerts() {
  const { alerts: contextAlerts } = useDataContext();
  const [localAlerts, setLocalAlerts] = useState<Alert[]>([]);
  
  // Merge context alerts with any resolved state tracking
  useEffect(() => {
    // Map context alerts to local format with resolved tracking
    const mappedAlerts = contextAlerts.map(alert => ({
      ...alert,
      description: alert.message,
      chamber: "Prediction System",
      action: alert.severity === "critical" ? "Adjust conditions immediately" : "Review and optimize",
      resolved: false,
    }));
    setLocalAlerts(mappedAlerts);
  }, [contextAlerts]);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [isFixDialogOpen, setIsFixDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleMarkAllAsRead = () => {
    setLocalAlerts(localAlerts.map((alert) => ({ ...alert, resolved: true })));
    toast({
      title: "All alerts marked as read",
      description: "All active alerts have been marked as resolved.",
    });
  };

  const handleApplyFix = (alert: Alert) => {
    setSelectedAlert(alert);
    setIsFixDialogOpen(true);
  };

  // Get actionable recommendations based on alert type
  const getRecommendations = (alert: Alert): { action: string; steps: string[] } => {
    const title = alert.title.toLowerCase();
    const severity = alert.severity;
    
    // Temperature alerts
    if (title.includes('temperature')) {
      if (title.includes('critical') && title.includes('high')) {
        return {
          action: 'Reduce temperature immediately',
          steps: [
            'Activate cooling system or increase ventilation',
            'Check for equipment malfunction or heat sources',
            'Monitor temperature every 5 minutes until stabilized',
            'Consider misting to help cool the environment'
          ]
        };
      } else if (title.includes('critical') && title.includes('low')) {
        return {
          action: 'Increase temperature immediately',
          steps: [
            'Activate heating system or reduce ventilation',
            'Check for drafts or cold air leaks',
            'Monitor temperature every 5 minutes until stabilized',
            'Ensure heating equipment is functioning properly'
          ]
        };
      } else if (title.includes('warning') && title.includes('high')) {
        return {
          action: 'Take preventive action before it becomes critical',
          steps: [
            'Increase air circulation gradually',
            'Check cooling system is operating efficiently',
            'Monitor temperature trend over next 30 minutes',
            'Prepare to activate emergency cooling if needed'
          ]
        };
      } else {
        return {
          action: 'Take preventive action before it becomes critical',
          steps: [
            'Adjust heating system settings',
            'Monitor temperature trend over next 30 minutes',
            'Check for environmental changes affecting temperature',
            'Prepare heating backup if temperature continues to drop'
          ]
        };
      }
    }
    
    // Humidity alerts
    if (title.includes('humidity')) {
      if (title.includes('critical') && title.includes('high')) {
        return {
          action: 'Reduce humidity immediately',
          steps: [
            'Increase ventilation to allow moisture to escape',
            'Stop misting cycles temporarily',
            'Check for water leaks or excess moisture sources',
            'Consider using dehumidifier if available'
          ]
        };
      } else if (title.includes('critical') && title.includes('low')) {
        return {
          action: 'Increase humidity immediately',
          steps: [
            'Activate misting system',
            'Reduce ventilation temporarily',
            'Check humidifier is functioning properly',
            'Monitor substrate moisture levels'
          ]
        };
      } else if (title.includes('warning')) {
        return {
          action: 'Take preventive action before critical levels',
          steps: [
            title.includes('high') ? 'Slightly increase air exchange' : 'Slightly increase misting frequency',
            'Monitor humidity trend over next 20 minutes',
            'Check all humidity control equipment',
            'Prepare for adjustments if trend continues'
          ]
        };
      }
    }
    
    // CO2 alerts
    if (title.includes('co2')) {
      if (title.includes('critical') && title.includes('high')) {
        return {
          action: 'Reduce CO2 immediately - Risk of growth inhibition',
          steps: [
            'Increase fresh air exchange significantly',
            'Open vents or activate exhaust fans',
            'Check ventilation system is not blocked',
            'Monitor CO2 every 10 minutes until below 1000 ppm'
          ]
        };
      } else if (title.includes('warning') && title.includes('high')) {
        return {
          action: 'Act now to prevent critical CO2 buildup',
          steps: [
            'Increase ventilation rate by 25-50%',
            'Check air circulation fans are operating',
            'Monitor CO2 trend over next 15 minutes',
            'Prepare to increase fresh air if levels continue rising'
          ]
        };
      } else if (title.includes('low')) {
        return {
          action: severity === 'critical' ? 'Increase CO2 immediately' : 'Take preventive action',
          steps: [
            'Reduce fresh air exchange slightly',
            'Check for excessive ventilation',
            'Monitor fruiting body development',
            'Adjust CO2 injection if system is available'
          ]
        };
      }
    }
    
    // Default recommendations
    return {
      action: severity === 'critical' ? 'Immediate action required' : 'Review and optimize conditions',
      steps: [
        'Check all environmental control systems',
        'Monitor parameter trends closely',
        'Review optimal ranges for your mushroom species',
        'Adjust systems gradually to avoid shocking the culture'
      ]
    };
  };

  const confirmApplyFix = () => {
    if (selectedAlert) {
      setLocalAlerts(
        localAlerts.map((a) =>
          a.id === selectedAlert.id ? { ...a, resolved: true } : a
        )
      );
      toast({
        title: "Fix applied successfully",
        description: "Alert has been acknowledged and marked as resolved.",
      });
    }
    setIsFixDialogOpen(false);
    setSelectedAlert(null);
  };

  const activeAlerts = localAlerts.filter((a) => !a.resolved);
  const resolvedAlerts = localAlerts.filter((a) => a.resolved);

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
            {localAlerts.map((alert) => (
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
            {localAlerts
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
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>
                {selectedAlert?.severity === 'critical' ? '🔴 Critical Alert - Immediate Action Required' : '⚠️ Warning - Take Action Before Danger'}
              </DialogTitle>
              <DialogDescription>
                {selectedAlert?.severity === 'critical' 
                  ? 'Conditions are outside safe range. Follow these steps immediately to prevent damage to your culture.'
                  : 'Conditions are approaching critical levels. Act now to prevent escalation and protect your mushroom yield.'}
              </DialogDescription>
            </DialogHeader>
            {selectedAlert && (() => {
              const recommendations = getRecommendations(selectedAlert);
              return (
                <div className="py-4 space-y-4">
                  {/* Alert Info */}
                  <div className={cn(
                    "p-4 rounded-lg border-l-4",
                    selectedAlert.severity === 'critical' ? 'bg-critical/5 border-critical' : 'bg-warning/5 border-warning'
                  )}>
                    <p className="font-semibold text-foreground mb-1">{selectedAlert.title}</p>
                    <p className="text-sm text-muted-foreground">{selectedAlert.message}</p>
                  </div>

                  {/* Recommended Action */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Wrench className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold text-foreground">Recommended Action:</h4>
                    </div>
                    <p className="text-sm font-medium text-primary pl-7">{recommendations.action}</p>
                  </div>

                  {/* Step-by-step guide */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-foreground">Steps to Resolve:</h4>
                    <ol className="space-y-2 pl-5">
                      {recommendations.steps.map((step, index) => (
                        <li key={index} className="text-sm text-muted-foreground list-decimal">
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Warning message for warnings */}
                  {selectedAlert.severity === 'warning' && (
                    <div className="p-3 bg-warning/10 border border-warning/30 rounded-lg">
                      <p className="text-sm text-orange-900 dark:text-orange-100 font-semibold">
                        ⏰ Act now to prevent this from becoming a critical issue!
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsFixDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={confirmApplyFix}
                className={selectedAlert?.severity === 'critical' ? 'bg-critical hover:bg-critical/90' : ''}
              >
                Confirm & Apply
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
