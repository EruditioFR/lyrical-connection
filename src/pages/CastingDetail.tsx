import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCasting } from '@/hooks/useCastings';
import { useAuth } from '@/hooks/useAuth';
import { useUserType } from '@/hooks/useUserType';
import { useArtistCastingApplication } from '@/hooks/useEvents';
import { 
  Calendar, MapPin, Users, Euro, Clock, 
  ArrowLeft, Send, Loader2, Eye 
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const CastingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isArtist } = useUserType();
  const { casting, isLoading } = useCasting(id!);
  const { data: application } = useArtistCastingApplication(id!);

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!casting) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Casting non trouvé</h1>
          <Button onClick={() => navigate('/castings')}>
            Retour aux castings
          </Button>
        </div>
      </Layout>
    );
  }

  const formatDate = (date: string | null) => {
    if (!date) return 'Non précisée';
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getProductionTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      opera: 'Opéra',
      operetta: 'Opérette',
      concert: 'Concert',
      competition: 'Concours',
      masterclass: 'Masterclass',
      other: 'Autre'
    };
    return labels[type] || type;
  };

  const getCompensationLabel = (type: string | null) => {
    if (!type) return null;
    const labels: { [key: string]: string } = {
      paid: 'Rémunéré',
      unpaid: 'Non rémunéré',
      travel_covered: 'Frais de transport couverts',
      accommodation_covered: 'Hébergement couvert'
    };
    return labels[type] || type;
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/castings')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux castings
          </Button>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {casting.title}
              </h1>
              <div className="flex items-center gap-4 text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {casting.location}
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {casting.view_count || 0} vues
                </div>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline">
                  {getProductionTypeLabel(casting.production_type)}
                </Badge>
                {casting.is_featured && (
                  <Badge variant="destructive">
                    Mis en avant
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              {/* Si c'est un artiste et qu'il a postulé, afficher les infos */}
              {isArtist && user && application ? (
                <Card className="bg-muted/50 p-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Ma candidature</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      Candidature envoyée le {format(new Date(application.created_at), 'dd MMMM yyyy', { locale: fr })}
                    </div>
                    {casting.results_published ? (
                      <Badge className={
                        application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        application.status === 'waitlisted' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }>
                        {application.status === 'accepted' ? 'Accepté(e)' :
                         application.status === 'rejected' ? 'Refusé(e)' :
                         application.status === 'waitlisted' ? 'Présélectionné(e)' :
                         'En attente'}
                      </Badge>
                    ) : (
                      <Badge variant="secondary">En attente</Badge>
                    )}
                  </div>
                </Card>
              ) : isArtist && user ? (
                <Button 
                  className="bg-gradient-to-r from-lyrical-600 to-gold-500 hover:from-lyrical-700 hover:to-gold-600"
                  onClick={() => navigate(`/castings/${casting.id}/postuler`)}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Postuler
                </Button>
              ) : null}
              
              {!isArtist && user && (
                <Button
                  variant="outline"
                  onClick={() => navigate(`/professional/casting-applications?castingId=${casting.id}`)}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Candidatures
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contenu principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            {casting.description && (
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {casting.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Profil recherché */}
            <Card>
              <CardHeader>
                <CardTitle>Profil recherché</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(casting.age_range_min || casting.age_range_max) && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Âge</h4>
                    <p className="text-gray-700">
                      {casting.age_range_min && casting.age_range_max
                        ? `Entre ${casting.age_range_min} et ${casting.age_range_max} ans`
                        : casting.age_range_min
                        ? `À partir de ${casting.age_range_min} ans`
                        : `Jusqu'à ${casting.age_range_max} ans`
                      }
                    </p>
                  </div>
                )}

                {casting.required_voice_types && casting.required_voice_types.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Types de voix</h4>
                    <div className="flex flex-wrap gap-2">
                      {casting.required_voice_types.map((voice, index) => (
                        <Badge key={index} variant="secondary">
                          {voice}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {casting.required_experience_level && casting.required_experience_level.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Niveau d'expérience</h4>
                    <div className="flex flex-wrap gap-2">
                      {casting.required_experience_level.map((level, index) => (
                        <Badge key={index} variant="secondary">
                          {level}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {casting.required_languages && casting.required_languages.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Langues requises</h4>
                    <div className="flex flex-wrap gap-2">
                      {casting.required_languages.map((language, index) => (
                        <Badge key={index} variant="secondary">
                          {language}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {casting.specific_requirements && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Exigences spécifiques</h4>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {casting.specific_requirements}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Répertoire */}
            {casting.repertoire_requirements && casting.repertoire_requirements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Répertoire demandé</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {casting.repertoire_requirements.map((repertoire, index) => (
                      <Badge key={index} variant="outline">
                        {repertoire}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Informations pratiques */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Informations pratiques
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {casting.venue && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Lieu</h4>
                    <p className="text-gray-700">{casting.venue}</p>
                  </div>
                )}

                {casting.start_date && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Date de début</h4>
                    <p className="text-gray-700">{formatDate(casting.start_date)}</p>
                  </div>
                )}

                {casting.end_date && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Date de fin</h4>
                    <p className="text-gray-700">{formatDate(casting.end_date)}</p>
                  </div>
                )}

                {casting.application_deadline && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Date limite</h4>
                    <p className="text-gray-700 font-medium text-red-600">
                      {formatDate(casting.application_deadline)}
                    </p>
                  </div>
                )}

                {casting.audition_date && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Date d'audition</h4>
                    <p className="text-gray-700">{formatDate(casting.audition_date)}</p>
                  </div>
                )}

                {casting.audition_location && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Lieu d'audition</h4>
                    <p className="text-gray-700">{casting.audition_location}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Compensation */}
            {casting.compensation_type && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Euro className="h-5 w-5" />
                    Compensation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    {getCompensationLabel(casting.compensation_type)}
                    {casting.compensation_amount && (
                      <span className="font-medium"> - {casting.compensation_amount}€</span>
                    )}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Action */}
            {isArtist && user && application ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                    <h4 className="font-medium">Ma candidature</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      Candidature envoyée le {format(new Date(application.created_at), 'dd MMMM yyyy', { locale: fr })}
                    </div>
                    {casting.results_published ? (
                      <Badge className={
                        application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        application.status === 'waitlisted' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }>
                        {application.status === 'accepted' ? 'Accepté(e)' :
                         application.status === 'rejected' ? 'Refusé(e)' :
                         application.status === 'waitlisted' ? 'Présélectionné(e)' :
                         'En attente'}
                      </Badge>
                    ) : (
                      <Badge variant="secondary">En attente</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : isArtist && user ? (
              <Card>
                <CardContent className="pt-6 space-y-3">
                  <Button 
                    className="w-full bg-gradient-to-r from-lyrical-600 to-gold-500 hover:from-lyrical-700 hover:to-gold-600"
                    onClick={() => navigate(`/castings/${casting.id}/postuler`)}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Postuler à ce casting
                  </Button>
                </CardContent>
              </Card>
            ) : !isArtist && user ? (
              <Card>
                <CardContent className="pt-6">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate(`/professional/casting-applications?castingId=${casting.id}`)}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Voir les candidatures
                  </Button>
                </CardContent>
              </Card>
            ) : null}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CastingDetail;
