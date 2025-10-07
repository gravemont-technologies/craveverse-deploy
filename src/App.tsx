import { Toaster } from "@/components/ui/toast.tsx";
// Remove or comment out the Sonner import since it doesn't exist
// import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "@/pages/Landing.tsx";
import Quiz from "@/pages/Quiz.tsx";
import Dashboard from "@/pages/Dashboard.tsx";
import Competitions from "@/pages/Competitions.tsx";
import Tips from "@/pages/Tips.tsx";
import Projections from "@/pages/Projections.tsx";
import Emergency from "@/pages/Emergency.tsx";
import Rewards from "@/pages/Rewards.tsx";
import Profile from "@/pages/Profile.tsx";
import NotFound from "@/pages/NotFound.tsx";
import BottomNav from "@/components/BottomNav.tsx";
import ThemeToggle from "@/components/ThemeToggle.tsx";
import SylviaChat from "@/components/SylviaChat.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      {/* Remove or comment out Sonner component */}
      {/* <Sonner /> */}
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
