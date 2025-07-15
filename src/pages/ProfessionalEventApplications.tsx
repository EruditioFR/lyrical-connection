
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { useProfessionalEvents, useEventApplications } from '@/hooks/useEvents';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, BarChart3, Globe, Calendar } from 'lucide-react';

const ProfessionalEventApplications = () => {
  const { user, loading } = useAuth();
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const { data: events = [], isLoading: eventsLoading } = useProfessionalEvents();
  const { data: applications = [], isLoading: applicationsLoading } = useEventApplications(selectedEvent);

  if (loading) {
    return <Layout><div className="container mx-auto px-4 py-20 text-center">Chargement...</div></Layout>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Calculer les statistiques basées sur les profils artistes
  const getStatistics = () => {
    if (!applications.length) return null;

    // Note: Pour les statistiques détaillées, nous aurions besoin d'enrichir les données d'application
    // avec les informations des profils artistes. Pour l'instant, nous utilisons les données disponibles.
    
    const statusStats = applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Statistiques simulées basées sur les noms (à remplacer par de vraies données de profil)
    const experienceStats = applications.reduce((acc, app) => {
      const level = app.experience_level || 'Non spécifié';
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { statusStats, experienceStats };
  };

  const statistics = getStatistics();

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'En attente', variant: 'secondary' as const },
      accepted: { label: 'Accepté', variant: 'default' as const },
      rejected: { label: 'Refusé', variant: 'destructive' as const },
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return config ? <Badge variant={config.variant}>{config.label}</Badge> : null;
  };

  const getEventTypeLabel = (type: string) => {
    const types = {
      masterclass: 'Masterclass',
      stage: 'Stage',
      concours: 'Concours',
      atelier: 'Atelier',
      conference: 'Conférence'
    };
    return types[type as keyof typeof types] || type;
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Candidatures aux Événements</h1>
          <p className="text-gray-600 mt-2">
            Analysez les inscriptions reçues pour vos événements avec des statistiques détaillées
          </p>
        </div>

        <div className="mb-6">
          <Select value={selectedEvent} onValueChange={setSelectedEvent}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="Sélectionnez un événement" />
            </SelectTrigger>
            <SelectContent>
              {events.map((event) => (
                <SelectItem key={event.id} value={event.id}>
                  {event.title} - {getEventTypeLabel(event.event_type)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedEvent && (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="participants">Participants</TabsTrigger>
              <TabsTrigger value="statistics">Statistiques</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total inscriptions</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{applications.length}</div>
                  </CardContent>
                </Card>
                
                {statistics && Object.entries(statistics.statusStats).map(([status, count]) => (
                  <Card key={status}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        {status === 'pending' ? 'En attente' : 
                         status === 'accepted' ? 'Acceptés' : 'Refusés'}
                      </CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{count}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="participants">
              <div className="space-y-4">
                {applications.map((application) => (
                  <Card key={application.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {application.user_profiles?.first_name} {application.user_profiles?.last_name}
                          </CardTitle>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                            <span>
                              Inscrit le {new Date(application.created_at).toLocaleDateString('fr-FR')}
                            </span>
                            {application.experience_level && (
                              <span>Niveau: {application.experience_level}</span>
                            )}
                          </div>
                        </div>
                        {getStatusBadge(application.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {application.motivation && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <h4 className="font-medium mb-2">Motivation</h4>
                            <p className="text-sm text-gray-700">{application.motivation}</p>
                          </div>
                        )}
                        
                        {application.special_requirements && (
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <h4 className="font-medium mb-2">Exigences particulières</h4>
                            <p className="text-sm text-blue-700">{application.special_requirements}</p>
                          </div>
                        )}

                        {application.professional_notes && (
                          <div className="bg-yellow-50 p-3 rounded-lg">
                            <h4 className="font-medium mb-2">Notes professionnelles</h4>
                            <p className="text-sm text-yellow-700">{application.professional_notes}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="statistics">
              {statistics && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Statut des inscriptions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(statistics.statusStats).map(([status, count]) => (
                          <div key={status} className="flex justify-between">
                            <span>
                              {status === 'pending' ? 'En attente' : 
                               status === 'accepted' ? 'Acceptées' : 'Refusées'}
                            </span>
                            <span className="font-bold">{count}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Niveau d'expérience
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(statistics.experienceStats).map(([level, count]) => (
                          <div key={level} className="flex justify-between">
                            <span>{level}</span>
                            <span className="font-bold">{count}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Évolution des inscriptions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-gray-500">
                        Graphique d'évolution à venir
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        Taux de participation
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Inscriptions totales</span>
                          <span className="font-bold">{applications.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Taux d'acceptation</span>
                          <span className="font-bold">
                            {applications.length > 0 
                              ? Math.round((statistics.statusStats.accepted || 0) / applications.length * 100)
                              : 0}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

        {!selectedEvent && (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Sélectionnez un événement
              </h3>
              <p className="text-gray-600">
                Choisissez un événement dans la liste pour voir les inscriptions et statistiques
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default ProfessionalEventApplications;
