
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import AuthenticatedHome from '@/components/home/AuthenticatedHome';
import HeroModern from '@/components/home/HeroModern';
import FeaturesDetailed from '@/components/home/FeaturesDetailed';
import FeaturedArtists from '@/components/home/FeaturedArtists';
import FeaturedEvents from '@/components/home/FeaturedEvents';
import UpcomingEvents from '@/components/home/UpcomingEvents';
import PricingSection from '@/components/home/PricingSection';
import PortalsSection from '@/components/home/PortalsSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import CtaSection from '@/components/home/CtaSection';
import Layout from '@/components/layout/Layout';

const Index = () => {
  const { user, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <p>Chargement...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // If user is authenticated, show dashboard-style home
  if (user) {
    return <AuthenticatedHome />;
  }

  // If not authenticated, show marketing home page
  return (
    <Layout>
      <HeroModern />
      <FeaturesDetailed />
      <FeaturedArtists />
      <FeaturedEvents />
      <UpcomingEvents />
      <PricingSection />
      <PortalsSection />
      <TestimonialsSection />
      <CtaSection />
    </Layout>
  );
};

export default Index;
