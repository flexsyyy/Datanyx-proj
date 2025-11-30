import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { UnitsProvider } from "./contexts/UnitsContext";
import { DataProvider } from "./contexts/DataContext";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Shelters from "./pages/Shelters";
import Alerts from "./pages/Alerts";
import Predict from "./pages/Predict";
import LiveMonitor from "./pages/LiveMonitor";
import Compare from "./pages/Compare";
import Reports from "./pages/Reports";
import Recommendations from "./pages/Recommendations";
import NotFound from "./pages/NotFound";
import { Chatbot } from "./components/Chatbot";
import DarkVeil from "./components/ui/DarkVeil";

const queryClient = new QueryClient();

// Wrapper to conditionally show chatbot (not on landing, login, signup)
function ChatbotWrapper() {
  const location = useLocation();
  const hideChatbotPaths = ["/", "/login", "/signup"];

  if (hideChatbotPaths.includes(location.pathname)) {
    return null;
  }

  return <Chatbot />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <DataProvider>
      <UnitsProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <div className="fixed inset-0 z-[-1] pointer-events-none">
            <DarkVeil 
              hueShift={60} 
              noiseIntensity={0.1} 
              scanlineIntensity={0.2} 
              scanlineFrequency={500}
              speed={0.2}
              warpAmount={0.5}
            />
          </div>
          <div className="fixed inset-0 z-[-2] bg-background/50 pointer-events-none" />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/shelters" element={<Shelters />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/predict" element={<Predict />} />
              <Route path="/live-monitor" element={<LiveMonitor />} />
              <Route path="/compare" element={<Compare />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/recommendations" element={<Recommendations />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <ChatbotWrapper />
          </BrowserRouter>
        </TooltipProvider>
      </UnitsProvider>
    </DataProvider>
  </QueryClientProvider>
);

export default App;
