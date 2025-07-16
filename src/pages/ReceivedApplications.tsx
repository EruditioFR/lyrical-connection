import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Eye, Filter, Briefcase } from 'lucide-react';
import { useMyCastings } from '@/hooks/useCastings';
import { useProfessionalEvents } from '@/hooks/useEvents';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';

const ReceivedApplications = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  
  const { castings, isLoading: castingsLoading } = useMyCastings();
  const { data: events, isLoading: eventsLoading } = useProfessionalEvents();

  // Pour une version simplifiée, nous affichons simplement les castings et événements
  const totalCastings = castings?.length || 0;
  const totalEvents = events?.length || 0;

  if (castingsLoading || eventsLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Candidatures Reçues</h1>
          <p className="text-gray-600 mt-2">
            Gérez toutes les candidatures reçues pour vos castings et événements
          </p>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mes Castings</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCastings}</div>
              <p className="text-xs text-muted-foreground">
                casting(s) créé(s)
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mes Événements</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEvents}</div>
              <p className="text-xs text-muted-foreground">
                événement(s) créé(s)
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCastings + totalEvents}</div>
              <p className="text-xs text-muted-foreground">
                opportunités actives
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">
              Toutes ({totalCastings + totalEvents})
            </TabsTrigger>
            <TabsTrigger value="castings">
              Castings ({totalCastings})
            </TabsTrigger>
            <TabsTrigger value="events">
              Événements ({totalEvents})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="grid gap-4">
              {/* Castings */}
              {castings?.map((casting) => (
                <Card key={`casting-${casting.id}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">Casting</Badge>
                          {casting.results_published && (
                            <Badge variant="secondary">Résultats publiés</Badge>
                          )}
                        </div>
                        <h3 className="font-semibold text-lg">{casting.title}</h3>
                        <p className="text-sm text-gray-600">
                          {casting.production_type} • {casting.location}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Créé le {new Date(casting.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/professional/castings/${casting.id}/applications`}>
                            <Eye className="h-4 w-4 mr-1" />
                            Voir candidatures
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Événements */}
              {events?.map((event) => (
                <Card key={`event-${event.id}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">Événement</Badge>
                          {event.results_published && (
                            <Badge variant="secondary">Résultats publiés</Badge>
                          )}
                        </div>
                        <h3 className="font-semibold text-lg">{event.title}</h3>
                        <p className="text-sm text-gray-600">
                          {event.event_type} • {event.location}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Du {new Date(event.start_date).toLocaleDateString('fr-FR')} au {new Date(event.end_date).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/professional/event-applications?eventId=${event.id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            Voir candidatures
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {totalCastings === 0 && totalEvents === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun casting ni événement</h3>
                <p className="text-gray-600">
                  Vous n'avez créé aucun casting ou événement pour le moment.
                </p>
                <div className="flex gap-4 justify-center mt-4">
                  <Button asChild>
                    <Link to="/castings/nouveau">
                      Créer un casting
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/evenements/nouveau">
                      Créer un événement
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="castings" className="space-y-4">
            <div className="flex justify-end mb-4">
              <Button asChild>
                <Link to="/professional/casting-applications">
                  Gestion avancée des castings
                </Link>
              </Button>
            </div>
            
            <div className="grid gap-4">
              {castings?.map((casting) => (
                <Card key={casting.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">Casting</Badge>
                          {casting.results_published && (
                            <Badge variant="secondary">Résultats publiés</Badge>
                          )}
                        </div>
                        <h3 className="font-semibold text-lg">{casting.title}</h3>
                        <p className="text-sm text-gray-600">
                          {casting.production_type} • {casting.location}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Créé le {new Date(casting.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/professional/castings/${casting.id}/applications`}>
                            <Eye className="h-4 w-4 mr-1" />
                            Voir candidatures
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {!castings?.length && (
              <div className="text-center py-12">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun casting</h3>
                <p className="text-gray-600">
                  Vous n'avez créé aucun casting pour le moment.
                </p>
                <Button asChild className="mt-4">
                  <Link to="/castings/nouveau">
                    Créer un casting
                  </Link>
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="events" className="space-y-4">
            <div className="flex justify-end mb-4">
              <Button asChild>
                <Link to="/professional/event-applications">
                  Gestion avancée des événements
                </Link>
              </Button>
            </div>
            
            <div className="grid gap-4">
              {events?.map((event) => (
                <Card key={event.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">Événement</Badge>
                          {event.results_published && (
                            <Badge variant="secondary">Résultats publiés</Badge>
                          )}
                        </div>
                        <h3 className="font-semibold text-lg">{event.title}</h3>
                        <p className="text-sm text-gray-600">
                          {event.event_type} • {event.location}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Du {new Date(event.start_date).toLocaleDateString('fr-FR')} au {new Date(event.end_date).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/professional/event-applications?eventId=${event.id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            Voir candidatures
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {!events?.length && (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun événement</h3>
                <p className="text-gray-600">
                  Vous n'avez créé aucun événement pour le moment.
                </p>
                <Button asChild className="mt-4">
                  <Link to="/evenements/nouveau">
                    Créer un événement
                  </Link>
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ReceivedApplications;