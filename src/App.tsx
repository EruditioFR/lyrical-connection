import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import ArtistsList from '@/pages/ArtistsList';
import ArtistProfile from '@/pages/ArtistProfile';
import Profile from '@/pages/Profile';
import ProfessionalProfile from '@/pages/ProfessionalProfile';
import Castings from '@/pages/Castings';
import CastingDetail from '@/pages/CastingDetail';
import CreateCasting from '@/pages/CreateCasting';
import CastingApplication from '@/pages/CastingApplication';
import MyApplications from '@/pages/MyApplications';
import ProfessionalApplications from '@/pages/ProfessionalApplications';
import NotFound from '@/pages/NotFound';
import ArtistSearch from '@/pages/ArtistSearch';
import ProfessionalEvents from '@/pages/ProfessionalEvents';
import Pricing from '@/pages/Pricing';
import Subscription from '@/pages/Subscription';
import SubscriptionSuccess from '@/pages/SubscriptionSuccess';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth/sign-in" element={<Auth />} />
          <Route path="/artistes" element={<ArtistsList />} />
          <Route path="/artistes/:id" element={<ArtistProfile />} />
          <Route path="/profil" element={<Profile />} />
          <Route path="/profil-professionnel" element={<ProfessionalProfile />} />
          <Route path="/castings" element={<Castings />} />
          <Route path="/castings/:id" element={<CastingDetail />} />
          <Route path="/castings/nouveau" element={<CreateCasting />} />
          <Route path="/castings/:id/postuler" element={<CastingApplication />} />
          <Route path="/mes-candidatures" element={<MyApplications />} />
          <Route path="/candidatures-reçues" element={<ProfessionalApplications />} />
          <Route path="/recherche-artistes" element={<ArtistSearch />} />
          <Route path="/mes-evenements" element={<ProfessionalEvents />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/subscription" element={<Subscription />} />
          <Route path="/subscription-success" element={<SubscriptionSuccess />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
