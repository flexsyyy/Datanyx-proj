import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bell,
  Moon,
  Sun,
  LogOut,
  Ruler,
  Zap,
  Mail,
  Smartphone,
  AlertTriangle,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUnits } from "@/contexts/UnitsContext";

interface SettingsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsPanel({ open, onOpenChange }: SettingsPanelProps) {
  const navigate = useNavigate();
  const { units, setUnits } = useUnits();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark" || document.documentElement.classList.contains("dark");
    }
    return false;
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    criticalAlerts: true,
    weeklyReports: false,
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const handleSignOut = () => {
    onOpenChange(false);
    navigate("/login");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[400px] overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>Manage your account and preferences</SheetDescription>
        </SheetHeader>

        {/* User Profile Section */}
        <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl mb-6">
          <Avatar className="h-16 w-16 border-2 border-primary/20">
            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=mushroom" />
            <AvatarFallback>MF</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">Mushroom Farmer</h3>
            <p className="text-sm text-muted-foreground">farmer@mush-the-room.com</p>
            <Button variant="link" className="h-auto p-0 text-xs text-primary">
              Edit Profile <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Dark Mode Toggle */}
        <div className="flex items-center justify-between p-4 bg-card border rounded-xl mb-6 hover:border-primary/30 transition-colors">
          <div className="flex items-center gap-3">
            {isDarkMode ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-warning" />}
            <div>
              <Label className="font-medium">Dark Mode</Label>
              <p className="text-xs text-muted-foreground">Switch to {isDarkMode ? "light" : "dark"} theme</p>
            </div>
          </div>
          <Switch checked={isDarkMode} onCheckedChange={setIsDarkMode} />
        </div>

        <Separator className="my-4" />

        {/* Notifications */}
        <div className="space-y-4 mb-6">
          <h3 className="font-semibold flex items-center gap-2">
            <Bell className="h-4 w-4" /> Notifications
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm">Email Notifications</Label>
              </div>
              <Switch
                checked={notifications.email}
                onCheckedChange={(v) => setNotifications({ ...notifications, email: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm">Push Notifications</Label>
              </div>
              <Switch
                checked={notifications.push}
                onCheckedChange={(v) => setNotifications({ ...notifications, push: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-critical" />
                <Label className="text-sm">Critical Alerts</Label>
              </div>
              <Switch
                checked={notifications.criticalAlerts}
                onCheckedChange={(v) => setNotifications({ ...notifications, criticalAlerts: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm">Weekly Reports</Label>
              </div>
              <Switch
                checked={notifications.weeklyReports}
                onCheckedChange={(v) => setNotifications({ ...notifications, weeklyReports: v })}
              />
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Preferences */}
        <div className="space-y-4 mb-6">
          <h3 className="font-semibold flex items-center gap-2">
            <Zap className="h-4 w-4" /> Preferences
          </h3>
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Ruler className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm">Units</Label>
              </div>
              <Select
                value={units}
                onValueChange={(v) => setUnits(v as "metric" | "imperial")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="metric">Metric (°C, kg, m/s)</SelectItem>
                  <SelectItem value="imperial">Imperial (°F, lb, ft/s)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                This setting affects temperature, weight, and speed displays across the app.
              </p>
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Integrations */}
        <div className="space-y-4 mb-8">
          <h3 className="font-semibold flex items-center gap-2">
            <Zap className="h-4 w-4" /> Integrations
          </h3>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start gap-2 h-auto py-3">
              <div className="p-1.5 bg-[#4285F4] rounded">
                <svg className="h-4 w-4 text-white" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </div>
              <div className="text-left">
                <p className="font-medium text-sm">Google Calendar</p>
                <p className="text-xs text-muted-foreground">Sync harvest schedules</p>
              </div>
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2 h-auto py-3">
              <div className="p-1.5 bg-[#25D366] rounded">
                <svg className="h-4 w-4 text-white" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <div className="text-left">
                <p className="font-medium text-sm">WhatsApp Alerts</p>
                <p className="text-xs text-muted-foreground">Get instant notifications</p>
              </div>
            </Button>
          </div>
        </div>

        {/* Sign Out */}
        <Button
          variant="outline"
          className="w-full border-critical/30 text-critical hover:bg-critical/10 hover:border-critical"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </SheetContent>
    </Sheet>
  );
}

