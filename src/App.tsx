
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/hooks/useAuth';
import { AuthGuard } from '@/components/auth/AuthGuard';

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
import Notifications from '@/pages/Notifications';
import ProfessionalsList from '@/pages/ProfessionalsList';
import ProfessionalDetail from '@/pages/ProfessionalDetail';

// Import nouvelles pages
import ProfessionalCastingApplications from '@/pages/ProfessionalCastingApplications';
import ProfessionalEventApplications from '@/pages/ProfessionalEventApplications';
import ReceivedApplications from '@/pages/ReceivedApplications';

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
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthProvider>
          <div className="min-h-screen w-full">
            <Router>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/about" element={<About />} />
                <Route path="/qui-sommes-nous" element={<About />} />
                <Route path="/pricing" element={<Pricing />} />
                
                {/* Routes protégées par authentification */}
                <Route path="/dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />
                <Route path="/profil" element={<AuthGuard><Profile /></AuthGuard>} />
                <Route path="/professional-profile" element={<AuthGuard><ProfessionalProfile /></AuthGuard>} />
                <Route path="/artistes/:id" element={<AuthGuard><ArtistProfile /></AuthGuard>} />
                <Route path="/professionnel/:id" element={<AuthGuard><ProfessionalProfile /></AuthGuard>} />
                
                {/* Routes pour les castings */}
                <Route path="/castings" element={<AuthGuard><Castings /></AuthGuard>} />
                <Route path="/castings/nouveau" element={<AuthGuard><CreateCasting /></AuthGuard>} />
                <Route path="/castings/:id" element={<AuthGuard><CastingDetail /></AuthGuard>} />
                <Route path="/castings/:id/postuler" element={<AuthGuard><CastingApplication /></AuthGuard>} />
                <Route path="/mes-candidatures" element={<AuthGuard><MyApplications /></AuthGuard>} />
                <Route path="/candidatures-reçues" element={<AuthGuard><ReceivedApplications /></AuthGuard>} />
                <Route path="/professional/castings/:castingId/applications" element={<AuthGuard><ProfessionalApplications /></AuthGuard>} />
                <Route path="/professional/casting-applications" element={<AuthGuard><ProfessionalCastingApplications /></AuthGuard>} />
                
                {/* Routes pour les événements */}
                <Route path="/evenements" element={<AuthGuard><Events /></AuthGuard>} />
                <Route path="/evenements/nouveau" element={<AuthGuard><CreateEvent /></AuthGuard>} />
                <Route path="/evenements/:id" element={<AuthGuard><EventDetail /></AuthGuard>} />
                <Route path="/evenements/:id/modifier" element={<AuthGuard><EditEvent /></AuthGuard>} />
                <Route path="/mes-evenements" element={<AuthGuard><ProfessionalEvents /></AuthGuard>} />
                <Route path="/professional/event-applications" element={<AuthGuard><ProfessionalEventApplications /></AuthGuard>} />
                
                {/* Routes pour les artistes */}
                <Route path="/artistes" element={<AuthGuard><ArtistsList /></AuthGuard>} />
                <Route path="/recherche-artistes" element={<AuthGuard><ArtistSearch /></AuthGuard>} />
                
                {/* Routes pour les professionnels */}
                <Route path="/professionnels" element={<AuthGuard><ProfessionalsList /></AuthGuard>} />
                <Route path="/professionnels/:id" element={<AuthGuard><ProfessionalDetail /></AuthGuard>} />
                
                {/* Routes pour la messagerie */}
                <Route path="/messages" element={<AuthGuard><Messages /></AuthGuard>} />
                <Route path="/professional/messages" element={<AuthGuard><ProfessionalMessages /></AuthGuard>} />
                
                {/* Route pour les notifications */}
                <Route path="/notifications" element={<AuthGuard><Notifications /></AuthGuard>} />
                
                {/* Routes pour l'abonnement */}
                <Route path="/subscription" element={<AuthGuard><Subscription /></AuthGuard>} />
                <Route path="/subscription/success" element={<AuthGuard><SubscriptionSuccess /></AuthGuard>} />
                
                {/* Autres routes */}
                <Route path="/change-password" element={<AuthGuard><ChangePassword /></AuthGuard>} />
                <Route path="/admin" element={<AuthGuard><Admin /></AuthGuard>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
            </Router>
          </div>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
