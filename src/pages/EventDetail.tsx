import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/layout/Layout';
import EventHeader from '@/components/events/EventHeader';
import EventOrganizer from '@/components/events/EventOrganizer';
import EventMediaGallery from '@/components/events/EventMediaGallery';
import EventSidebar from '@/components/events/EventSidebar';
import EventContentSection from '@/components/events/EventContentSection';
import EventLocation from '@/components/events/EventLocation';
import EventRulesModal from '@/components/events/EventRulesModal';
import VideoPlayerModal from '@/components/events/VideoPlayerModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, FileText } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfessionalMedia } from '@/hooks/useProfessionalMedia';

// Define the event type with rules properties
interface EventWithRules {
  id: string;
  title: string;
  description?: string;
  program?: string;
  requirements?: string;
  contact_info?: string;
  start_date: string;
  end_date: string;
  location?: string;
  venue?: string;
  address?: string;
  price?: number;
  currency?: string;
  max_participants?: number;
  event_type: string;
  status: string;
  professional_profile_id: string;
  participation_rules?: string;
  code_of_conduct?: string;
  cancellation_policy?: string;
  liability_waiver?: string;
  professional_profile?: any;
  category?: any;
  latitude?: number;
  longitude?: number;
}

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [selectedVideo, setSelectedVideo] = useState<{src: string, title: string, description?: string} | null>(null);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);

  console.log('🔍 EventDetail - Event ID:', id);
  console.log('🔍 EventDetail - Current user:', user?.id);

  // Fetch event data from professional_events table
  const { data: event, isLoading, error } = useQuery({
    queryKey: ['eventDetail', id],
    queryFn: async (): Promise<EventWithRules | null> => {
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

      const result: EventWithRules = {
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

  const handleVideoClick = (videoSrc: string, title: string, description?: string) => {
    setSelectedVideo({ src: videoSrc, title, description });
  };

  const handleAudioClick = (audioSrc: string) => {
    window.open(audioSrc, '_blank');
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

  const hasRules = event?.participation_rules || event?.code_of_conduct || 
                   event?.cancellation_policy || event?.liability_waiver;

  return (
    <Layout>
      <EventHeader
        event={event}
        getEventTypeLabel={getEventTypeLabel}
        getStatusLabel={getStatusLabel}
        getStatusColor={getStatusColor}
      />

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-8">
          <EventOrganizer professionalProfile={event.professional_profile} />

          {event.description && (
            <EventContentSection
              title="À propos de cet événement"
              content={event.description}
            />
          )}

          <EventMediaGallery
            media={media || []}
            getMediaUrl={getMediaUrl}
            onVideoClick={handleVideoClick}
            onAudioClick={handleAudioClick}
          />

          {event.program && (
            <EventContentSection
              title="Programme"
              content={event.program}
            />
          )}

          {event.requirements && (
            <EventContentSection
              title="Prérequis"
              content={event.requirements}
            />
          )}

          {/* Section Règlement */}
          {hasRules && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Règlement de l'événement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Cet événement dispose d'un règlement spécifique incluant les conditions de participation, 
                  le code de conduite et la politique d'annulation.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setIsRulesModalOpen(true)}
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Lire le règlement
                </Button>
              </CardContent>
            </Card>
          )}

          <EventLocation event={event} />

          {event.contact_info && (
            <EventContentSection
              title="Contact"
              content={event.contact_info}
            />
          )}
        </div>

        {/* Barre latérale */}
        <div className="space-y-6">
          <EventSidebar
            event={event}
            applicationsCount={applicationsCount || 0}
            getCurrencySymbol={getCurrencySymbol}
          />
        </div>
      </div>

      {/* Modal pour la lecture vidéo */}
      {selectedVideo && (
        <VideoPlayerModal
          isOpen={!!selectedVideo}
          onClose={() => setSelectedVideo(null)}
          videoSrc={selectedVideo.src}
          title={selectedVideo.title}
          description={selectedVideo.description}
        />
      )}

      {/* Modal pour le règlement */}
      {hasRules && (
        <EventRulesModal
          isOpen={isRulesModalOpen}
          onClose={() => setIsRulesModalOpen(false)}
          event={event}
        />
      )}
    </Layout>
  );
};

export default EventDetail;
