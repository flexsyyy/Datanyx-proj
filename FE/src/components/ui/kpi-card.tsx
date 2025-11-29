import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: "up" | "down" | "stable";
  trendValue?: string;
  optimal?: string;
  status?: "normal" | "warning" | "critical";
  icon?: React.ReactNode;
  className?: string;
}

// Simple sparkline SVG component
function Sparkline({ trend, status }: { trend: "up" | "down" | "stable"; status: "normal" | "warning" | "critical" }) {
  const color = status === "critical" ? "hsl(var(--critical))" :
                status === "warning" ? "hsl(var(--warning))" :
                "hsl(var(--success))";

  // Different path patterns based on trend
  const paths = {
    up: "M0,20 Q10,18 20,15 T40,12 T60,8 T80,6 T100,4",
    down: "M0,4 Q10,6 20,8 T40,12 T60,15 T80,18 T100,20",
    stable: "M0,12 Q15,10 30,14 T50,11 T70,13 T90,10 T100,12"
  };

  return (
    <svg width="100" height="24" viewBox="0 0 100 24" className="overflow-visible">
      <path
        d={paths[trend]}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="drop-shadow-sm"
      />
    </svg>
  );
}

export function KPICard({
  title,
  value,
  unit,
  trend = "stable",
  trendValue,
  optimal,
  status = "normal",
  icon,
  className,
}: KPICardProps) {
  const statusStyles = {
    normal: "border-border bg-card",
    warning: "border-warning/30 bg-warning/5",
    critical: "border-critical/30 bg-critical/5",
  };

  const trendColors = {
    up: status === "warning" || status === "critical" ? "text-warning" : "text-success",
    down: status === "critical" ? "text-critical" : "text-success",
    stable: "text-muted-foreground",
  };

  const iconBgColors = {
    normal: "bg-primary/10 text-primary",
    warning: "bg-warning/10 text-warning",
    critical: "bg-critical/10 text-critical",
  };

  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : null;

  return (
    <Card className={cn(
      "p-5 transition-all hover:shadow-md border rounded-xl",
      statusStyles[status],
      className
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon && (
            <div className={cn("p-1.5 rounded-lg", iconBgColors[status])}>
              {icon}
            </div>
          )}
          <h3 className="text-sm font-medium text-foreground">{title}</h3>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-foreground tracking-tight">
            {value}
          </span>
          {unit && <span className="text-base text-muted-foreground">{unit}</span>}
        </div>

        {/* Sparkline */}
        <div className="py-1">
          <Sparkline trend={trend} status={status} />
        </div>

        <div className="flex items-center gap-2 text-xs">
          {TrendIcon && trendValue && (
            <div className={cn("flex items-center gap-0.5", trendColors[trend])}>
              <TrendIcon className="h-3 w-3" />
              <span className="font-medium">{trendValue}</span>
            </div>
          )}
          <span className="text-muted-foreground">Updated 5s ago</span>
        </div>
      </div>
    </Card>
  );
}
