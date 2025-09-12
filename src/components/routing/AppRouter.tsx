
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { SubscriptionGuard } from '@/components/auth/SubscriptionGuard';

// Import pages
import Index from '@/pages/Index';
import Features from '@/pages/Features';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import Profile from '@/pages/Profile';
import ArtistProfile from '@/pages/ArtistProfile';
import ProfessionalProfile from '@/pages/ProfessionalProfile';
import Castings from '@/pages/Castings';
import CreateCasting from '@/pages/CreateCasting';
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
import SubscriptionError from '@/pages/SubscriptionError';
import ChangePassword from '@/pages/ChangePassword';
import ResetPassword from '@/pages/ResetPassword';
import About from '@/pages/About';
import Admin from '@/pages/Admin';
import AdminProfile from '@/pages/AdminProfile';
import NotFound from '@/pages/NotFound';
import LegalNotice from '@/pages/LegalNotice';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import TermsOfService from '@/pages/TermsOfService';
import CookiesPolicy from '@/pages/CookiesPolicy';
import FAQ from '@/pages/FAQ';
import Notifications from '@/pages/Notifications';
import Invitation from '@/pages/Invitation';
import ProfessionalsList from '@/pages/ProfessionalsList';
import ProfessionalDetail from '@/pages/ProfessionalDetail';
import Contact from '@/pages/Contact';
import ProfessionalCastingApplications from '@/pages/ProfessionalCastingApplications';
import ProfessionalEventApplications from '@/pages/ProfessionalEventApplications';
import ReceivedApplications from '@/pages/ReceivedApplications';
import Blog from '@/pages/Blog';
import BlogPost from '@/pages/BlogPost';
import CastingDetail from '@/pages/CastingDetail';
import Billing from '@/pages/Billing';

export const AppRouter = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Index />} />
      <Route path="/features" element={<Features />} />
      <Route path="/fonctionnalites" element={<Features />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/reset-password" element={<ResetPassword />} />
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
      <Route path="/blog" element={<Blog />} />
      <Route path="/blog/:slug" element={<BlogPost />} />
      <Route path="/professionnels" element={<ProfessionalsList />} />
      
      {/* Protected routes with subscription required */}
      <Route path="/dashboard" element={<AuthGuard><SubscriptionGuard><Dashboard /></SubscriptionGuard></AuthGuard>} />
      <Route path="/profil" element={<AuthGuard><SubscriptionGuard><Profile /></SubscriptionGuard></AuthGuard>} />
      <Route path="/professional-profile" element={<AuthGuard><SubscriptionGuard><ProfessionalProfile /></SubscriptionGuard></AuthGuard>} />
      <Route path="/profil-professionnel" element={<AuthGuard><SubscriptionGuard><ProfessionalProfile /></SubscriptionGuard></AuthGuard>} />
      <Route path="/artistes/:id" element={<AuthGuard><SubscriptionGuard><ArtistProfile /></SubscriptionGuard></AuthGuard>} />
      <Route path="/professionnel/:id" element={<AuthGuard><SubscriptionGuard><ProfessionalProfile /></SubscriptionGuard></AuthGuard>} />
      
      {/* Protected casting routes with subscription required */}
      <Route path="/castings/nouveau" element={<AuthGuard><SubscriptionGuard><CreateCasting /></SubscriptionGuard></AuthGuard>} />
      <Route path="/castings/:id" element={<AuthGuard><SubscriptionGuard><CastingDetail /></SubscriptionGuard></AuthGuard>} />
      <Route path="/castings/:id/postuler" element={<AuthGuard><SubscriptionGuard><CastingApplication /></SubscriptionGuard></AuthGuard>} />
      <Route path="/mes-candidatures" element={<AuthGuard><SubscriptionGuard><MyApplications /></SubscriptionGuard></AuthGuard>} />
      <Route path="/candidatures-reçues" element={<AuthGuard><SubscriptionGuard><ReceivedApplications /></SubscriptionGuard></AuthGuard>} />
      <Route path="/professional/castings/:castingId/applications" element={<AuthGuard><SubscriptionGuard><ProfessionalApplications /></SubscriptionGuard></AuthGuard>} />
      <Route path="/professional/casting-applications" element={<AuthGuard><SubscriptionGuard><ProfessionalCastingApplications /></SubscriptionGuard></AuthGuard>} />
      
      {/* Protected event routes with subscription required */}
      <Route path="/evenements/nouveau" element={<AuthGuard><SubscriptionGuard><CreateEvent /></SubscriptionGuard></AuthGuard>} />
      <Route path="/evenements/:id" element={<AuthGuard><SubscriptionGuard><EventDetail /></SubscriptionGuard></AuthGuard>} />
      <Route path="/evenements/:id/modifier" element={<AuthGuard><SubscriptionGuard><EditEvent /></SubscriptionGuard></AuthGuard>} />
      <Route path="/mes-evenements" element={<AuthGuard><SubscriptionGuard><ProfessionalEvents /></SubscriptionGuard></AuthGuard>} />
      <Route path="/professional/event-applications" element={<AuthGuard><SubscriptionGuard><ProfessionalEventApplications /></SubscriptionGuard></AuthGuard>} />
      
      {/* Protected artist routes with subscription required */}
      <Route path="/recherche-artistes" element={<AuthGuard><SubscriptionGuard><ArtistSearch /></SubscriptionGuard></AuthGuard>} />
      
      {/* Protected professional routes with subscription required */}
      <Route path="/professionnels/:id" element={<AuthGuard><SubscriptionGuard><ProfessionalDetail /></SubscriptionGuard></AuthGuard>} />
      
      {/* Protected messaging routes with subscription required */}
      <Route path="/messages" element={<AuthGuard><SubscriptionGuard><Messages /></SubscriptionGuard></AuthGuard>} />
      <Route path="/professional/messages" element={<AuthGuard><SubscriptionGuard><ProfessionalMessages /></SubscriptionGuard></AuthGuard>} />
      
      {/* Other routes - subscription management doesn't require active subscription */}
      <Route path="/notifications" element={<AuthGuard><SubscriptionGuard><Notifications /></SubscriptionGuard></AuthGuard>} />
      <Route path="/facturation" element={<AuthGuard><Billing /></AuthGuard>} />
      <Route path="/subscription" element={<AuthGuard><Subscription /></AuthGuard>} />
      <Route path="/subscription/success" element={<AuthGuard><SubscriptionSuccess /></AuthGuard>} />
      <Route path="/subscription/error" element={<AuthGuard><SubscriptionError /></AuthGuard>} />
      <Route path="/invitation/:token" element={<Invitation />} />
      <Route path="/change-password" element={<AuthGuard><SubscriptionGuard><ChangePassword /></SubscriptionGuard></AuthGuard>} />
      <Route path="/admin" element={<AuthGuard><Admin /></AuthGuard>} />
      <Route path="/admin-profile" element={<AuthGuard><AdminProfile /></AuthGuard>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
