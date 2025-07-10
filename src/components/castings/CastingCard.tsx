
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, Euro, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Tables } from '@/integrations/supabase/types';

type Casting = Tables<'castings'>;

interface CastingCardProps {
  casting: Casting;
}

const CastingCard: React.FC<CastingCardProps> = ({ casting }) => {
  const navigate = useNavigate();

  const formatDate = (date: string | null) => {
    if (!date) return 'Non précisée';
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const getProductionTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      opera: 'Opéra',
      operetta: 'Opérette',
      concert: 'Concert',
      competition: 'Concours',
      masterclass: 'Masterclass',
      other: 'Autre'
    };
    return labels[type] || type;
  };

  const getCompensationLabel = (type: string | null) => {
    if (!type) return null;
    const labels: { [key: string]: string } = {
      paid: 'Rémunéré',
      unpaid: 'Non rémunéré',
      travel_covered: 'Transport couvert',
      accommodation_covered: 'Hébergement couvert'
    };
    return labels[type] || type;
  };

  return (
    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/castings/${casting.id}`)}>
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">{casting.title}</h3>
          {casting.is_featured && (
            <Badge variant="destructive" className="ml-2">
              Mis en avant
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {casting.location}
          </div>
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            {casting.view_count || 0}
          </div>
        </div>

        <Badge variant="outline" className="w-fit">
          {getProductionTypeLabel(casting.production_type)}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        {casting.description && (
          <p className="text-sm text-gray-600 line-clamp-3">
            {casting.description}
          </p>
        )}

        <div className="space-y-2">
          {casting.venue && (
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-gray-400" />
              <span>{casting.venue}</span>
            </div>
          )}

          {casting.application_deadline && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span>Candidature avant le {formatDate(casting.application_deadline)}</span>
            </div>
          )}

          {casting.compensation_type && (
            <div className="flex items-center gap-2 text-sm">
              <Euro className="h-4 w-4 text-gray-400" />
              <span>
                {getCompensationLabel(casting.compensation_type)}
                {casting.compensation_amount && ` - ${casting.compensation_amount}€`}
              </span>
            </div>
          )}
        </div>

        {(casting.required_voice_types && casting.required_voice_types.length > 0) && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-500">Types de voix recherchés :</p>
            <div className="flex flex-wrap gap-1">
              {casting.required_voice_types.slice(0, 3).map((voice, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {voice}
                </Badge>
              ))}
              {casting.required_voice_types.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{casting.required_voice_types.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        <div className="pt-2">
          <Button 
            className="w-full bg-gradient-to-r from-lyrical-600 to-gold-500 hover:from-lyrical-700 hover:to-gold-600"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/castings/${casting.id}`);
            }}
          >
            Voir les détails
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CastingCard;
