
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import EventOrganizer from './EventOrganizer';
import EventContentSection from './EventContentSection';
import EventMediaGallery from './EventMediaGallery';
import EventLocation from './EventLocation';
import { EventWithRules } from '@/types/event';

interface EventDetailMainProps {
  event: EventWithRules;
  media: any[];
  getMediaUrl: (filePath: string) => string;
  onVideoClick: (videoSrc: string, title: string, description?: string) => void;
  onAudioClick: (audioSrc: string) => void;
  onRulesClick: () => void;
}

const EventDetailMain: React.FC<EventDetailMainProps> = ({
  event,
  media,
  getMediaUrl,
  onVideoClick,
  onAudioClick,
  onRulesClick
}) => {
  const hasRules = event?.participation_rules || event?.code_of_conduct || 
                   event?.cancellation_policy || event?.liability_waiver;

  return (
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
        onVideoClick={onVideoClick}
        onAudioClick={onAudioClick}
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
            <p className="text-white mb-4">
              Cet événement dispose d'un règlement spécifique incluant les conditions de participation, 
              le code de conduite et la politique d'annulation.
            </p>
            <Button 
              variant="outline" 
              onClick={onRulesClick}
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
  );
};

export default EventDetailMain;
