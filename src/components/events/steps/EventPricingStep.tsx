
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Euro, Users } from 'lucide-react';

interface EventPricingStepProps {
  formData: any;
  handleInputChange: (field: string, value: string) => void;
  currencies: any[];
}

export const EventPricingStep: React.FC<EventPricingStepProps> = ({
  formData,
  handleInputChange,
  currencies
}) => {
  const [isFree, setIsFree] = React.useState(!formData.price || formData.price === '0');

  const handleFreeToggle = (checked: boolean) => {
    setIsFree(checked);
    if (checked) {
      handleInputChange('price', '0');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Tarification et participants</h3>
        <p className="text-muted-foreground mb-6">
          Définissez le prix et le nombre de participants pour votre événement
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Euro className="h-5 w-5" />
            Tarification
          </CardTitle>
          <CardDescription>
            Configurez le prix de votre événement
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="free-event"
              checked={isFree}
              onCheckedChange={handleFreeToggle}
            />
            <Label htmlFor="free-event">Événement gratuit</Label>
          </div>

          {!isFree && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Prix par participant</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Devise</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => handleInputChange('currency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map(currency => (
                      <SelectItem key={currency.value} value={currency.value}>
                        {currency.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Participants
          </CardTitle>
          <CardDescription>
            Gérez le nombre de participants à votre événement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="max_participants">Nombre maximum de participants</Label>
            <Input
              id="max_participants"
              type="number"
              value={formData.max_participants}
              onChange={(e) => handleInputChange('max_participants', e.target.value)}
              placeholder="Ex: 20 (laissez vide pour illimité)"
            />
            <p className="text-sm text-muted-foreground">
              Laissez vide si vous ne souhaitez pas limiter le nombre de participants
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
