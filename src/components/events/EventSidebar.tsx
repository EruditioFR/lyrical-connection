
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Users, Share2, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface EventSidebarProps {
  event: any;
  applicationsCount: number;
  getCurrencySymbol: (currency: string) => string;
  onRulesClick?: () => void;
}

const EventSidebar: React.FC<EventSidebarProps> = ({
  event,
  applicationsCount,
  getCurrencySymbol,
  onRulesClick
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
          <Button className="w-full" asChild>
            <Link to={`/evenements/${event.id}/inscriptions`}>
              <Users className="w-4 h-4 mr-2" />
              Voir les inscriptions
            </Link>
          </Button>
          
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
