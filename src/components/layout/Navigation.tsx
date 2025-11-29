import { useState, useEffect, useRef } from "react";
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
  const [showNav, setShowNav] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const navRef = useRef<HTMLDivElement>(null);

  // Hide nav on landing, login, and signup pages
  const hideNavPaths = ["/", "/login", "/signup"];
  const shouldShowNav = !hideNavPaths.includes(location.pathname);

  // Scroll detection - hide when scrolling down, show when scrolling up
  useEffect(() => {
    if (!shouldShowNav) {
      setShowNav(false);
      return;
    }

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show nav when scrolling up, hide when scrolling down
      if (currentScrollY < lastScrollY) {
        // Scrolling up
        setShowNav(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down and past 100px
        setShowNav(false);
      } else if (currentScrollY <= 100) {
        // Always show when near top
        setShowNav(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, shouldShowNav]);

  if (!shouldShowNav) {
    return (
      <>
        <SettingsPanel open={settingsOpen} onOpenChange={setSettingsOpen} />
      </>
    );
  }

  return (
    <>
      {/* Floating Navigation Bar - Full Width */}
      <nav 
        ref={navRef}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out",
          showNav
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-full pointer-events-none"
        )}
      >
        <div className={cn(
          "flex items-center gap-2 px-4 sm:px-6 lg:px-8 py-3",
          "bg-background/80 backdrop-blur-md border-b border-border/50",
          "shadow-lg shadow-black/10",
          "dark:bg-background/90 dark:border-border/70"
        )}>
          <div className="max-w-7xl mx-auto w-full flex items-center gap-4">
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted/50 transition-colors shrink-0"
            >
              <div className="p-1.5 bg-gradient-to-br from-primary to-accent rounded-lg">
                <Sprout className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground hidden sm:inline">
                mush-the-room
              </span>
            </Link>

            <div className="h-6 w-px bg-border" />

            {/* Navigation Items - Icons and Text */}
            <div className="flex items-center gap-1 flex-1 justify-center flex-wrap">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200",
                      "hover:scale-105 active:scale-95 whitespace-nowrap",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </div>

            <div className="h-6 w-px bg-border" />

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-lg relative"
                  >
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
                          <div
                            className={cn(
                              "p-2 rounded-lg shrink-0",
                              notification.type === "critical" && "bg-critical/10",
                              notification.type === "warning" && "bg-warning/10",
                              notification.type === "info" && "bg-primary/10"
                            )}
                          >
                            <Icon
                              className={cn(
                                "h-4 w-4",
                                notification.type === "critical" && "text-critical",
                                notification.type === "warning" && "text-warning",
                                notification.type === "info" && "text-primary"
                              )}
                            />
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

              <button
                onClick={() => setSettingsOpen(true)}
                className="h-10 w-10 rounded-lg hover:bg-muted/50 transition-colors flex items-center justify-center"
              >
                <Avatar className="h-7 w-7 border border-primary/20">
                  <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=mushroom" />
                  <AvatarFallback className="text-xs">MF</AvatarFallback>
                </Avatar>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu - Hidden by default, shown on mobile */}
      {mobileMenuOpen && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 w-[90vw] max-w-md">
          <div className={cn(
            "rounded-2xl p-3 space-y-1",
            "bg-background/95 backdrop-blur-md border border-border/50",
            "shadow-xl"
          )}>
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

      {/* Mobile Menu Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 right-4 z-50 lg:hidden h-9 w-9 rounded-lg bg-background/80 backdrop-blur-md border border-border/50"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </Button>

      {/* Settings Panel */}
      <SettingsPanel open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}
