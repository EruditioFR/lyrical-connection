
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/layout/Layout';
import EventMap from '@/components/events/EventMap';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Calendar, Clock, MapPin, Share2, Users, ArrowLeft, AlertCircle, Building, Mail, Phone, Globe, Play, Volume2, Image as ImageIcon } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '@/hooks/useAuth';
import { useProfessionalMedia } from '@/hooks/useProfessionalMedia';

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  console.log('🔍 EventDetail - Event ID:', id);
  console.log('🔍 EventDetail - Current user:', user?.id);

  // Fetch event data from professional_events table
  const { data: event, isLoading, error } = useQuery({
    queryKey: ['eventDetail', id],
    queryFn: async () => {
      if (!id) {
        console.error('❌ No event ID provided');
        throw new Error('Event ID is required');
      }
      
      console.log('🔍 Fetching event with ID:', id);
      
      // First get the event
      const { data: eventData, error: eventError } = await supabase
        .from('professional_events')
        .select(`
          *,
          category:event_categories(*)
        `)
        .eq('id', id)
        .maybeSingle();

      if (eventError) {
        console.error('❌ Error fetching event:', eventError);
        throw eventError;
      }

      if (!eventData) {
        console.log('⚠️ No event found for ID:', id);
        return null;
      }

      // Then get the professional profile separately
      const { data: professionalProfile, error: profileError } = await supabase
        .from('professional_profiles')
        .select('*')
        .eq('id', eventData.professional_profile_id)
        .maybeSingle();

      if (profileError) {
        console.error('❌ Error fetching professional profile:', profileError);
        // Don't throw error here, just log it and continue without profile data
      }

      const result = {
        ...eventData,
        professional_profile: professionalProfile
      };

      console.log('✅ Event data retrieved:', result);
      return result;
    },
    enabled: !!id,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Fetch applications count
  const { data: applicationsCount } = useQuery({
    queryKey: ['eventApplicationsCount', id],
    queryFn: async () => {
      if (!id) return 0;
      
      const { count, error } = await supabase
        .from('event_applications')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', id);

      if (error) {
        console.error('❌ Error fetching applications count:', error);
        throw error;
      }
      return count || 0;
    },
    enabled: !!id,
  });

  // Fetch event media
  const { media, getMediaUrl } = useProfessionalMedia(event?.professional_profile_id);

  const getEventTypeLabel = (type: string) => {
    const labels = {
      masterclass: 'Masterclass',
      stage: 'Stage',
      concours: 'Concours',
      atelier: 'Atelier',
      conference: 'Conférence'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'published':
        return 'Publié';
      case 'draft':
        return 'Brouillon';
      case 'cancelled':
        return 'Annulé';
      case 'completed':
        return 'Terminé';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCurrencySymbol = (currency: string) => {
    const currencySymbols: { [key: string]: string } = {
      'EUR': '€',
      'USD': '$',
      'GBP': '£',
      'AED': 'د.إ',
      'AUD': 'A$',
      'BRL': 'R$',
      'CAD': 'C$',
      'CHF': 'Fr',
      'CNY': '¥',
      'CZK': 'Kč',
      'DKK': 'kr',
      'EGP': 'E£',
      'HKD': 'HK$',
      'HUF': 'Ft',
      'IDR': 'Rp',
      'ILS': '₪',
      'INR': '₹',
      'JPY': '¥',
      'KRW': '₩',
      'MAD': 'د.م.',
      'MXN': 'Mex$',
      'NOK': 'kr',
      'NZD': 'NZ$',
      'PLN': 'zł',
      'RON': 'lei',
      'RUB': '₽',
      'SAR': '﷼',
      'SEK': 'kr',
      'SGD': 'S$',
      'THB': '฿',
      'TRY': '₺',
      'ZAR': 'R',
    };
    return currencySymbols[currency] || currency;
  };

  const getMediaIcon = (mediaType: string) => {
    switch (mediaType) {
      case 'video':
        return <Play className="h-4 w-4" />;
      case 'audio':
        return <Volume2 className="h-4 w-4" />;
      default:
        return <ImageIcon className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    console.error('❌ Event fetch error:', error);
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-3xl font-serif font-bold mb-4">Erreur de chargement</h1>
            <p className="text-muted-foreground mb-6">
              Une erreur s'est produite lors du chargement de l'événement : {error.message}
            </p>
            <div className="space-y-2">
              <Button asChild>
                <Link to="/mes-evenements">Retour à mes événements</Link>
              </Button>
              <div className="text-xs text-muted-foreground">
                ID de l'événement: {id}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!event) {
    console.warn('⚠️ No event found for ID:', id);
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-3xl font-serif font-bold mb-4">Événement non trouvé</h1>
            <p className="text-muted-foreground mb-6">
              L'événement que vous recherchez n'existe pas ou n'est pas accessible.
            </p>
            <div className="space-y-2">
              <Button asChild>
                <Link to="/mes-evenements">Retour à mes événements</Link>
              </Button>
              <div className="text-xs text-muted-foreground">
                ID recherché: {id}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const eventData = event as any;

  return (
    <Layout>
      {/* En-tête avec image de couverture */}
      <div className="relative h-64 md:h-96 w-full">
        <div className="absolute inset-0">
          {event.image_url ? (
            <img 
              src={event.image_url} 
              alt={event.title} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20"></div>
          )}
        </div>
        <div className="container mx-auto px-4 md:px-6 relative h-full flex items-end pb-6">
          <Button variant="outline" className="absolute top-6 left-4 md:left-6 bg-background/80 hover:bg-background" asChild>
            <Link to="/mes-evenements">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Link>
          </Button>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline" className="text-sm">
                  {getEventTypeLabel(event.event_type)}
                </Badge>
                <Badge className={getStatusColor(event.status)}>
                  {getStatusLabel(event.status)}
                </Badge>
                {event.is_featured && (
                  <Badge variant="secondary" className="bg-gold-500/90 text-white hover:bg-gold-600 text-sm">
                    Événement à ne pas manquer
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">{event.title}</h1>
              <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 text-muted-foreground mb-6">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  <span>{format(new Date(event.start_date), 'dd MMMM yyyy', { locale: fr })}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  <span>
                    {format(new Date(event.start_date), 'HH:mm', { locale: fr })} - {format(new Date(event.end_date), 'HH:mm', { locale: fr })}
                  </span>
                </div>
                {event.location && (
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span>{event.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Organisateur */}
            {eventData.professional_profile && (
              <section className="bg-card rounded-xl p-6 shadow-sm border border-border">
                <h2 className="text-2xl font-serif font-semibold mb-4 flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Organisateur
                </h2>
                <div className="space-y-3">
                  <h3 className="text-lg font-medium">
                    {eventData.professional_profile.company_name}
                  </h3>
                  {eventData.professional_profile.bio && (
                    <p className="text-muted-foreground">
                      {eventData.professional_profile.bio}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {eventData.professional_profile.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {eventData.professional_profile.location}
                      </div>
                    )}
                    {eventData.professional_profile.contact_email && (
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {eventData.professional_profile.contact_email}
                      </div>
                    )}
                    {eventData.professional_profile.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {eventData.professional_profile.phone}
                      </div>
                    )}
                    {eventData.professional_profile.website && (
                      <div className="flex items-center gap-1">
                        <Globe className="h-4 w-4" />
                        <a 
                          href={eventData.professional_profile.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:text-primary"
                        >
                          Site web
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* Description */}
            {event.description && (
              <section className="bg-card rounded-xl p-6 shadow-sm border border-border">
                <h2 className="text-2xl font-serif font-semibold mb-4">À propos de cet événement</h2>
                <div className="text-muted-foreground whitespace-pre-line">
                  {event.description}
                </div>
              </section>
            )}

            {/* Galerie média */}
            {media && media.length > 0 && (
              <section className="bg-card rounded-xl p-6 shadow-sm border border-border">
                <h2 className="text-2xl font-serif font-semibold mb-4">Galerie média</h2>
                <Carousel className="w-full">
                  <CarouselContent>
                    {media.map((item, index) => (
                      <CarouselItem key={item.id} className="md:basis-1/2 lg:basis-1/3">
                        <div className="relative aspect-video bg-muted rounded-lg overflow-hidden group">
                          {item.media_type === 'photo' ? (
                            <img
                              src={getMediaUrl(item.file_path)}
                              alt={item.title || 'Media'}
                              className="w-full h-full object-cover"
                            />
                          ) : item.media_type === 'video' ? (
                            <div className="w-full h-full bg-black flex items-center justify-center">
                              <video
                                src={getMediaUrl(item.file_path)}
                                className="w-full h-full object-cover"
                                poster=""
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-all">
                                <Play className="h-12 w-12 text-white" />
                              </div>
                            </div>
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <Volume2 className="h-12 w-12 text-muted-foreground" />
                            </div>
                          )}
                          <div className="absolute top-2 left-2">
                            <Badge variant="secondary" className="text-xs">
                              {getMediaIcon(item.media_type)}
                              <span className="ml-1 capitalize">{item.media_type}</span>
                            </Badge>
                          </div>
                          {item.title && (
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                              <p className="text-white text-sm font-medium">{item.title}</p>
                            </div>
                          )}
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              </section>
            )}

            {/* Programme */}
            {event.program && (
              <section className="bg-card rounded-xl p-6 shadow-sm border border-border">
                <h2 className="text-2xl font-serif font-semibold mb-4">Programme</h2>
                <div className="text-muted-foreground whitespace-pre-line">
                  {event.program}
                </div>
              </section>
            )}

            {/* Exigences */}
            {event.requirements && (
              <section className="bg-card rounded-xl p-6 shadow-sm border border-border">
                <h2 className="text-2xl font-serif font-semibold mb-4">Prérequis</h2>
                <div className="text-muted-foreground whitespace-pre-line">
                  {event.requirements}
                </div>
              </section>
            )}

            {/* Lieu avec carte */}
            {(event.location || event.venue || eventData.address) && (
              <section className="bg-card rounded-xl p-6 shadow-sm border border-border">
                <h2 className="text-2xl font-serif font-semibold mb-4">Lieu</h2>
                {event.venue && <p className="font-medium mb-2">{event.venue}</p>}
                {event.location && <p className="text-muted-foreground mb-4">{event.location}</p>}
                {eventData.address && <p className="text-muted-foreground mb-4">{eventData.address}</p>}
                
                {/* Carte si les coordonnées sont disponibles */}
                {eventData.latitude && eventData.longitude && (
                  <div className="mt-4">
                    <EventMap
                      latitude={eventData.latitude}
                      longitude={eventData.longitude}
                      address={eventData.address}
                      venue={event.venue}
                    />
                  </div>
                )}
              </section>
            )}

            {/* Contact */}
            {event.contact_info && (
              <section className="bg-card rounded-xl p-6 shadow-sm border border-border">
                <h2 className="text-2xl font-serif font-semibold mb-4">Contact</h2>
                <div className="text-muted-foreground whitespace-pre-line">
                  {event.contact_info}
                </div>
              </section>
            )}
          </div>

          {/* Barre latérale */}
          <div className="space-y-6">
            {/* Informations */}
            <Card className="shadow-sm border-border sticky top-20">
              <CardContent className="p-6">
                <h3 className="text-xl font-serif font-semibold mb-4">Informations</h3>
                
                <Separator className="mb-4" />
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Date de début</span>
                    <span className="font-medium">{format(new Date(event.start_date), 'dd/MM/yyyy HH:mm', { locale: fr })}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Date de fin</span>
                    <span className="font-medium">{format(new Date(event.end_date), 'dd/MM/yyyy HH:mm', { locale: fr })}</span>
                  </div>
                  {event.registration_deadline && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Date limite d'inscription</span>
                      <span className="font-medium">{format(new Date(event.registration_deadline), 'dd/MM/yyyy', { locale: fr })}</span>
                    </div>
                  )}
                  {event.price && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Prix</span>
                      <span className="font-medium">
                        {event.price} {event.currency || 'EUR'} ({getCurrencySymbol(event.currency || 'EUR')})
                      </span>
                    </div>
                  )}
                  {event.max_participants && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Places disponibles</span>
                      <span className="font-medium">{event.max_participants - (applicationsCount || 0)} / {event.max_participants}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Inscriptions</span>
                    <span className="font-medium">{applicationsCount || 0}</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Button className="w-full" asChild>
                    <Link to={`/evenements/${event.id}/inscriptions`}>
                      <Users className="w-4 h-4 mr-2" />
                      Voir les inscriptions
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full gap-2">
                    <Share2 className="w-4 h-4" />
                    Partager
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EventDetail;
