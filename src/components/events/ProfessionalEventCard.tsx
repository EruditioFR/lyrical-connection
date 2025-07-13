
import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, MapPin, Users, Edit, Eye, MoreHorizontal, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ProfessionalEvent } from '@/hooks/useEvents';
import { Link } from 'react-router-dom';

interface ProfessionalEventCardProps {
  event: ProfessionalEvent;
  onEdit: (event: ProfessionalEvent) => void;
}

export const ProfessionalEventCard: React.FC<ProfessionalEventCardProps> = ({ 
  event, 
  onEdit 
}) => {
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

  return (
    <Card className="h-full">
      {event.image_url && (
        <div className="w-full h-48 overflow-hidden rounded-t-lg">
          <img 
            src={event.image_url} 
            alt={event.title}
            className="w-full h-full object-cover object-top"
          />
        </div>
      )}
      
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">
                {getEventTypeLabel(event.event_type)}
              </Badge>
              <Badge className={getStatusColor(event.status)}>
                {getStatusLabel(event.status)}
              </Badge>
            </div>
            <h3 className="font-semibold line-clamp-2">
              <Link 
                to={`/evenements/${event.id}`}
                className="hover:text-primary transition-colors"
              >
                {event.title}
              </Link>
            </h3>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to={`/evenements/${event.id}`}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Voir l'événement
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(event)}>
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={`/evenements/${event.id}/inscriptions`}>
                  <Eye className="h-4 w-4 mr-2" />
                  Voir les inscriptions
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {event.description && (
          <p className="text-sm text-gray-600 line-clamp-3">
            {event.description}
          </p>
        )}

        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>
              {format(new Date(event.start_date), 'dd MMMM yyyy', { locale: fr })}
            </span>
          </div>

          {event.location && (
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>{event.location}</span>
            </div>
          )}

          <div className="flex items-center text-sm text-gray-600">
            <Users className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>
              {event.applications_count || 0} inscription{(event.applications_count || 0) > 1 ? 's' : ''}
              {event.max_participants && ` / ${event.max_participants} max`}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <div className="flex gap-2 w-full">
          <Button 
            variant="outline" 
            size="sm" 
            asChild
            className="flex-1"
          >
            <Link to={`/evenements/${event.id}`}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Voir
            </Link>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onEdit(event)}
            className="flex-1"
          >
            <Edit className="h-4 w-4 mr-2" />
            Modifier
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
