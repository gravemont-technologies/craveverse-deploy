import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Quiz from "./pages/Quiz";
import Dashboard from "./pages/Dashboard";
import Competitions from "./pages/Competitions";
import Tips from "./pages/Tips";
import Projections from "./pages/Projections";
import Emergency from "./pages/Emergency";
import Rewards from "./pages/Rewards";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import BottomNav from "./components/BottomNav";
import ThemeToggle from "./components/ThemeToggle";
import SylviaChat from "./components/SylviaChat";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ThemeToggle />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/dashboard" element={<><Dashboard /><BottomNav /><SylviaChat /></>} />
          <Route path="/competitions" element={<><Competitions /><BottomNav /><SylviaChat /></>} />
          <Route path="/tips" element={<><Tips /><BottomNav /><SylviaChat /></>} />
          <Route path="/projections" element={<><Projections /><BottomNav /><SylviaChat /></>} />
          <Route path="/emergency" element={<><Emergency /><BottomNav /><SylviaChat /></>} />
          <Route path="/rewards" element={<><Rewards /><BottomNav /><SylviaChat /></>} />
          <Route path="/profile" element={<><Profile /><BottomNav /><SylviaChat /></>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
