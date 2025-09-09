
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Users, Share2, FileText, Calendar, UserPlus } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { EventApplicationDialog } from './EventApplicationDialog';

interface EventSidebarProps {
  event: any;
  applicationsCount: number;
  getCurrencySymbol: (currency: string) => string;
  onRulesClick?: () => void;
  isArtist?: boolean;
  artistApplication?: any;
}

const EventSidebar: React.FC<EventSidebarProps> = ({
  event,
  applicationsCount,
  getCurrencySymbol,
  onRulesClick,
  isArtist,
  artistApplication
}) => {
  const hasRules = event?.participation_rules || event?.code_of_conduct || 
                   event?.cancellation_policy || event?.liability_waiver;

  return (
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
              <span className="font-medium">{event.max_participants - applicationsCount} / {event.max_participants}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Inscriptions</span>
            <span className="font-medium">{applicationsCount}</span>
          </div>
        </div>
        
        <div className="space-y-3">
          {/* Si c'est un artiste et qu'il a postulé, afficher les infos de candidature */}
          {isArtist && artistApplication ? (
            <Card className="bg-muted/50">
              <CardContent className="p-4 space-y-3">
                <h4 className="font-medium text-sm">Mon inscription</h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  Inscrit le {format(new Date(artistApplication.applied_at), 'dd MMMM yyyy', { locale: fr })}
                </div>
                {event.results_published && (
                  <Badge className={
                    artistApplication.status === 'accepted' ? 'bg-green-100 text-green-800' :
                    artistApplication.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    artistApplication.status === 'waitlisted' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }>
                    {artistApplication.status === 'accepted' ? 'Accepté(e)' :
                     artistApplication.status === 'rejected' ? 'Refusé(e)' :
                     artistApplication.status === 'waitlisted' ? 'Présélectionné(e)' :
                     'En attente'}
                  </Badge>
                )}
                {!event.results_published && (
                  <Badge variant="secondary">En attente</Badge>
                )}
              </CardContent>
            </Card>
          ) : isArtist && !artistApplication && event.status === 'published' ? (
            // Si artiste et pas encore inscrit, afficher le bouton d'inscription
            <EventApplicationDialog event={event}>
              <Button className="w-full bg-gradient-to-r from-lyrical-600 to-gold-500 hover:from-lyrical-700 hover:to-gold-600 text-white">
                <UserPlus className="w-4 h-4 mr-2" />
                S'inscrire à l'événement
              </Button>
            </EventApplicationDialog>
          ) : !isArtist && (
            <Button className="w-full" asChild>
              <Link to={`/evenements/${event.id}/inscriptions`}>
                <Users className="w-4 h-4 mr-2" />
                Voir les inscriptions
              </Link>
            </Button>
          )}
          
          {hasRules && onRulesClick && (
            <Button 
              variant="outline" 
              className="w-full gap-2"
              onClick={onRulesClick}
            >
              <FileText className="w-4 h-4" />
              Consulter le règlement
            </Button>
          )}
          
          <Button variant="outline" className="w-full gap-2">
            <Share2 className="w-4 h-4" />
            Partager
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventSidebar;
