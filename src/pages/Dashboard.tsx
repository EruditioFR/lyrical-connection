
import Layout from '@/components/layout/Layout';
import ProfessionalDashboard from '@/components/dashboard/ProfessionalDashboard';
import AnalyticsDashboard from '@/components/dashboard/AnalyticsDashboard';
import SumiJoBanner from '@/components/dashboard/SumiJoBanner';
import { useAuth } from '@/hooks/useAuth';
import { useUserType } from '@/hooks/useUserType';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Eyebrow } from '@/components/editorial/Editorial';

const Dashboard = () => {
  // All hooks called unconditionally at the top
  const { user, loading } = useAuth();
  const { 
    userType, 
    isProfessional, 
    isArtist, 
    isLoading: userTypeLoading, 
    artistProfile, 
    professionalProfile 
  } = useUserType();


  // Handle loading state
  if (loading || userTypeLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <p>Chargement du tableau de bord...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Handle unauthenticated user
  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-xl py-16">
            <h1 className="text-3xl font-serif mb-2">Connexion requise</h1>
            <p className="text-muted-foreground mb-6">Connectez-vous pour accéder à votre tableau de bord.</p>
            <Button asChild><Link to="/auth">Se connecter</Link></Button>
          </div>
        </div>
      </Layout>
    );
  }

  // Handle authenticated user with profile
  return (
    <Layout>
      <div className="container mx-auto px-4 md:px-6 py-12">
        {isProfessional ? (
          <ProfessionalDashboard />
        ) : isArtist ? (
          <div className="space-y-8">
            {/* Sumi Jo Banner */}
            <SumiJoBanner artistProfileId={artistProfile?.id} />
            
            <header>
              <Eyebrow className="mb-3">Tableau de bord</Eyebrow>
              <h1 className="text-3xl md:text-4xl font-serif">{artistProfile?.stage_name || 'Votre profil'}</h1>
              <p className="mt-2 text-muted-foreground">Qui consulte votre profil, et quand.</p>
            </header>
            <AnalyticsDashboard profileType="artist" />
          </div>
        ) : (
          <div className="max-w-xl py-16">
            <h1 className="text-3xl font-serif mb-2">Profil à compléter</h1>
            <p className="text-muted-foreground mb-6">Complétez votre profil pour accéder à votre tableau de bord.</p>
            <Button asChild><Link to="/profil">Compléter mon profil</Link></Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
