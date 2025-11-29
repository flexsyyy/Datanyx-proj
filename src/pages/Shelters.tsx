import { useState } from "react";
import { Navigation } from "@/components/layout/Navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUnits } from "@/contexts/UnitsContext";
import { Thermometer, Droplets, Wind, Activity, Calendar, Plus } from "lucide-react";

const shelters = [
  {
    id: "shelter-1",
    name: "Chamber A1",
    species: "Oyster Mushroom",
    stage: "Fruiting",
    temp: 22,
    humidity: 85,
    co2: 1200,
    health: 92,
    status: "optimal",
    lastEvent: "Misting cycle completed",
  },
  {
    id: "shelter-2",
    name: "Chamber B2",
    species: "Shiitake",
    stage: "Colonization",
    temp: 24,
    humidity: 78,
    co2: 1800,
    health: 78,
    status: "warning",
    lastEvent: "CO2 slightly elevated",
  },
  {
    id: "shelter-3",
    name: "Chamber C3",
    species: "Button Mushroom",
    stage: "Spawn",
    temp: 23,
    humidity: 82,
    co2: 1400,
    health: 88,
    status: "optimal",
    lastEvent: "Temperature stable",
  },
];

export default function Shelters() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newShelter, setNewShelter] = useState({
    name: "",
    species: "",
    stage: "spawn",
  });
  const { formatTemperature, temperatureUnit } = useUnits();

  // Filter shelters for tabs
  const activeShelters = shelters.filter((s) => s.status === "optimal");
  const issuesShelters = shelters.filter((s) => s.status === "warning" || s.status === "critical");

  const handleAddShelter = () => {
    // In a real app, this would add to the database
    console.log("Adding shelter:", newShelter);
    setIsAddModalOpen(false);
    setNewShelter({ name: "", species: "", stage: "spawn" });
  };

  const renderShelterCard = (shelter: typeof shelters[0]) => (
    <Card key={shelter.id} className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-semibold text-foreground">
              {shelter.name}
            </h3>
            <Badge
              variant={
                shelter.status === "optimal"
                  ? "default"
                  : shelter.status === "warning"
                  ? "secondary"
                  : "destructive"
              }
            >
              {shelter.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {shelter.species} • {shelter.stage} Stage
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Health Score</p>
          <p className="text-2xl font-bold text-success">
            {shelter.health}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Thermometer className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Temperature</p>
            <p className="text-sm font-semibold text-foreground">
              {formatTemperature(shelter.temp)}{temperatureUnit}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent/10 rounded-lg">
            <Droplets className="h-5 w-5 text-accent" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Humidity</p>
            <p className="text-sm font-semibold text-foreground">
              {shelter.humidity}%
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-muted rounded-lg">
            <Wind className="h-5 w-5 text-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">CO2</p>
            <p className="text-sm font-semibold text-foreground">
              {shelter.co2} ppm
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <p className="text-sm font-semibold text-foreground">Active</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {shelter.lastEvent}
        </div>
        <Button variant="outline" size="sm">
          View Details
        </Button>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Shelters</h1>
            <p className="text-muted-foreground mt-2">
              Monitor and manage all mushroom growing chambers
            </p>
          </div>
          <Button className="bg-primary hover:bg-primary/90" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Shelter
          </Button>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Chambers ({shelters.length})</TabsTrigger>
            <TabsTrigger value="active">Active ({activeShelters.length})</TabsTrigger>
            <TabsTrigger value="issues">Needs Attention ({issuesShelters.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {shelters.map(renderShelterCard)}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {activeShelters.length > 0 ? (
              activeShelters.map(renderShelterCard)
            ) : (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No active chambers with optimal status</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="issues" className="space-y-4">
            {issuesShelters.length > 0 ? (
              issuesShelters.map(renderShelterCard)
            ) : (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No chambers requiring attention</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Add New Shelter Modal */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Shelter</DialogTitle>
              <DialogDescription>
                Create a new mushroom growing chamber. Fill in the details below.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Shelter Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Chamber D4"
                  value={newShelter.name}
                  onChange={(e) => setNewShelter({ ...newShelter, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="species">Mushroom Species</Label>
                <Select
                  value={newShelter.species}
                  onValueChange={(v) => setNewShelter({ ...newShelter, species: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select species" />
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
              <div className="grid gap-2">
                <Label htmlFor="stage">Growth Stage</Label>
                <Select
                  value={newShelter.stage}
                  onValueChange={(v) => setNewShelter({ ...newShelter, stage: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spawn">Spawn</SelectItem>
                    <SelectItem value="colonization">Colonization</SelectItem>
                    <SelectItem value="fruiting">Fruiting</SelectItem>
                    <SelectItem value="harvest">Harvest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddShelter} disabled={!newShelter.name || !newShelter.species}>
                Add Shelter
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
