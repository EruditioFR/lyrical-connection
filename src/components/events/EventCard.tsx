
import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, MapPin, Users, Euro, Clock } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Event, useArtistEventApplication } from '@/hooks/useEvents';
import { EventApplicationDialog } from './EventApplicationDialog';

interface EventCardProps {
  event: Event;
  showApplyButton?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({ event, showApplyButton = false }) => {
  const { data: application } = useArtistEventApplication(event.id);
  
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

  const getEventTypeColor = (type: string) => {
    const colors = {
      masterclass: 'border border-border bg-transparent text-muted-foreground',
      stage: 'border border-border bg-transparent text-muted-foreground',
      concours: 'border border-border bg-transparent text-muted-foreground',
      atelier: 'border border-border bg-transparent text-muted-foreground',
      conference: 'border border-border bg-transparent text-muted-foreground'
    };
    return colors[type as keyof typeof colors] || 'border border-border bg-transparent text-muted-foreground';
  };

  const isRegistrationOpen = () => {
    if (!event.registration_deadline) return true;
    return new Date(event.registration_deadline) > new Date();
  };

  const isFull = () => {
    if (!event.max_participants) return false;
    return (event.applications_count || 0) >= event.max_participants;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: 'En attente',
      waitlisted: 'Présélectionné(e)',
      accepted: 'Accepté(e)',
      rejected: 'Refusé(e)'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-warning/15 text-warning',
      waitlisted: 'bg-info/15 text-info',
      accepted: 'bg-success/15 text-success',
      rejected: 'bg-destructive/15 text-destructive'
    };
    return colors[status as keyof typeof colors] || 'bg-muted text-foreground';
  };

  return (
    <Card className="h-full flex flex-col">
      {event.image_url && (
        <div className="h-48 bg-cover bg-center rounded-t-lg" 
             style={{ backgroundImage: `url(${event.image_url})` }} />
      )}
      
      <CardHeader className="flex-shrink-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getEventTypeColor(event.event_type)}>
                {getEventTypeLabel(event.event_type)}
              </Badge>
              {event.is_featured && (
                <Badge variant="secondary">
                  Mis en avant
                </Badge>
              )}
            </div>
            <h3 className="text-lg font-semibold line-clamp-2">
              {event.title}
            </h3>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="space-y-3">
          {event.description && (
            <p className="text-sm text-muted-foreground line-clamp-3">
              {event.description}
            </p>
          )}

          <div className="space-y-2">
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>
                {format(new Date(event.start_date), 'dd MMMM yyyy', { locale: fr })}
                {event.start_date !== event.end_date && (
                  <> - {format(new Date(event.end_date), 'dd MMMM yyyy', { locale: fr })}</>
                )}
              </span>
            </div>

            {event.location && (
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>{event.location}</span>
              </div>
            )}

            {event.max_participants && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>
                  {event.applications_count || 0} / {event.max_participants} participants
                </span>
              </div>
            )}

            {event.price && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Euro className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>{event.price} {event.currency}</span>
              </div>
            )}

            {event.registration_deadline && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>
                  Inscription jusqu'au {format(new Date(event.registration_deadline), 'dd MMMM yyyy', { locale: fr })}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      {showApplyButton && (
        <CardFooter className="flex-shrink-0">
          {application ? (
            <Button 
              className="w-full"
              onClick={() => {/* Naviger vers les détails de l'événement */}}
            >
              <div className="flex flex-col items-center">
                <span className="font-medium">Inscrit(e)</span>
                <span className="text-xs opacity-90">Voir ma candidature</span>
              </div>
            </Button>
          ) : (
            <EventApplicationDialog event={event}>
              <Button 
                className="w-full" 
                disabled={!isRegistrationOpen() || isFull()}
              >
                {!isRegistrationOpen() ? 'Inscriptions fermées' : 
                 isFull() ? 'Complet' : 'S\'inscrire'}
              </Button>
            </EventApplicationDialog>
          )}
        </CardFooter>
      )}
    </Card>
  );
};
