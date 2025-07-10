
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import ArtistsList from "./pages/ArtistsList";
import ArtistProfile from "./pages/ArtistProfile";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import ProfessionalProfile from "./pages/ProfessionalProfile";
import Castings from "./pages/Castings";
import CastingDetail from "./pages/CastingDetail";
import CreateCasting from "./pages/CreateCasting";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/artistes" element={<ArtistsList />} />
            <Route path="/artistes/:id" element={<ArtistProfile />} />
            <Route path="/evenements" element={<Events />} />
            <Route path="/evenements/:id" element={<EventDetail />} />
            <Route path="/castings" element={<Castings />} />
            <Route path="/castings/:id" element={<CastingDetail />} />
            <Route path="/castings/nouveau" element={<CreateCasting />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profil" element={<Profile />} />
            <Route path="/profil-pro" element={<ProfessionalProfile />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
