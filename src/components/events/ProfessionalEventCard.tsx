
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, MapPin, Users, Euro, Edit, Eye, ClipboardList } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ProfessionalEvent {
  id: string;
  title: string;
  description: string | null;
  event_type: string;
  status: string;
  start_date: string;
  end_date: string;
  address: string | null;
  price: number | null;
  currency: string;
  max_participants: number | null;
  image_url: string | null;
  applications_count?: number;
}

interface ProfessionalEventCardProps {
  event: ProfessionalEvent;
  onEdit?: () => void;
}

export const ProfessionalEventCard: React.FC<ProfessionalEventCardProps> = ({ event, onEdit }) => {
  const navigate = useNavigate();

  const getStatusBorder = (status: string) => {
    switch (status) {
      case 'draft':
        return 'border-l-4 border-l-gray-400';
      case 'published':
        return 'border-l-4 border-l-green-500';
      case 'completed':
        return 'border-l-4 border-l-blue-500';
      default:
        return '';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'd MMMM yyyy', { locale: fr });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Date inconnue';
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit();
    } else {
      navigate(`/evenements/${event.id}/modifier`);
    }
  };

  const handleViewApplications = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/professional/event-applications?eventId=${event.id}`);
  };

  const handleViewEvaluations = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/concours/${event.id}/synthese`);
  };

  return (
    <Card className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${getStatusBorder(event.status)}`}>
      <CardHeader className="p-0">
        {event.image_url ? (
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-48 object-cover object-center rounded-t-md"
          />
        ) : (
          <div className="w-full h-48 bg-gray-100 rounded-t-md flex items-center justify-center">
            <span className="text-gray-500">Aucune image</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold line-clamp-1">{event.title}</h3>
          <Badge variant="secondary">{event.event_type}</Badge>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{event.description || 'Aucune description'}</p>

        <div className="mt-3 space-y-1 text-sm">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            <span>{formatDate(event.start_date)} - {formatDate(event.end_date)}</span>
          </div>
          {event.address && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="line-clamp-1">{event.address}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Euro className="h-4 w-4" />
            <span>{event.price ? `${event.price} ${event.currency}` : 'Gratuit'}</span>
          </div>
          {event.max_participants && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{event.max_participants} participants maximum</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleEdit}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Modifier
          </Button>
          
          {event.status === 'published' && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewApplications}
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Candidatures ({event.applications_count || 0})
            </Button>
          )}
          
          {event.event_type === 'concours' && event.status === 'published' && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewEvaluations}
              className="flex items-center gap-2"
            >
              <ClipboardList className="h-4 w-4" />
              Évaluations
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/evenements/${event.id}`);
            }}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            Voir
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
