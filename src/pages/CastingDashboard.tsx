import React from 'react';
import { Navigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import CastingDashboard from '@/components/casting/CastingDashboard';
import { useAuth } from '@/hooks/useAuth';
import { useUserType } from '@/hooks/useUserType';
import { Loader2 } from 'lucide-react';

const CastingDashboardPage = () => {
  const { user, loading } = useAuth();
  const { isProfessional } = useUserType();

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isProfessional) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <CastingDashboard />
      </div>
    </Layout>
  );
};

export default CastingDashboardPage;