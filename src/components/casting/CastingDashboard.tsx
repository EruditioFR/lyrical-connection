import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CastingApiSettings } from './CastingApiSettings';
import CustomCriteriaManager from './CustomCriteriaManager';
import { CastingAnalytics } from './CastingAnalytics';
import { WebhookDeliveries } from './WebhookDeliveries';
import { Settings, Target, BarChart3, Webhook } from 'lucide-react';
import { useProfessionalProfile } from '@/hooks/useProfessionalProfile';

const CastingDashboard = () => {
  const { profile: professionalProfile } = useProfessionalProfile();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Tableau de bord Casting</h1>
        <p className="text-muted-foreground mt-2">
          Gérez vos critères de notation, API et intégrations casting
        </p>
      </div>

      <Tabs defaultValue="criteria" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="criteria" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Critères
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            API & Clés
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytiques
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="flex items-center gap-2">
            <Webhook className="h-4 w-4" />
            Webhooks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuration API</CardTitle>
              <CardDescription>
                Gérez vos clés API et paramètres d'intégration pour les casting multi-locataires
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CastingApiSettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="criteria" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Critères de notation</CardTitle>
              <CardDescription>
                Créez et gérez vos critères personnalisés pour évaluer les candidats (note de 1 à 20)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {professionalProfile && (
                <CustomCriteriaManager professionalProfileId={professionalProfile.id} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytiques Casting</CardTitle>
              <CardDescription>
                Visualisez les performances et statistiques de vos processus de casting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CastingAnalytics />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Livraisons Webhook</CardTitle>
              <CardDescription>
                Surveillez et gérez les notifications webhook de vos intégrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WebhookDeliveries />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CastingDashboard;