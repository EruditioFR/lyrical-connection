
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import EventHeader from '@/components/events/EventHeader';
import EventDetailMain from '@/components/events/EventDetailMain';
import EventSidebar from '@/components/events/EventSidebar';
import EventRulesModal from '@/components/events/EventRulesModal';
import VideoPlayerModal from '@/components/events/VideoPlayerModal';
import EventDetailLoading from '@/components/events/EventDetailLoading';
import EventDetailError from '@/components/events/EventDetailError';
import { useAuth } from '@/hooks/useAuth';
import { useProfessionalMedia } from '@/hooks/useProfessionalMedia';
import { useEventDetail, useEventApplicationsCount } from '@/hooks/useEventDetail';
import { getEventTypeLabel, getStatusLabel, getStatusColor, getCurrencySymbol } from '@/utils/eventHelpers';

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [selectedVideo, setSelectedVideo] = useState<{src: string, title: string, description?: string} | null>(null);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);

  console.log('🔍 EventDetail - Event ID:', id);
  console.log('🔍 EventDetail - Current user:', user?.id);

  const { data: event, isLoading, error } = useEventDetail(id);
  const { data: applicationsCount } = useEventApplicationsCount(id);
  const { media, getMediaUrl } = useProfessionalMedia(event?.professional_profile_id);

  const handleVideoClick = (videoSrc: string, title: string, description?: string) => {
    setSelectedVideo({ src: videoSrc, title, description });
  };

  const handleAudioClick = (audioSrc: string) => {
    window.open(audioSrc, '_blank');
  };

  const handleRulesClick = () => {
    setIsRulesModalOpen(true);
  };

  if (isLoading) {
    return <EventDetailLoading />;
  }

  if (error) {
    console.error('❌ Event fetch error:', error);
    return <EventDetailError error={error} eventId={id} />;
  }

  if (!event) {
    console.warn('⚠️ No event found for ID:', id);
    return <EventDetailError eventId={id} />;
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
        <EventDetailMain
          event={event}
          media={media || []}
          getMediaUrl={getMediaUrl}
          onVideoClick={handleVideoClick}
          onAudioClick={handleAudioClick}
          onRulesClick={handleRulesClick}
        />

        {/* Barre latérale */}
        <div className="space-y-6">
          <EventSidebar
            event={event}
            applicationsCount={applicationsCount || 0}
            getCurrencySymbol={getCurrencySymbol}
            onRulesClick={handleRulesClick}
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
