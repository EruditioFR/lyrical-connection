
import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Building, MapPin, Globe, Phone, Mail, ExternalLink, Loader2, Users, Award, CheckCircle } from 'lucide-react';

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

  const { data: media } = useQuery({
    queryKey: ['professional-media', id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data, error } = await supabase
        .from('professional_media')
        .select('*')
        .eq('professional_profile_id', id)
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .limit(1);
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const heroMedia = media?.[0];

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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Layout breadcrumbTitle={professional?.company_name}>
      <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
        {/* Hero Section */}
        <div className="relative h-64 md:h-80 overflow-hidden">
          {heroMedia?.media_type === 'image' && heroMedia?.file_path ? (
            <img 
              src={heroMedia.file_path} 
              alt={heroMedia.title || professional.company_name}
              className="w-full h-full object-cover"
            />
          ) : heroMedia?.media_type === 'video' && heroMedia?.file_path ? (
            (() => {
              const url = heroMedia.file_path;
              // Vimeo embed
              if (url.includes('vimeo.com')) {
                const vimeoId = url.split('/').pop();
                return (
                  <iframe
                    src={`https://player.vimeo.com/video/${vimeoId}?background=1&autoplay=1&loop=1&muted=1`}
                    className="w-full h-full"
                    style={{ border: 'none' }}
                    allow="autoplay; fullscreen; picture-in-picture"
                  />
                );
              }
              // YouTube embed
              if (url.includes('youtube.com') || url.includes('youtu.be')) {
                const videoId = url.includes('youtu.be') 
                  ? url.split('/').pop()
                  : new URL(url).searchParams.get('v');
                return (
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&controls=0&playlist=${videoId}`}
                    className="w-full h-full"
                    style={{ border: 'none' }}
                    allow="autoplay; fullscreen; picture-in-picture"
                  />
                );
              }
              // Direct video file
              return (
                <video 
                  src={url}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              );
            })()
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-primary/20 to-accent/20" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
        </div>

        <div className="container mx-auto px-4 -mt-24 pb-12">
          <div className="max-w-6xl mx-auto">
            {/* Carte profil principal */}
            <Card className="mb-8">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-start gap-6">
                  <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
                    <AvatarImage src={professional.logo_url || ''} />
                    <AvatarFallback className="text-2xl">
                      {getInitials(professional.company_name || 'P')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h1 className="text-3xl md:text-4xl font-serif font-bold">
                            {professional.company_name || 'Professionnel'}
                          </h1>
                          {professional.is_verified && (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Vérifié
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge variant="secondary" className="text-sm">
                            {getRoleLabel(professional.professional_role)}
                          </Badge>
                        </div>

                        {professional.location && (
                          <div className="flex items-center gap-2 text-white mb-2">
                            <MapPin className="h-4 w-4" />
                            <span>{professional.location}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {professional.contact_email && (
                          <Button
                            variant="default"
                            onClick={() => window.open(`mailto:${professional.contact_email}`)}
                          >
                            <Mail className="h-4 w-4 mr-2" />
                            Contacter
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
                      </div>
                    </div>

                    {professional.bio && (
                      <p className="text-white leading-relaxed">
                        {professional.bio}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Colonne principale */}
              <div className="lg:col-span-2 space-y-8">
                {/* Équipe */}
                {professional.team_description && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Notre équipe
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-white whitespace-pre-wrap leading-relaxed">
                        {professional.team_description}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Colonne latérale */}
              <div className="space-y-8">
                {/* Informations de contact */}
                <Card>
                  <CardHeader>
                    <CardTitle>Contact</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {professional.contact_email && (
                      <>
                        <div className="flex items-center gap-3">
                          <Mail className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                          <span className="text-white text-sm break-all">{professional.contact_email}</span>
                        </div>
                        <Separator />
                      </>
                    )}
                    
                    {professional.phone && (
                      <>
                        <div className="flex items-center gap-3">
                          <Phone className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                          <span className="text-white text-sm">{professional.phone}</span>
                        </div>
                        <Separator />
                      </>
                    )}
                    
                    {professional.website && (
                      <>
                        <div className="flex items-center gap-3">
                          <Globe className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                          <a 
                            href={professional.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline text-sm break-all"
                          >
                            {professional.website.replace(/^https?:\/\//, '')}
                          </a>
                        </div>
                        <Separator />
                      </>
                    )}

                    {professional.location && (
                      <>
                        <div className="flex items-center gap-3">
                          <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                          <span className="text-white text-sm">{professional.location}</span>
                        </div>
                        {professional.intervention_radius && <Separator />}
                      </>
                    )}

                    {professional.intervention_radius && (
                      <div className="flex items-center gap-3">
                        <Building className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        <span className="text-white text-sm">
                          Rayon: {professional.intervention_radius} km
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfessionalDetail;
