
import Layout from '@/components/layout/Layout';
import ProfessionalDashboard from '@/components/dashboard/ProfessionalDashboard';
import AnalyticsDashboard from '@/components/dashboard/AnalyticsDashboard';
import SumiJoBanner from '@/components/dashboard/SumiJoBanner';
import { useAuth } from '@/hooks/useAuth';
import { useUserType } from '@/hooks/useUserType';
import { Card, CardContent } from '@/components/ui/card';
import operaDashboardHero from '@/assets/opera-dashboard-hero.jpg';

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

  console.log('Dashboard - User state:', { 
    user: user?.email, 
    loading, 
    userType, 
    isProfessional, 
    isArtist, 
    userTypeLoading,
    hasArtistProfile: !!artistProfile,
    hasProfessionalProfile: !!professionalProfile
  });

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
          <Card>
            <CardContent className="flex items-center justify-center h-64">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">Connexion requise</h2>
                <p className="text-muted-foreground">
                  Vous devez être connecté pour accéder au tableau de bord
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // Handle authenticated user with profile
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {isProfessional ? (
          <ProfessionalDashboard />
        ) : isArtist ? (
          <div className="space-y-6">
            {/* Sumi Jo Banner */}
            <SumiJoBanner artistProfileId={artistProfile?.id} />
            
            {/* Hero Banner pour artiste */}
            <div 
              className="relative h-48 md:h-64 rounded-2xl overflow-hidden bg-gradient-to-r from-lyrical-900 to-gold-900"
              style={{
                backgroundImage: `url(${operaDashboardHero})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
              <div className="relative h-full flex items-center justify-center text-center px-6">
                <div className="text-white">
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold mb-2">
                    Tableau de Bord Artiste
                  </h1>
                  <p className="text-white/90 text-lg">
                    Bienvenue, {artistProfile?.stage_name || 'Artiste'}
                  </p>
                </div>
              </div>
            </div>
            <AnalyticsDashboard profileType="artist" />
          </div>
        ) : (
          <Card>
            <CardContent className="flex items-center justify-center h-64">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">Profil requis</h2>
                <p className="text-muted-foreground">
                  Vous devez compléter votre profil pour accéder au tableau de bord
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
