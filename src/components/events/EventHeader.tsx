
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Clock, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface EventHeaderProps {
  event: any;
  getEventTypeLabel: (type: string) => string;
  getStatusLabel: (status: string) => string;
  getStatusColor: (status: string) => string;
}

const EventHeader: React.FC<EventHeaderProps> = ({
  event,
  getEventTypeLabel,
  getStatusLabel,
  getStatusColor
}) => {
  return (
    <>
      {/* En-tête avec image de couverture */}
      <div className="relative h-64 md:h-96 w-full">
        <div className="absolute inset-0">
          {event.image_url ? (
            <img 
              src={event.image_url} 
              alt={event.title} 
              className="w-full h-full object-cover object-top"
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

      {/* Titre et informations principales */}
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="mb-8">
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
      </div>
    </>
  );
};

export default EventHeader;
