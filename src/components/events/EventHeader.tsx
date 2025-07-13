
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Clock, MapPin } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
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
  const startDate = new Date(event.start_date);
  const endDate = new Date(event.end_date);
  const isSameDayEvent = isSameDay(startDate, endDate);

  const formatDateRange = () => {
    if (isSameDayEvent) {
      return format(startDate, 'dd MMMM yyyy', { locale: fr });
    } else {
      return `Du ${format(startDate, 'dd MMMM yyyy', { locale: fr })} au ${format(endDate, 'dd MMMM yyyy', { locale: fr })}`;
    }
  };

  const formatTimeRange = () => {
    if (isSameDayEvent) {
      return `${format(startDate, 'HH:mm', { locale: fr })} - ${format(endDate, 'HH:mm', { locale: fr })}`;
    } else {
      return `${format(startDate, 'HH:mm', { locale: fr })}`;
    }
  };

  return (
    <>
      {/* En-tête avec image de couverture et informations en surimpression */}
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
          {/* Overlay sombre pour améliorer la lisibilité */}
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        
        <div className="container mx-auto px-4 md:px-6 relative h-full flex flex-col justify-between py-6">
          {/* Bouton retour */}
          <div className="flex justify-start">
            <Button variant="outline" className="bg-background/80 hover:bg-background" asChild>
              <Link to="/mes-evenements">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Link>
            </Button>
          </div>

          {/* Informations principales en surimpression */}
          <div className="flex-1 flex flex-col justify-end">
            <div className="mb-4">
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline" className="text-sm bg-background/80 backdrop-blur-sm">
                  {getEventTypeLabel(event.event_type)}
                </Badge>
                <Badge className={`${getStatusColor(event.status)} backdrop-blur-sm`}>
                  {getStatusLabel(event.status)}
                </Badge>
                {event.is_featured && (
                  <Badge variant="secondary" className="bg-gold-500/90 text-white hover:bg-gold-600 text-sm backdrop-blur-sm">
                    Événement à ne pas manquer
                  </Badge>
                )}
              </div>
              
              <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4 text-white drop-shadow-lg">
                {event.title}
              </h1>
              
              <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 text-white/90 mb-2">
                <div className="flex items-center backdrop-blur-sm bg-black/20 rounded-lg px-3 py-2">
                  <Calendar className="h-5 w-5 mr-2" />
                  <span className="font-medium">{formatDateRange()}</span>
                </div>
                <div className="flex items-center backdrop-blur-sm bg-black/20 rounded-lg px-3 py-2">
                  <Clock className="h-5 w-5 mr-2" />
                  <span className="font-medium">{formatTimeRange()}</span>
                </div>
                {event.location && (
                  <div className="flex items-center backdrop-blur-sm bg-black/20 rounded-lg px-3 py-2">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span className="font-medium">{event.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EventHeader;
