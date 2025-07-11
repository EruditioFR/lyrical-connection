
import React from 'react';
import { Navigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import ArtistProfileForm from '@/components/profile/ArtistProfileForm';
import { useAuth } from '@/hooks/useAuth';
import { useUserType } from '@/hooks/useUserType';
import { Loader2 } from 'lucide-react';

const Profile = () => {
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

  // Rediriger les professionnels vers la page de profil professionnel
  if (isProfessional) {
    return <Navigate to="/profil-professionnel" replace />;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-20">
        <ArtistProfileForm />
      </div>
    </Layout>
  );
};

export default Profile;
