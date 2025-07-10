
import React from 'react';
import HeroModern from '@/components/home/HeroModern';
import FeaturesDetailed from '@/components/home/FeaturesDetailed';
import FeaturedArtists from '@/components/home/FeaturedArtists';
import UpcomingEvents from '@/components/home/UpcomingEvents';
import PricingSection from '@/components/home/PricingSection';
import PortalsSection from '@/components/home/PortalsSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import CtaSection from '@/components/home/CtaSection';
import Layout from '@/components/layout/Layout';

const Index = () => {
  return (
    <Layout>
      <HeroModern />
      <FeaturesDetailed />
      <FeaturedArtists />
      <UpcomingEvents />
      <PricingSection />
      <PortalsSection />
      <TestimonialsSection />
      <CtaSection />
    </Layout>
  );
};

export default Index;
