
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import AuthenticatedHome from '@/components/home/AuthenticatedHome';
import HeroModern from '@/components/home/HeroModern';
import UserTypeSelector from '@/components/home/UserTypeSelector';
import FeaturesArtists from '@/components/home/FeaturesArtists';
import FeaturesProfessionals from '@/components/home/FeaturesProfessionals';
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
  const [selectedUserType, setSelectedUserType] = useState<'artist' | 'professional' | null>(null);

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
      <UserTypeSelector 
        selectedType={selectedUserType}
        onSelectType={setSelectedUserType}
        onBack={() => setSelectedUserType(null)}
      />
      
      {selectedUserType === 'artist' && (
        <>
          <FeaturesArtists />
          <FeaturedArtists />
          <UpcomingEvents />
          <PricingSection />
          <TestimonialsSection />
          <CtaSection />
        </>
      )}
      
      {selectedUserType === 'professional' && (
        <>
          <FeaturesProfessionals />
          <FeaturedEvents />
          <PricingSection />
          <TestimonialsSection />
          <CtaSection />
        </>
      )}
      
      {!selectedUserType && (
        <>
          <FeaturedArtists />
          <FeaturedEvents />
          <UpcomingEvents />
          <PortalsSection />
          <TestimonialsSection />
        </>
      )}
    </Layout>
  );
};

export default Index;
