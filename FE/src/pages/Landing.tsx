import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import MagicBento, { BentoCardItem } from "@/components/ui/MagicBento";
import { Logo } from "@/components/ui/Logo";
import {
  Thermometer,
  Droplets,
  Wind,
  Activity,
  Bell,
  TrendingUp,
  Shield,
  Zap,
  Users,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

export default function Landing() {
  const bentoFeatures: BentoCardItem[] = [
    {
      icon: <Activity className="h-8 w-8" />,
      title: "Real-Time Monitoring",
      description: "Track temperature, humidity, CO2, airflow, and substrate moisture continuously with live dashboards.",
      label: "MONITOR",
      colSpan: 2,
      rowSpan: 2,
    },
    {
      icon: <Bell className="h-8 w-8" />,
      title: "Smart Alerts",
      description: "Get instant notifications when environmental conditions drift from optimal ranges.",
      label: "ALERT",
      colSpan: 1,
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Predictive Analytics",
      description: "Leverage historical data to predict yield outcomes.",
      label: "PREDICT",
      colSpan: 1,
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Contamination Detection",
      description: "Early warning system for contamination risks.",
      label: "PROTECT",
      colSpan: 2,
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Actionable Insights",
      description: "Step-by-step recommendations to correct issues.",
      label: "ACT",
      colSpan: 1,
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Multi-Shelter Support",
      description: "Manage multiple growing chambers.",
      label: "SCALE",
      colSpan: 1,
    },
  ];


  const benefits = [
    "Eliminate guesswork with data-driven decisions",
    "Reduce batch failures and contamination rates",
    "Optimize yield with precision control",
    "Save time with automated monitoring",
    "Scale operations confidently",
    "Access expert recommendations instantly",
  ];

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-lg">
                <Logo className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground font-serif">
                mush-the-room
              </span>
            </div>
            <div className="flex gap-4">
              <Link to="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-primary hover:bg-primary-dark">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-background" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center space-y-8">

            <h1 className="text-4xl sm:text-6xl font-bold text-foreground max-w-4xl mx-auto leading-tight">
              Transform Mushroom Farming from{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                Guesswork to Precision
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Monitor environmental conditions in real-time, detect contamination
              early, and maximize yield with intelligent alerts and actionable
              insights designed for growers in Bengaluru and beyond.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link to="/signup">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary-dark text-lg px-8"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  View Demo Dashboard
                </Button>
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              The Challenge of Mushroom Cultivation
            </h2>
            <p className="text-lg text-muted-foreground">
              Mushrooms require strict micro-climate conditions. Small deviations
              in temperature, humidity, CO2, airflow, or substrate moisture lead
              to contamination, inconsistent growth, and batch failures—costing
              growers time and money.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 pt-8 text-left">
              <Card className="p-6">
                <Thermometer className="h-8 w-8 text-critical mb-3" />
                <h3 className="font-semibold mb-2">Temperature Fluctuations</h3>
                <p className="text-sm text-muted-foreground">
                  Even 2-3°C variance can trigger contamination or halt fruiting
                </p>
              </Card>
              <Card className="p-6">
                <Droplets className="h-8 w-8 text-critical mb-3" />
                <h3 className="font-semibold mb-2">Humidity Imbalance</h3>
                <p className="text-sm text-muted-foreground">
                  Too low causes drying, too high invites mold and bacteria
                </p>
              </Card>
              <Card className="p-6">
                <Wind className="h-8 w-8 text-critical mb-3" />
                <h3 className="font-semibold mb-2">Poor Air Exchange</h3>
                <p className="text-sm text-muted-foreground">
                  CO2 buildup stunts growth and reduces mushroom quality
                </p>
              </Card>
              <Card className="p-6">
                <Activity className="h-8 w-8 text-critical mb-3" />
                <h3 className="font-semibold mb-2">Manual Monitoring</h3>
                <p className="text-sm text-muted-foreground">
                  Checking conditions manually is time-consuming and error-prone
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid with MagicBento */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              How mush-the-room Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A complete monitoring platform designed specifically for mushroom
              cultivators who demand precision and reliability.
            </p>
          </div>

          <MagicBento 
            items={bentoFeatures} 
            glowColor="122, 154, 58" 
            enableStars={true}
            enableSpotlight={true}
          />
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                Why Choose mush-the-room?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Turn your mushroom farm into a predictable, high-yield operation
                with data-driven insights and real-time control.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-success flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <Card className="p-8 bg-gradient-to-br from-card to-card-elevated">
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-success/10 border border-success/20 rounded-lg">
                    <span className="text-sm font-medium">Temperature</span>
                    <span className="text-2xl font-bold text-success">
                      24.5°C
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-success/10 border border-success/20 rounded-lg">
                    <span className="text-sm font-medium">Humidity</span>
                    <span className="text-2xl font-bold text-success">87%</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-success/10 border border-success/20 rounded-lg">
                    <span className="text-sm font-medium">CO2</span>
                    <span className="text-2xl font-bold text-success">
                      850 ppm
                    </span>
                  </div>
                  <div className="text-center pt-4">
                    <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                      <Activity className="h-4 w-4 text-success animate-pulse" />
                      All systems optimal
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-dark to-accent opacity-95" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-6">
            Ready to Transform Your Mushroom Farm?
          </h2>
          <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join hundreds of growers in Bengaluru who have eliminated guesswork
            and maximized their yields with mush-the-room.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button
                size="lg"
                variant="secondary"
                className="text-lg px-8 bg-white hover:bg-white/90 text-primary"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
              >
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-lg">
                  <Logo className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold">mush-the-room</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Precision environment monitoring for mushroom farms. From Bengaluru
                to the world.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/features" className="hover:text-foreground">
                    Features
                  </Link>
                </li>
                <li>
                  <Link to="/pricing" className="hover:text-foreground">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" className="hover:text-foreground">
                    Demo
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    Help Center
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>© 2025 <span className="font-serif">mush-the-room</span>. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
