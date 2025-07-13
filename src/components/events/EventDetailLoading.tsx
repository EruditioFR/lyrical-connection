
import React from 'react';
import Layout from '@/components/layout/Layout';

const EventDetailLoading: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-20 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    </Layout>
  );
};

export default EventDetailLoading;
