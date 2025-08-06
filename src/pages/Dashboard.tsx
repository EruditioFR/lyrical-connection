
import Layout from '@/components/layout/Layout';
import ProfessionalDashboard from '@/components/dashboard/ProfessionalDashboard';
import AnalyticsDashboard from '@/components/dashboard/AnalyticsDashboard';
import { useAuth } from '@/hooks/useAuth';
import { useUserType } from '@/hooks/useUserType';
import { Card, CardContent } from '@/components/ui/card';

const Dashboard = () => {
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
    userTypeLoading 
  });

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

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {isProfessional ? (
          <ProfessionalDashboard />
        ) : isArtist ? (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold">Tableau de bord artiste</h1>
              <p className="text-muted-foreground">
                Bienvenue, {artistProfile?.stage_name || 'Artiste'}
              </p>
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
