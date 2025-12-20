import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ResumeScreening from "./pages/ResumeScreening";
import ResumeBuilder from "./pages/ResumeBuilder";
import ResourceChat from "./pages/ResourceChat";
import SkillGap from "./pages/SkillGap";
import JobMatching from "./pages/JobMatching";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/resume-screening" element={<ResumeScreening />} />
            <Route path="/resume-builder" element={<ResumeBuilder />} />
            <Route path="/resources" element={<ResourceChat />} />
            <Route path="/skill-gap" element={<SkillGap />} />
            <Route path="/jobs" element={<JobMatching />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
