
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/hooks/useAuth';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import Profile from '@/pages/Profile';
import Events from '@/pages/Events';
import EventDetail from '@/pages/EventDetail';
import CreateEvent from '@/pages/CreateEvent';
import EditEvent from '@/pages/EditEvent';
import Messages from '@/pages/Messages';
import ProfessionalMessages from '@/pages/ProfessionalMessages';
import ProfessionalEvents from '@/pages/ProfessionalEvents';
import ArtistSearch from '@/pages/ArtistSearch';
import ArtistsList from '@/pages/ArtistsList';
import ArtistProfile from '@/pages/ArtistProfile';
import Castings from '@/pages/Castings';
import CreateCasting from '@/pages/CreateCasting';
import CastingDetail from '@/pages/CastingDetail';
import CastingApplication from '@/pages/CastingApplication';
import MyApplications from '@/pages/MyApplications';
import ProfessionalApplications from '@/pages/ProfessionalApplications';
import ProfessionalProfile from '@/pages/ProfessionalProfile';
import About from '@/pages/About';
import Pricing from '@/pages/Pricing';
import Subscription from '@/pages/Subscription';
import SubscriptionSuccess from '@/pages/SubscriptionSuccess';
import Admin from '@/pages/Admin';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profil" element={<Profile />} />
            <Route path="/artistes" element={<ArtistsList />} />
            <Route path="/artistes/recherche" element={<ArtistSearch />} />
            <Route path="/artistes/:id" element={<ArtistProfile />} />
            <Route path="/evenements" element={<Events />} />
            <Route path="/evenements/:id" element={<EventDetail />} />
            <Route path="/castings" element={<Castings />} />
            <Route path="/castings/nouveau" element={<CreateCasting />} />
            <Route path="/castings/:id" element={<CastingDetail />} />
            <Route path="/castings/:id/postuler" element={<CastingApplication />} />
            <Route path="/mes-candidatures" element={<MyApplications />} />
            <Route path="/applications-professionnelles" element={<ProfessionalApplications />} />
            <Route path="/profil-professionnel" element={<ProfessionalProfile />} />
            <Route path="/a-propos" element={<About />} />
            <Route path="/tarifs" element={<Pricing />} />
            <Route path="/abonnement" element={<Subscription />} />
            <Route path="/abonnement/succes" element={<SubscriptionSuccess />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/messages-professionnels" element={<ProfessionalMessages />} />
            <Route path="/mes-evenements" element={<ProfessionalEvents />} />
            <Route path="/evenements/nouveau" element={<CreateEvent />} />
            <Route path="/mes-evenements/:id/modifier" element={<EditEvent />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
