import React from 'react';
import { Navigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { useUserRoles } from '@/hooks/useUserRoles';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Shield, Calendar, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const AdminProfile = () => {
  const { user, loading: authLoading } = useAuth();
  const { userRoles, isLoading: rolesLoading } = useUserRoles();

  if (authLoading || rolesLoading) {
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

  const isAdmin = userRoles?.some(role => role.role === 'admin');

  if (!isAdmin) {
    return <Navigate to="/profil" replace />;
  }

  const adminRole = userRoles?.find(role => role.role === 'admin');

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Profil Administrateur</h1>
          <p className="text-muted-foreground">
            Gestion de votre compte administrateur sur Lyrisphere
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Informations principales */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informations du compte
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Adresse email
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    ID utilisateur
                  </label>
                  <p className="text-sm font-mono bg-muted p-2 rounded mt-1">
                    {user.id}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Date de création
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Email confirmé
                  </label>
                  <div className="mt-1">
                    <Badge variant={user.email_confirmed_at ? "default" : "destructive"}>
                      {user.email_confirmed_at ? "Confirmé" : "Non confirmé"}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Métadonnées utilisateur
                </label>
                <pre className="text-xs bg-muted p-3 rounded overflow-auto">
                  {JSON.stringify(user.user_metadata, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Rôles et permissions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Rôles & Permissions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Rôles attribués
                </label>
                <div className="mt-2 space-y-2">
                  {userRoles?.map((role) => (
                    <Badge key={role.id} variant="outline" className="block w-fit">
                      {role.role}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {adminRole && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Admin depuis
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {new Date(adminRole.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
              )}
              
              <Separator />
              
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Permissions administrateur</h4>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li>• Gestion des utilisateurs</li>
                  <li>• Modération du contenu</li>
                  <li>• Configuration système</li>
                  <li>• Accès aux analytics</li>
                  <li>• Gestion des paiements</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions rapides */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Actions rapides
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button variant="outline" onClick={() => window.open('/admin', '_blank')}>
                Interface d'administration
              </Button>
              <Button variant="outline" onClick={() => window.open('/change-password')}>
                Changer le mot de passe
              </Button>
              <Button variant="outline" onClick={() => window.open('/facturation')}>
                Facturation
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminProfile;