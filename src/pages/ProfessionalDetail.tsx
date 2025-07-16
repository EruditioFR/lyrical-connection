
import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building, MapPin, Globe, Phone, Mail, ExternalLink, Loader2 } from 'lucide-react';

const ProfessionalDetail = () => {
  const { id } = useParams();

  const { data: professional, isLoading, error } = useQuery({
    queryKey: ['professional-detail', id],
    queryFn: async () => {
      if (!id) throw new Error('ID manquant');
      
      const { data, error } = await supabase
        .from('professional_profiles')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const getRoleLabel = (role: string) => {
    const roleLabels: Record<string, string> = {
      'casting_director': 'Directeur de casting',
      'vocal_coach': 'Coach vocal',
      'conductor': 'Chef d\'orchestre',
      'opera_house_manager': 'Directeur d\'opéra',
      'voice_teacher': 'Professeur de chant',
      'artistic_agent': 'Agent artistique',
      'producer': 'Producteur',
      'competition_director': 'Directeur de concours'
    };
    return roleLabels[role] || role;
  };

  if (!id) {
    return <Navigate to="/professionnels" replace />;
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  if (error || !professional) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Professionnel non trouvé
            </h1>
            <p className="text-gray-600 mb-6">
              Le professionnel que vous recherchez n'existe pas ou n'est plus actif.
            </p>
            <Button onClick={() => window.history.back()}>
              Retour
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* En-tête du profil */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="flex items-start gap-6">
                {professional.logo_url ? (
                  <img
                    src={professional.logo_url}
                    alt={professional.company_name || 'Logo'}
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Building className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">
                      {professional.company_name || 'Professionnel'}
                    </h1>
                    {professional.is_verified && (
                      <Badge variant="secondary">
                        Vérifié
                      </Badge>
                    )}
                  </div>
                  
                  <Badge variant="outline" className="mb-4">
                    {getRoleLabel(professional.professional_role)}
                  </Badge>

                  {professional.location && (
                    <div className="flex items-center gap-2 text-gray-600 mb-4">
                      <MapPin className="h-4 w-4" />
                      <span>{professional.location}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {professional.contact_email && (
                      <Button
                        variant="outline"
                        onClick={() => window.open(`mailto:${professional.contact_email}`)}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Contact
                      </Button>
                    )}

                    {professional.website && (
                      <Button
                        variant="outline"
                        onClick={() => window.open(professional.website, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Site web
                      </Button>
                    )}

                    {professional.phone && (
                      <Button
                        variant="outline"
                        onClick={() => window.open(`tel:${professional.phone}`)}
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Appeler
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Détails du profil */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Présentation */}
            {professional.bio && (
              <Card>
                <CardHeader>
                  <CardTitle>Présentation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {professional.bio}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Équipe */}
            {professional.team_description && (
              <Card>
                <CardHeader>
                  <CardTitle>Notre équipe</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {professional.team_description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Informations de contact */}
            <Card>
              <CardHeader>
                <CardTitle>Informations de contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {professional.contact_email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-700">{professional.contact_email}</span>
                  </div>
                )}
                
                {professional.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-700">{professional.phone}</span>
                  </div>
                )}
                
                {professional.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-gray-400" />
                    <a 
                      href={professional.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      {professional.website}
                    </a>
                  </div>
                )}

                {professional.location && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-700">{professional.location}</span>
                  </div>
                )}

                {professional.intervention_radius && (
                  <div className="flex items-center gap-3">
                    <Building className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-700">
                      Rayon d'intervention: {professional.intervention_radius} km
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfessionalDetail;
