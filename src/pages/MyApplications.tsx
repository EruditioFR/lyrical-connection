
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMyApplications } from '@/hooks/useApplications';
import { useArtistApplications } from '@/hooks/useEvents';
import { useAuth } from '@/hooks/useAuth';
import { 
  Calendar, MapPin, Eye, FileText, 
  Clock, CheckCircle, XCircle, AlertCircle,
  Loader2, Music, Mic, Users, Trophy
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MyApplications = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { applications: castingApplications, isLoading: castingLoading } = useMyApplications();
  const { data: eventApplications = [], isLoading: eventLoading } = useArtistApplications();
  const [activeTab, setActiveTab] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'castings', 'events'

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Connexion requise
          </h1>
          <p className="text-gray-600 mb-6">
            Vous devez être connecté pour voir vos candidatures.
          </p>
          <Button onClick={() => navigate('/auth')}>
            Se connecter
          </Button>
        </div>
      </Layout>
    );
  }

  const getStatusBadge = (status: string, resultsPublished: boolean) => {
    // Si les résultats ne sont pas publiés, afficher "En cours"
    if (!resultsPublished) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          En cours
        </Badge>
      );
    }

    // Si les résultats sont publiés, afficher le vrai statut
    const statusConfig = {
      pending: { label: 'En attente', variant: 'secondary' as const, icon: Clock },
      shortlisted: { label: 'Présélectionné', variant: 'default' as const, icon: Eye },
      accepted: { label: 'Accepté', variant: 'default' as const, icon: CheckCircle },
      rejected: { label: 'Refusé', variant: 'destructive' as const, icon: XCircle },
      withdrawn: { label: 'Retiré', variant: 'outline' as const, icon: AlertCircle },
      waitlisted: { label: 'Liste d\'attente', variant: 'secondary' as const, icon: AlertCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;

    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getEventTypeBadge = (eventType: string) => {
    const typeConfig = {
      masterclass: { label: 'Masterclass', icon: Users, color: 'bg-blue-100 text-blue-800' },
      stage: { label: 'Stage', icon: Music, color: 'bg-green-100 text-green-800' },
      concours: { label: 'Concours', icon: Trophy, color: 'bg-yellow-100 text-yellow-800' },
      atelier: { label: 'Atelier', icon: Mic, color: 'bg-purple-100 text-purple-800' },
      conference: { label: 'Conférence', icon: Users, color: 'bg-gray-100 text-gray-800' },
    };

    const config = typeConfig[eventType as keyof typeof typeConfig];
    if (!config) return null;

    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </span>
    );
  };

  console.log('Casting applications:', castingApplications);
  console.log('Event applications:', eventApplications);

  // Combiner et traiter toutes les candidatures
  const allApplications = [
    ...castingApplications.map(app => ({
      ...app,
      type: 'casting' as const,
      title: app.castings?.title || 'Casting sans titre',
      location: app.castings?.location || 'Lieu non précisé',
      applicationDate: app.created_at,
      resultsPublished: app.castings?.results_published || false,
      detailPath: `/castings/${app.casting_id}`,
    })),
    ...eventApplications.map(app => ({
      ...app,
      type: 'event' as const,
      title: (app as any).professional_events?.title || 'Événement sans titre',
      location: (app as any).professional_events?.location || 'Lieu non précisé',
      applicationDate: app.applied_at,
      resultsPublished: (app as any).professional_events?.results_published || false,
      detailPath: `/evenements/${app.event_id}`,
      eventType: (app as any).professional_events?.event_type,
      eventDetails: (app as any).professional_events,
    }))
  ].sort((a, b) => new Date(b.applicationDate).getTime() - new Date(a.applicationDate).getTime());

  // Filtrer par type
  const typeFilteredApplications = allApplications.filter(app => {
    if (typeFilter === 'all') return true;
    if (typeFilter === 'castings') return app.type === 'casting';
    if (typeFilter === 'events') return app.type === 'event';
    return app.type === typeFilter;
  });

  // Filtrer par statut
  const filteredApplications = typeFilteredApplications.filter(app => {
    if (activeTab === 'all') return true;
    return app.status === activeTab;
  });

  const isLoading = castingLoading || eventLoading;

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mes candidatures</h1>
          <p className="text-gray-600 mt-2">
            Suivez l'état de vos candidatures aux castings et inscriptions aux événements
          </p>
        </div>

        {/* Filtres par type */}
        <div className="mb-6">
          <Tabs value={typeFilter} onValueChange={setTypeFilter}>
            <TabsList className="grid w-full grid-cols-3 lg:w-fit">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Toutes ({allApplications.length})
              </TabsTrigger>
              <TabsTrigger value="castings" className="flex items-center gap-2">
                <Music className="h-4 w-4" />
                Castings ({castingApplications.length})
              </TabsTrigger>
              <TabsTrigger value="events" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Événements ({eventApplications.length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Filtres par statut */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="flex flex-wrap">
            <TabsTrigger value="all">
              Toutes ({typeFilteredApplications.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              En attente ({typeFilteredApplications.filter(a => a.status === 'pending').length})
            </TabsTrigger>
            <TabsTrigger value="accepted">
              Acceptées ({typeFilteredApplications.filter(a => a.status === 'accepted').length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Refusées ({typeFilteredApplications.filter(a => a.status === 'rejected').length})
            </TabsTrigger>
            <TabsTrigger value="waitlisted">
              En attente ({typeFilteredApplications.filter(a => a.status === 'waitlisted').length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {filteredApplications.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucune candidature
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {activeTab === 'all' 
                      ? typeFilter === 'all'
                        ? "Vous n'avez pas encore postulé à des castings ou événements."
                        : typeFilter === 'castings'
                        ? "Vous n'avez pas encore postulé à des castings."
                        : "Vous n'êtes pas encore inscrit à des événements."
                      : `Aucune candidature ${activeTab === 'pending' ? 'en attente' : activeTab}.`
                    }
                  </p>
                  <div className="flex gap-3 justify-center">
                    {(typeFilter === 'all' || typeFilter === 'castings') && (
                      <Button onClick={() => navigate('/castings')}>
                        Découvrir les castings
                      </Button>
                    )}
                    {(typeFilter === 'all' || typeFilter === 'events') && (
                      <Button variant="outline" onClick={() => navigate('/evenements')}>
                        Découvrir les événements
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {filteredApplications.map((application) => (
                  <Card key={`${application.type}-${application.id}`} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle className="text-xl">
                              {application.title}
                            </CardTitle>
                            <div className="flex items-center gap-2">
                              {application.type === 'casting' ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                  <Music className="h-3 w-3 mr-1" />
                                  Casting
                                </span>
                              ) : (
                                getEventTypeBadge(application.eventType)
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {application.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Candidature du {new Date(application.applicationDate).toLocaleDateString('fr-FR')}
                            </div>
                          </div>
                        </div>
                        {getStatusBadge(application.status, application.resultsPublished)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Motivation pour les événements ou lettre de motivation pour les castings */}
                        {((application.type === 'casting' && application.cover_letter) || 
                          (application.type === 'event' && application.motivation)) && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">
                              {application.type === 'casting' ? 'Lettre de motivation' : 'Motivation'}
                            </h4>
                            <p className="text-gray-700 text-sm line-clamp-3">
                              {application.type === 'casting' ? application.cover_letter : application.motivation}
                            </p>
                          </div>
                        )}

                        {application.professional_notes && (
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <h4 className="font-medium text-blue-900 mb-2">Notes du professionnel</h4>
                            <p className="text-blue-800 text-sm">
                              {application.professional_notes}
                            </p>
                          </div>
                        )}

                        {/* Audition pour les castings */}
                        {application.type === 'casting' && application.audition_scheduled_at && (
                          <div className="bg-green-50 p-4 rounded-lg">
                            <h4 className="font-medium text-green-900 mb-2">Audition programmée</h4>
                            <p className="text-green-800 text-sm">
                              {new Date(application.audition_scheduled_at).toLocaleDateString('fr-FR', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                            {application.audition_notes && (
                              <p className="text-green-700 text-sm mt-2">
                                {application.audition_notes}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Dates de l'événement */}
                        {application.type === 'event' && application.eventDetails && (
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-medium text-gray-900 mb-2">Dates de l'événement</h4>
                            <p className="text-gray-700 text-sm">
                              Du {new Date(application.eventDetails.start_date).toLocaleDateString('fr-FR')} 
                              {application.eventDetails.end_date && 
                                ` au ${new Date(application.eventDetails.end_date).toLocaleDateString('fr-FR')}`
                              }
                            </p>
                          </div>
                        )}

                        <div className="flex gap-3 pt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(application.detailPath)}
                          >
                            {application.type === 'casting' ? 'Voir le casting' : 'Voir l\'événement'}
                          </Button>
                          
                          {application.status === 'pending' && application.type === 'casting' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/applications/${application.id}/edit`)}
                            >
                              Modifier
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default MyApplications;
