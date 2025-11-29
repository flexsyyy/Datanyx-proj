import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SettingsPanel } from "@/components/SettingsPanel";
import {
  LayoutDashboard,
  Home,
  Bell,
  TrendingUp,
  Radio,
  GitCompare,
  BarChart3,
  Menu,
  X,
  Sprout,
  Lightbulb,
  AlertTriangle,
  Thermometer,
  Droplets,
} from "lucide-react";

// Sample notifications data
const notifications = [
  {
    id: 1,
    title: "High Temperature Alert",
    message: "Chamber A1 temperature exceeded 28°C",
    time: "5 min ago",
    type: "critical",
    icon: Thermometer,
  },
  {
    id: 2,
    title: "Humidity Warning",
    message: "Chamber B2 humidity dropped below 75%",
    time: "15 min ago",
    type: "warning",
    icon: Droplets,
  },
  {
    id: 3,
    title: "System Update",
    message: "New firmware available for sensors",
    time: "1 hour ago",
    type: "info",
    icon: AlertTriangle,
  },
];

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Shelters", href: "/shelters", icon: Home },
  { name: "Alerts", href: "/alerts", icon: Bell },
  { name: "Predict", href: "/predict", icon: TrendingUp },
  { name: "Live Monitor", href: "/live-monitor", icon: Radio },
  { name: "Compare", href: "/compare", icon: GitCompare },
  { name: "Recommendations", href: "/recommendations", icon: Lightbulb },
  { name: "Reports", href: "/reports", icon: BarChart3 },
];

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <>
      <nav className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-lg">
                  <Sprout className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-foreground">
                  mush-the-room
                </span>
              </Link>

              <div className="hidden lg:flex space-x-1">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground hover:scale-105"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Notifications Dropdown */}
              <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="hidden md:flex relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1 right-1 h-2 w-2 bg-critical rounded-full animate-pulse" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  <div className="p-4 border-b border-border">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground">Notifications</h3>
                      <span className="text-xs text-muted-foreground">{notifications.length} new</span>
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((notification) => {
                      const Icon = notification.icon;
                      return (
                        <div
                          key={notification.id}
                          className="p-4 border-b border-border last:border-0 hover:bg-muted/50 cursor-pointer transition-colors"
                          onClick={() => {
                            setNotificationsOpen(false);
                            navigate("/alerts");
                          }}
                        >
                          <div className="flex gap-3">
                            <div className={cn(
                              "p-2 rounded-lg shrink-0",
                              notification.type === "critical" && "bg-critical/10",
                              notification.type === "warning" && "bg-warning/10",
                              notification.type === "info" && "bg-primary/10"
                            )}>
                              <Icon className={cn(
                                "h-4 w-4",
                                notification.type === "critical" && "text-critical",
                                notification.type === "warning" && "text-warning",
                                notification.type === "info" && "text-primary"
                              )} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground">{notification.title}</p>
                              <p className="text-xs text-muted-foreground mt-0.5 truncate">{notification.message}</p>
                              <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="p-3 border-t border-border">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-primary hover:text-primary"
                      onClick={() => {
                        setNotificationsOpen(false);
                        navigate("/alerts");
                      }}
                    >
                      View all alerts
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              {/* User Avatar - Settings Trigger */}
              <button
                onClick={() => setSettingsOpen(true)}
                className="hidden md:flex items-center gap-2 p-1 rounded-full hover:bg-muted transition-colors"
              >
                <Avatar className="h-9 w-9 border-2 border-primary/20 hover:border-primary/50 transition-colors">
                  <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=mushroom" />
                  <AvatarFallback>MF</AvatarFallback>
                </Avatar>
              </button>

              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-border animate-fade-in">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
              {/* Mobile Settings */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setSettingsOpen(true);
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground w-full"
              >
                <Avatar className="h-5 w-5">
                  <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=mushroom" />
                  <AvatarFallback>MF</AvatarFallback>
                </Avatar>
                Settings
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Settings Panel */}
      <SettingsPanel open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}
