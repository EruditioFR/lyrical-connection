
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import ArtistProfile from "./pages/ArtistProfile";
import ProfessionalProfile from "./pages/ProfessionalProfile";
import ArtistsList from "./pages/ArtistsList";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import NotFound from "./pages/NotFound";
import Castings from "./pages/Castings";
import CastingDetail from "./pages/CastingDetail";
import CreateCasting from "./pages/CreateCasting";
import CastingApplication from "./pages/CastingApplication";
import MyApplications from "./pages/MyApplications";
import ProfessionalApplications from "./pages/ProfessionalApplications";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/artist/:id" element={<ArtistProfile />} />
            <Route path="/professional/:id" element={<ProfessionalProfile />} />
            <Route path="/artists" element={<ArtistsList />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:id" element={<EventDetail />} />
            <Route path="/castings" element={<Castings />} />
            <Route path="/castings/:id" element={<CastingDetail />} />
            <Route path="/castings/nouveau" element={<CreateCasting />} />
            <Route path="/castings/:id/postuler" element={<CastingApplication />} />
            <Route path="/mes-candidatures" element={<MyApplications />} />
            <Route path="/castings/:castingId/candidatures" element={<ProfessionalApplications />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
