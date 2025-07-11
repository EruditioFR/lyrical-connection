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
  UserPlus
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRoles } from '@/hooks/useUserRoles';

const Admin = () => {
  const { user } = useAuth();
  const { isAdmin, isLoading: rolesLoading, refreshRoles } = useUserRoles();

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
                <div className="text-2xl font-bold">1,234</div>
                <p className="text-xs text-muted-foreground">
                  +12% ce mois-ci
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Vérifications en attente</CardTitle>
                <FileCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">23</div>
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
                <div className="text-2xl font-bold">456</div>
                <p className="text-xs text-muted-foreground">
                  +7% cette semaine
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Signalements</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
                <p className="text-xs text-muted-foreground">
                  À examiner
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
