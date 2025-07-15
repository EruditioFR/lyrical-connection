import React, { useState } from 'react';
import { Navigate, useSearchParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { useCastingApplications, useUpdateApplication } from '@/hooks/useApplications';
import { useMyCastings, usePublishCastingResults } from '@/hooks/useCastings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, TrendingUp, BarChart3, Award, Calendar, Mail, Phone, MapPin, User, CheckCheck } from 'lucide-react';

const ProfessionalCastingApplications = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const castingIdFromUrl = searchParams.get('castingId');
  const [selectedCasting, setSelectedCasting] = useState<string>(castingIdFromUrl || '');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const { castings: myCastings, isLoading: castingsLoading } = useMyCastings();
  const { applications, isLoading: applicationsLoading } = useCastingApplications(selectedCasting);
  const updateApplication = useUpdateApplication();
  const publishResults = usePublishCastingResults();

  if (loading || castingsLoading) {
    return <Layout><div className="container mx-auto px-4 py-20 text-center">Chargement...</div></Layout>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Filtrer les candidatures par statut
  const filteredApplications = applications?.filter(app => {
    if (statusFilter === 'all') return true;
    return app.status === statusFilter;
  }) || [];

  // Calculer les statistiques
  const getStatistics = () => {
    if (!applications?.length) return null;

    const totalApplications = applications.length;
    
    const statusStats = applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const experienceStats = applications.reduce((acc, app) => {
      const level = app.artist_profiles?.experience_years 
        ? app.artist_profiles.experience_years < 3 ? 'Débutant' 
        : app.artist_profiles.experience_years < 10 ? 'Intermédiaire' 
        : 'Expérimenté'
        : 'Non spécifié';
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const genderStats = applications.reduce((acc, app) => {
      const gender = app.artist_profiles?.gender || 'Non spécifié';
      acc[gender] = (acc[gender] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const voiceTypeStats = applications.reduce((acc, app) => {
      const voiceType = app.artist_profiles?.voice_type || 'Non spécifié';
      acc[voiceType] = (acc[voiceType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const nationalityStats = applications.reduce((acc, app) => {
      const nationality = app.artist_profiles?.nationality || 'Non spécifiée';
      acc[nationality] = (acc[nationality] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const ageStats = applications.reduce((acc, app) => {
      if (app.artist_profiles?.birth_date) {
        const age = new Date().getFullYear() - new Date(app.artist_profiles.birth_date).getFullYear();
        if (age < 25) acc['18-24']++;
        else if (age < 35) acc['25-34']++;
        else if (age < 45) acc['35-44']++;
        else if (age < 55) acc['45-54']++;
        else acc['55+']++;
      }
      return acc;
    }, { '18-24': 0, '25-34': 0, '35-44': 0, '45-54': 0, '55+': 0 });

    const acceptanceRate = statusStats['accepted'] ? Math.round((statusStats['accepted'] / totalApplications) * 100) : 0;

    return { statusStats, experienceStats, genderStats, voiceTypeStats, nationalityStats, ageStats, acceptanceRate };
  };

  const statistics = getStatistics();

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'En attente', variant: 'secondary' as const },
      shortlisted: { label: 'Présélectionné', variant: 'outline' as const },
      accepted: { label: 'Accepté', variant: 'default' as const },
      rejected: { label: 'Refusé', variant: 'destructive' as const },
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return config ? <Badge variant={config.variant}>{config.label}</Badge> : null;
  };

  const getAgeFromBirthDate = (birthDate: string | null) => {
    if (!birthDate) return 'Non spécifié';
    const age = new Date().getFullYear() - new Date(birthDate).getFullYear();
    return `${age} ans`;
  };

  const statusCounts = {
    all: applications?.length || 0,
    pending: applications?.filter(app => app.status === 'pending').length || 0,
    shortlisted: applications?.filter(app => app.status === 'shortlisted').length || 0,
    accepted: applications?.filter(app => app.status === 'accepted').length || 0,
    rejected: applications?.filter(app => app.status === 'rejected').length || 0,
  };

  // Récupérer les informations du casting sélectionné
  const selectedCastingInfo = myCastings.find(c => c.id === selectedCasting);

  const handlePublishResults = () => {
    if (selectedCasting) {
      publishResults.mutate(selectedCasting);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Candidatures aux Castings</h1>
          <p className="text-gray-600 mt-2">
            Gérez les candidatures reçues pour vos castings avec des statistiques détaillées
          </p>
        </div>

        <div className="mb-6">
          <Select value={selectedCasting} onValueChange={setSelectedCasting}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="Sélectionnez un casting" />
            </SelectTrigger>
            <SelectContent>
              {myCastings.map((casting) => (
                <SelectItem key={casting.id} value={casting.id}>
                  {casting.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedCasting && selectedCastingInfo && (
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{selectedCastingInfo.title}</h2>
              <p className="text-sm text-gray-600">
                Résultats : {selectedCastingInfo.results_published ? 'Publiés' : 'Non publiés'}
              </p>
            </div>
            {!selectedCastingInfo.results_published && (
              <Button
                onClick={handlePublishResults}
                disabled={publishResults.isPending}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                {publishResults.isPending ? 'Publication...' : 'Publier les résultats'}
              </Button>
            )}
          </div>
        )}

        {selectedCasting && (
          <Tabs defaultValue="candidates" className="space-y-6">
            <TabsList>
              <TabsTrigger value="candidates">Candidats</TabsTrigger>
              <TabsTrigger value="statistics">Statistiques</TabsTrigger>
            </TabsList>

            <TabsContent value="candidates">
              <div className="space-y-4">
                {/* Filtres par statut */}
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant={statusFilter === 'all' ? 'default' : 'outline'}
                    onClick={() => setStatusFilter('all')}
                    size="sm"
                  >
                    Tous ({statusCounts.all})
                  </Button>
                  <Button
                    variant={statusFilter === 'pending' ? 'default' : 'outline'}
                    onClick={() => setStatusFilter('pending')}
                    size="sm"
                  >
                    En attente ({statusCounts.pending})
                  </Button>
                  <Button
                    variant={statusFilter === 'shortlisted' ? 'default' : 'outline'}
                    onClick={() => setStatusFilter('shortlisted')}
                    size="sm"
                  >
                    Présélectionnés ({statusCounts.shortlisted})
                  </Button>
                  <Button
                    variant={statusFilter === 'accepted' ? 'default' : 'outline'}
                    onClick={() => setStatusFilter('accepted')}
                    size="sm"
                  >
                    Acceptés ({statusCounts.accepted})
                  </Button>
                  <Button
                    variant={statusFilter === 'rejected' ? 'default' : 'outline'}
                    onClick={() => setStatusFilter('rejected')}
                    size="sm"
                  >
                    Refusés ({statusCounts.rejected})
                  </Button>
                </div>

                {filteredApplications.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <p className="text-gray-500">
                        {statusFilter === 'all' 
                          ? 'Aucune candidature trouvée pour ce casting.'
                          : `Aucune candidature ${statusFilter === 'pending' ? 'en attente' : 
                            statusFilter === 'shortlisted' ? 'présélectionnée' :
                            statusFilter === 'accepted' ? 'acceptée' : 'refusée'} trouvée.`
                        }
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredApplications.map((application) => (
                    <Card key={application.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex items-start space-x-4">
                            <Avatar className="w-16 h-16">
                              <AvatarImage 
                                src={application.artist_profiles?.profile_image_url || ''} 
                                alt={application.artist_profiles?.stage_name} 
                              />
                              <AvatarFallback className="text-lg">
                                {application.artist_profiles?.stage_name?.charAt(0) || 'A'}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1">
                              <CardTitle className="text-lg">
                                {application.artist_profiles?.stage_name}
                              </CardTitle>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4" />
                                  <span>Type de voix: {application.artist_profiles?.voice_type || 'Non spécifié'}</span>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4" />
                                  <span>Localisation: {application.artist_profiles?.location || 'Non spécifiée'}</span>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4" />
                                  <span>Sexe: {application.artist_profiles?.gender || 'Non spécifié'}</span>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4" />
                                  <span>Âge: {getAgeFromBirthDate(application.artist_profiles?.birth_date || null)}</span>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <BarChart3 className="h-4 w-4" />
                                  <span>Expérience: {application.artist_profiles?.experience_years ? `${application.artist_profiles.experience_years} ans` : 'Non spécifiée'}</span>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <TrendingUp className="h-4 w-4" />
                                  <span>Nationalité: {application.artist_profiles?.nationality || 'Non spécifiée'}</span>
                                </div>

                                {application.artist_profiles?.contact_email && (
                                  <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    <span className="truncate">{application.artist_profiles.contact_email}</span>
                                  </div>
                                )}

                                {application.artist_profiles?.phone && (
                                  <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4" />
                                    <span>{application.artist_profiles.phone}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end gap-2">
                            {getStatusBadge(application.status)}
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        {application.artist_profiles?.bio && (
                          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                            <h4 className="font-medium mb-2">Biographie</h4>
                            <p className="text-sm text-gray-700">{application.artist_profiles.bio}</p>
                          </div>
                        )}
                        
                        {application.motivation && (
                          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                            <h4 className="font-medium mb-2">Motivation</h4>
                            <p className="text-sm text-gray-700">{application.motivation}</p>
                          </div>
                        )}
                        
                        {application.cover_letter && (
                          <div className="mb-4 p-3 bg-green-50 rounded-lg">
                            <h4 className="font-medium mb-2">Lettre de motivation</h4>
                            <p className="text-sm text-gray-700">{application.cover_letter}</p>
                          </div>
                        )}

                        <div className="flex gap-2 mt-4">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/artiste/${application.artist_profiles?.id}`)}
                          >
                            Voir le profil complet
                          </Button>
                          {application.status === 'pending' && (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => updateApplication.mutate({ 
                                  id: application.id, 
                                  updates: { status: 'shortlisted' }
                                })}
                                disabled={updateApplication.isPending}
                              >
                                Présélectionner
                              </Button>
                              <Button 
                                variant="default" 
                                size="sm"
                                onClick={() => updateApplication.mutate({ 
                                  id: application.id, 
                                  updates: { status: 'accepted' }
                                })}
                                disabled={updateApplication.isPending}
                              >
                                Accepter
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => updateApplication.mutate({ 
                                  id: application.id, 
                                  updates: { status: 'rejected' }
                                })}
                                disabled={updateApplication.isPending}
                              >
                                Refuser
                              </Button>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="statistics">
              {statistics && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Répartition par statut
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(statistics.statusStats).map(([status, count]) => (
                          <div key={status} className="flex justify-between">
                            <span>{status === 'pending' ? 'En attente' : 
                                   status === 'shortlisted' ? 'Présélectionnés' :
                                   status === 'accepted' ? 'Acceptés' : 'Refusés'}</span>
                            <span className="font-bold">{count as number}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Répartition par niveau d'expérience
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(statistics.experienceStats).map(([level, count]) => (
                          <div key={level} className="flex justify-between">
                            <span>{level}</span>
                            <span className="font-bold">{count as number}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Répartition par sexe
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(statistics.genderStats).map(([gender, count]) => (
                          <div key={gender} className="flex justify-between">
                            <span>{gender}</span>
                            <span className="font-bold">{count as number}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Types de voix
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(statistics.voiceTypeStats).map(([type, count]) => (
                          <div key={type} className="flex justify-between">
                            <span>{type}</span>
                            <span className="font-bold">{count as number}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

        {!selectedCasting && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">Sélectionnez un casting pour voir les candidatures.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default ProfessionalCastingApplications;