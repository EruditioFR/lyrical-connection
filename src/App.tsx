
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from 'next-themes';

// Import existing pages
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import Profile from '@/pages/Profile';
import ArtistProfile from '@/pages/ArtistProfile';
import ProfessionalProfile from '@/pages/ProfessionalProfile';
import Castings from '@/pages/Castings';
import CreateCasting from '@/pages/CreateCasting';
import CastingDetail from '@/pages/CastingDetail';
import CastingApplication from '@/pages/CastingApplication';
import MyApplications from '@/pages/MyApplications';
import ProfessionalApplications from '@/pages/ProfessionalApplications';
import Events from '@/pages/Events';
import CreateEvent from '@/pages/CreateEvent';
import EditEvent from '@/pages/EditEvent';
import EventDetail from '@/pages/EventDetail';
import ProfessionalEvents from '@/pages/ProfessionalEvents';
import ArtistsList from '@/pages/ArtistsList';
import ArtistSearch from '@/pages/ArtistSearch';
import Messages from '@/pages/Messages';
import ProfessionalMessages from '@/pages/ProfessionalMessages';
import Pricing from '@/pages/Pricing';
import Subscription from '@/pages/Subscription';
import SubscriptionSuccess from '@/pages/SubscriptionSuccess';
import ChangePassword from '@/pages/ChangePassword';
import About from '@/pages/About';
import Admin from '@/pages/Admin';
import NotFound from '@/pages/NotFound';

// Import nouvelles pages
import ProfessionalCastingApplications from '@/pages/ProfessionalCastingApplications';
import ProfessionalEventApplications from '@/pages/ProfessionalEventApplications';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profil" element={<Profile />} />
              <Route path="/artistes/:id" element={<ArtistProfile />} />
              <Route path="/professionnel/:id" element={<ProfessionalProfile />} />
              
              {/* Routes pour les castings */}
              <Route path="/castings" element={<Castings />} />
              <Route path="/castings/nouveau" element={<CreateCasting />} />
              <Route path="/castings/:id" element={<CastingDetail />} />
              <Route path="/castings/:id/postuler" element={<CastingApplication />} />
              <Route path="/mes-candidatures" element={<MyApplications />} />
              <Route path="/professional/castings/:castingId/applications" element={<ProfessionalApplications />} />
              <Route path="/professional/casting-applications" element={<ProfessionalCastingApplications />} />
              
              {/* Routes pour les événements */}
              <Route path="/evenements" element={<Events />} />
              <Route path="/evenements/nouveau" element={<CreateEvent />} />
              <Route path="/evenements/:id" element={<EventDetail />} />
              <Route path="/evenements/:id/modifier" element={<EditEvent />} />
              <Route path="/mes-evenements" element={<ProfessionalEvents />} />
              <Route path="/professional/event-applications" element={<ProfessionalEventApplications />} />
              
              {/* Routes pour les artistes */}
              <Route path="/artistes" element={<ArtistsList />} />
              <Route path="/recherche-artistes" element={<ArtistSearch />} />
              
              {/* Routes pour la messagerie */}
              <Route path="/messages" element={<Messages />} />
              <Route path="/professional/messages" element={<ProfessionalMessages />} />
              
              {/* Routes pour l'abonnement */}
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/subscription" element={<Subscription />} />
              <Route path="/subscription/success" element={<SubscriptionSuccess />} />
              
              {/* Autres routes */}
              <Route path="/change-password" element={<ChangePassword />} />
              <Route path="/about" element={<About />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </div>
        </Router>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
