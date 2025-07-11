
import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import VerificationPanel from '@/components/admin/VerificationPanel';
import FreeAccountsPanel from '@/components/admin/FreeAccountsPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Users, 
  FileCheck, 
  Settings, 
  BarChart3,
  AlertTriangle,
  UserPlus,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useAdminStats } from '@/hooks/useAdminStats';
import NationalityStatsCard from '@/components/admin/NationalityStatsCard';
import GenderStatsCard from '@/components/admin/GenderStatsCard';
import VoiceTypeStatsCard from '@/components/admin/VoiceTypeStatsCard';
import AgeStatsCard from '@/components/admin/AgeStatsCard';

const Admin = () => {
  const { user } = useAuth();
  const { isAdmin, isLoading: rolesLoading, refreshRoles } = useUserRoles();
  const { data: stats, isLoading: statsLoading } = useAdminStats();

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="flex items-center justify-center h-64">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">Connexion requise</h2>
                <p className="text-muted-foreground">
                  Vous devez être connecté pour accéder à l'administration
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (rolesLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="flex items-center justify-center h-64">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">Vérification des permissions...</h2>
                <p className="text-muted-foreground">
                  Vérification de vos droits d'accès
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="flex items-center justify-center h-64">
              <div className="text-center">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
                <h2 className="text-xl font-semibold mb-2">Accès non autorisé</h2>
                <p className="text-muted-foreground">
                  Vous n'avez pas les permissions nécessaires pour accéder à cette page
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
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">Administration</h1>
                <Badge variant="default" className="bg-green-600">
                  Administrateur
                </Badge>
              </div>
              <p className="text-muted-foreground">
                Panneau d'administration de la plateforme
              </p>
            </div>
            {/* Bouton de debug pour rafraîchir les rôles */}
            <Button 
              variant="outline"
              size="sm"
              onClick={refreshRoles}
              className="gap-2"
            >
              <Settings className="h-4 w-4" />
              Rafraîchir les rôles
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Utilisateurs actifs</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? '...' : stats?.totalActiveUsers || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {statsLoading ? '' : stats?.userGrowthPercentage ? 
                    `${stats.userGrowthPercentage > 0 ? '+' : ''}${stats.userGrowthPercentage}% ce mois-ci` : 
                    'Aucune donnée historique'
                  }
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Vérifications en attente</CardTitle>
                <FileCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? '...' : stats?.pendingVerifications || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Demandes à traiter
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Castings actifs</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? '...' : stats?.activeCastings || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {statsLoading ? '' : stats?.castingGrowthPercentage ? 
                    `${stats.castingGrowthPercentage > 0 ? '+' : ''}${stats.castingGrowthPercentage}% cette semaine` : 
                    'Aucune donnée historique'
                  }
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Événements publiés</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? '...' : stats?.publishedEvents || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Événements actifs
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Statistiques démographiques principales */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <NationalityStatsCard 
              nationalityStats={stats?.nationalityStats || []} 
              isLoading={statsLoading}
            />
            
            <GenderStatsCard 
              genderDistribution={stats?.genderDistribution || []} 
              isLoading={statsLoading}
            />
            
            <VoiceTypeStatsCard 
              voiceTypeDistribution={stats?.voiceTypeDistribution || []}
              voiceTypeByGender={stats?.voiceTypeByGender || {}}
              isLoading={statsLoading}
            />
            
            <AgeStatsCard 
              ageDistribution={stats?.ageDistribution || []}
              isLoading={statsLoading}
            />
          </div>

          {/* Statistiques supplémentaires */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Candidatures récentes</CardTitle>
                <UserPlus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? '...' : stats?.recentApplications || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Derniers 30 jours
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Messages en attente</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? '...' : stats?.pendingContacts || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Contacts non traités
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Admin Content */}
          <Tabs defaultValue="verification" className="space-y-4">
            <TabsList>
              <TabsTrigger value="verification">Vérifications</TabsTrigger>
              <TabsTrigger value="free-accounts">Comptes gratuits</TabsTrigger>
              <TabsTrigger value="users">Utilisateurs</TabsTrigger>
              <TabsTrigger value="professionals">Professionnels</TabsTrigger>
              <TabsTrigger value="content">Contenu</TabsTrigger>
              <TabsTrigger value="settings">Paramètres</TabsTrigger>
            </TabsList>

            <TabsContent value="verification">
              <VerificationPanel />
            </TabsContent>

            <TabsContent value="free-accounts">
              <FreeAccountsPanel />
            </TabsContent>

            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>Gestion des utilisateurs</CardTitle>
                  <CardDescription>
                    Gérez les comptes utilisateurs et leurs permissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Fonctionnalité en cours de développement</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="professionals">
              <Card>
                <CardHeader>
                  <CardTitle>Gestion des profils professionnels</CardTitle>
                  <CardDescription>
                    Visualisez et gérez les profils professionnels de la plateforme
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Fonctionnalité en cours de développement</p>
                    <p className="text-sm mt-2">
                      Les profils professionnels peuvent maintenant être créés correctement
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="content">
              <Card>
                <CardHeader>
                  <CardTitle>Modération du contenu</CardTitle>
                  <CardDescription>
                    Examinez et modérez les contenus signalés
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <FileCheck className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Fonctionnalité en cours de développement</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Paramètres système</CardTitle>
                  <CardDescription>
                    Configurez les paramètres globaux de la plateforme
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Settings className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Fonctionnalité en cours de développement</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Admin;
