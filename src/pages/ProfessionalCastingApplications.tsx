
import React, { useState } from 'react';
import { Navigate, useSearchParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { useCastings } from '@/hooks/useCastings';
import { useCastingApplications, useUpdateApplication } from '@/hooks/useApplications';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, TrendingUp, BarChart3, Globe, Calendar, Mail, Phone, MapPin, User, CheckCircle, XCircle, Send } from 'lucide-react';

const ProfessionalCastingApplications = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const castingIdFromUrl = searchParams.get('castingId');
  const [selectedCasting, setSelectedCasting] = useState<string>(castingIdFromUrl || '');
  const { castings, isLoading: castingsLoading } = useCastings();
  const { applications, isLoading: applicationsLoading } = useCastingApplications(selectedCasting);
  const { mutate: updateApplication } = useUpdateApplication();
  const { toast } = useToast();

  if (loading) {
    return <Layout><div className="container mx-auto px-4 py-20 text-center">Chargement...</div></Layout>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Filtrer les castings du professionnel connecté
  const myCastings = castings.filter(casting => casting.professional_profile_id);

  // Calculer les statistiques
  const getStatistics = () => {
    if (!applications.length) return null;

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

    const statusStats = applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { ageStats, genderStats, voiceTypeStats, nationalityStats, statusStats };
  };

  const statistics = getStatistics();

  // Fonctions de gestion du statut des candidatures
  const handleStatusChange = (applicationId: string, newStatus: string) => {
    updateApplication({
      id: applicationId,
      updates: { status: newStatus }
    });
  };

  // Fonction pour publier les résultats du casting
  const publishResults = async () => {
    if (!selectedCasting) return;
    
    try {
      const { error } = await supabase
        .from('castings')
        .update({ results_published: true })
        .eq('id', selectedCasting);

      if (error) throw error;

      toast({
        title: "Résultats publiés",
        description: "Les candidats peuvent maintenant voir les résultats de leur candidature.",
      });
    } catch (error) {
      console.error('Error publishing results:', error);
      toast({
        title: "Erreur",
        description: "Impossible de publier les résultats.",
        variant: "destructive",
      });
    }
  };

  // Trouver le casting sélectionné pour récupérer son nom et statut de publication
  const currentCasting = myCastings.find(c => c.id === selectedCasting);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'En attente', variant: 'secondary' as const },
      shortlisted: { label: 'Présélectionné', variant: 'default' as const },
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

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Candidatures aux Castings</h1>
          <p className="text-gray-600 mt-2">
            Analysez les candidatures reçues pour vos castings avec des statistiques détaillées
          </p>
        </div>

        <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center">
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
          
          {selectedCasting && currentCasting && (
            <Button 
              onClick={publishResults}
              variant={currentCasting.results_published ? "secondary" : "default"}
              disabled={currentCasting.results_published}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              {currentCasting.results_published 
                ? `Résultats publiés pour "${currentCasting.title}"` 
                : `Publier les résultats du casting "${currentCasting.title}"`
              }
            </Button>
          )}
        </div>

        {selectedCasting && (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="candidates">Candidats</TabsTrigger>
              <TabsTrigger value="statistics">Statistiques</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total candidatures</CardTitle>
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
                         status === 'shortlisted' ? 'Présélectionnés' :
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

            <TabsContent value="candidates">
              <div className="space-y-4">
                {applications.map((application) => (
                  <Card key={application.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex items-start space-x-4">
                          <Avatar className="w-16 h-16">
                            <AvatarImage 
                              src={application.artist_profiles?.profile_image_url || ''} 
                              alt={application.artist_profiles?.stage_name} 
                            />
                            <AvatarFallback>
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
                                <Globe className="h-4 w-4" />
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
                          <span className="text-sm text-gray-500">
                            Candidature du {new Date(application.created_at).toLocaleDateString('fr-FR')}
                          </span>
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
                      
                      {application.cover_letter && (
                        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                          <h4 className="font-medium mb-2">Lettre de motivation</h4>
                          <p className="text-sm text-gray-700">{application.cover_letter}</p>
                        </div>
                      )}
                      
                      {application.motivation && (
                        <div className="mb-4 p-3 bg-green-50 rounded-lg">
                          <h4 className="font-medium mb-2">Motivation supplémentaire</h4>
                          <p className="text-sm text-gray-700">{application.motivation}</p>
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
                              variant="default" 
                              size="sm"
                              onClick={() => handleStatusChange(application.id, 'shortlisted')}
                            >
                              Présélectionner
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleStatusChange(application.id, 'rejected')}
                            >
                              Refuser
                            </Button>
                          </>
                        )}
                        {application.status === 'shortlisted' && (
                          <>
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={() => handleStatusChange(application.id, 'accepted')}
                            >
                              Accepter
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleStatusChange(application.id, 'rejected')}
                            >
                              Refuser
                            </Button>
                          </>
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
                        Répartition par âge
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(statistics.ageStats).map(([range, count]) => (
                          <div key={range} className="flex justify-between">
                            <span>{range} ans</span>
                            <span className="font-bold">{count}</span>
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
                        Types de voix
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(statistics.voiceTypeStats).map(([type, count]) => (
                          <div key={type} className="flex justify-between">
                            <span>{type}</span>
                            <span className="font-bold">{count}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        Nationalités
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(statistics.nationalityStats).map(([nationality, count]) => (
                          <div key={nationality} className="flex justify-between">
                            <span>{nationality}</span>
                            <span className="font-bold">{count}</span>
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
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Sélectionnez un casting
              </h3>
              <p className="text-gray-600">
                Choisissez un casting dans la liste pour voir les candidatures et statistiques
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default ProfessionalCastingApplications;
