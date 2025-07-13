
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, MapPin, Euro, Users, Image, FileText } from 'lucide-react';

interface EventReviewStepProps {
  formData: any;
  handleInputChange: (field: string, value: string) => void;
  startDate?: Date;
  endDate?: Date;
  registrationDeadline?: Date;
  eventTypes: any[];
  categories: any[];
  currencies: any[];
}

export const EventReviewStep: React.FC<EventReviewStepProps> = ({
  formData,
  handleInputChange,
  startDate,
  endDate,
  registrationDeadline,
  eventTypes,
  categories,
  currencies
}) => {
  const eventType = eventTypes.find(type => type.value === formData.event_type);
  const category = categories.find(cat => cat.id === formData.category_id);
  const currency = currencies.find(curr => curr.value === formData.currency);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Révision et publication</h3>
        <p className="text-muted-foreground mb-6">
          Vérifiez toutes les informations avant de publier votre événement
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Statut de publication</Label>
        <Select
          value={formData.status}
          onValueChange={(value) => handleInputChange('status', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">💾 Brouillon - Sauvegarder sans publier</SelectItem>
            <SelectItem value="published">🌟 Publié - Visible par tous</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          Vous pouvez sauvegarder en brouillon et publier plus tard
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Informations générales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-sm font-medium">Titre</Label>
              <p className="text-sm">{formData.title || 'Non renseigné'}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Type</Label>
              <p className="text-sm">{eventType?.label || 'Non renseigné'}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Catégorie</Label>
              <p className="text-sm">{category?.name || 'Non renseignée'}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Description</Label>
              <p className="text-sm text-muted-foreground">
                {formData.description ? 
                  (formData.description.length > 100 ? 
                    formData.description.substring(0, 100) + '...' : 
                    formData.description
                  ) : 
                  'Non renseignée'
                }
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Dates et horaires
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-sm font-medium">Début</Label>
              <p className="text-sm">
                {startDate ? format(startDate, "EEEE d MMMM yyyy", { locale: fr }) : 'Non renseigné'}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">Fin</Label>
              <p className="text-sm">
                {endDate ? format(endDate, "EEEE d MMMM yyyy", { locale: fr }) : 'Non renseigné'}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">Limite d'inscription</Label>
              <p className="text-sm">
                {registrationDeadline ? 
                  format(registrationDeadline, "EEEE d MMMM yyyy", { locale: fr }) : 
                  'Non renseignée'
                }
              </p>
            </div>
            {startDate && endDate && (
              <Badge variant="secondary" className="text-xs">
                Durée: {Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} jour(s)
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Lieu
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-sm font-medium">Adresse</Label>
              <p className="text-sm">{formData.address || 'Non renseignée'}</p>
            </div>
            {formData.latitude && formData.longitude && (
              <Badge variant="outline" className="text-xs">
                Géolocalisé
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Euro className="h-4 w-4" />
              Tarification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-sm font-medium">Prix</Label>
              <p className="text-sm">
                {formData.price && parseFloat(formData.price) > 0 ? 
                  `${formData.price} ${currency?.symbol || '€'}` : 
                  'Gratuit'
                }
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">Participants max</Label>
              <p className="text-sm">
                {formData.max_participants || 'Illimité'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {formData.image_url && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              Logo de l'événement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <img
              src={formData.image_url}
              alt="Logo de l'événement"
              className="h-32 w-32 object-cover object-top rounded border"
            />
          </CardContent>
        </Card>
      )}

      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h4 className="font-medium text-blue-900 mb-2">✨ Prêt à publier ?</h4>
        <p className="text-sm text-blue-800">
          Vérifiez que toutes les informations sont correctes. Vous pourrez modifier votre événement après publication.
        </p>
      </div>
    </div>
  );
};
