
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthGuard } from '@/components/auth/AuthGuard';

// Import pages
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
import LegalNotice from '@/pages/LegalNotice';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import TermsOfService from '@/pages/TermsOfService';
import CookiesPolicy from '@/pages/CookiesPolicy';
import FAQ from '@/pages/FAQ';
import Notifications from '@/pages/Notifications';
import ProfessionalsList from '@/pages/ProfessionalsList';
import ProfessionalDetail from '@/pages/ProfessionalDetail';
import Contact from '@/pages/Contact';
import ProfessionalCastingApplications from '@/pages/ProfessionalCastingApplications';
import ProfessionalEventApplications from '@/pages/ProfessionalEventApplications';
import ReceivedApplications from '@/pages/ReceivedApplications';
import Blog from '@/pages/Blog';
import BlogPost from '@/pages/BlogPost';

export const AppRouter = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/about" element={<About />} />
      <Route path="/qui-sommes-nous" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/mentions-legales" element={<LegalNotice />} />
      <Route path="/politique-confidentialite" element={<PrivacyPolicy />} />
      <Route path="/cgu" element={<TermsOfService />} />
      <Route path="/cookies" element={<CookiesPolicy />} />
      <Route path="/faq" element={<FAQ />} />
      
      {/* Castings route - accessible publiquement pour afficher la page marketing */}
      <Route path="/castings" element={<Castings />} />
      <Route path="/evenements" element={<Events />} />
      <Route path="/artistes" element={<ArtistsList />} />
      <Route path="/professionnels" element={<ProfessionalsList />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/blog/:slug" element={<BlogPost />} />
      
      {/* Protected routes */}
      <Route path="/dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />
      <Route path="/profil" element={<AuthGuard><Profile /></AuthGuard>} />
      <Route path="/professional-profile" element={<AuthGuard><ProfessionalProfile /></AuthGuard>} />
      <Route path="/artistes/:id" element={<AuthGuard><ArtistProfile /></AuthGuard>} />
      <Route path="/professionnel/:id" element={<AuthGuard><ProfessionalProfile /></AuthGuard>} />
      
      {/* Protected casting routes */}
      <Route path="/castings/nouveau" element={<AuthGuard><CreateCasting /></AuthGuard>} />
      <Route path="/castings/:id" element={<AuthGuard><CastingDetail /></AuthGuard>} />
      <Route path="/castings/:id/postuler" element={<AuthGuard><CastingApplication /></AuthGuard>} />
      <Route path="/mes-candidatures" element={<AuthGuard><MyApplications /></AuthGuard>} />
      <Route path="/candidatures-reçues" element={<AuthGuard><ReceivedApplications /></AuthGuard>} />
      <Route path="/professional/castings/:castingId/applications" element={<AuthGuard><ProfessionalApplications /></AuthGuard>} />
      <Route path="/professional/casting-applications" element={<AuthGuard><ProfessionalCastingApplications /></AuthGuard>} />
      
      {/* Protected event routes */}
      <Route path="/evenements/nouveau" element={<AuthGuard><CreateEvent /></AuthGuard>} />
      <Route path="/evenements/:id" element={<AuthGuard><EventDetail /></AuthGuard>} />
      <Route path="/evenements/:id/modifier" element={<AuthGuard><EditEvent /></AuthGuard>} />
      <Route path="/mes-evenements" element={<AuthGuard><ProfessionalEvents /></AuthGuard>} />
      <Route path="/professional/event-applications" element={<AuthGuard><ProfessionalEventApplications /></AuthGuard>} />
      
      {/* Protected artist routes */}
      <Route path="/recherche-artistes" element={<AuthGuard><ArtistSearch /></AuthGuard>} />
      
      {/* Protected professional routes */}
      <Route path="/professionnels/:id" element={<AuthGuard><ProfessionalDetail /></AuthGuard>} />
      
      {/* Protected messaging routes */}
      <Route path="/messages" element={<AuthGuard><Messages /></AuthGuard>} />
      <Route path="/professional/messages" element={<AuthGuard><ProfessionalMessages /></AuthGuard>} />
      
      {/* Other routes */}
      <Route path="/notifications" element={<AuthGuard><Notifications /></AuthGuard>} />
      <Route path="/subscription" element={<AuthGuard><Subscription /></AuthGuard>} />
      <Route path="/subscription/success" element={<AuthGuard><SubscriptionSuccess /></AuthGuard>} />
      <Route path="/change-password" element={<AuthGuard><ChangePassword /></AuthGuard>} />
      <Route path="/admin" element={<AuthGuard><Admin /></AuthGuard>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
