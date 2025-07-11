
import React from 'react';
import { Navigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import ProfessionalProfileForm from '@/components/professional/ProfessionalProfileForm';
import { useAuth } from '@/hooks/useAuth';
import { useUserType } from '@/hooks/useUserType';
import { Loader2 } from 'lucide-react';

const ProfessionalProfile = () => {
  const { user, loading } = useAuth();
  const { isProfessional, isLoading: userTypeLoading } = useUserType();

  if (loading || userTypeLoading) {
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

  // Permettre l'accès aux utilisateurs professionnels
  if (!isProfessional) {
    return <Navigate to="/profil" replace />;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-20">
        <ProfessionalProfileForm />
      </div>
    </Layout>
  );
};

export default ProfessionalProfile;
