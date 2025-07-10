import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNotificationPreferences } from '@/hooks/useNotifications';
import { useState, useEffect } from 'react';

interface NotificationPreferencesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NotificationPreferencesDialog = ({ 
  open, 
  onOpenChange 
}: NotificationPreferencesDialogProps) => {
  const { preferences, updatePreferences, isLoading, isUpdating } = useNotificationPreferences();
  const [localPreferences, setLocalPreferences] = useState(preferences);

  useEffect(() => {
    if (preferences) {
      setLocalPreferences(preferences);
    }
  }, [preferences]);

  const handleSave = () => {
    if (localPreferences) {
      updatePreferences(localPreferences);
      onOpenChange(false);
    }
  };

  const handleToggle = (key: keyof typeof localPreferences, value: boolean) => {
    if (localPreferences) {
      setLocalPreferences({
        ...localPreferences,
        [key]: value
      });
    }
  };

  if (isLoading || !localPreferences) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="flex items-center justify-center py-8">
            <p>Chargement des préférences...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const PreferenceRow = ({ 
    title, 
    description, 
    emailKey, 
    pushKey, 
    inAppKey 
  }: {
    title: string;
    description: string;
    emailKey: keyof typeof localPreferences;
    pushKey: keyof typeof localPreferences;
    inAppKey: keyof typeof localPreferences;
  }) => (
    <div className="space-y-4">
      <div>
        <h4 className="font-medium">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="flex items-center space-x-2">
          <Switch
            id={`${emailKey}`}
            checked={localPreferences[emailKey] || false}
            onCheckedChange={(checked) => handleToggle(emailKey, checked)}
          />
          <Label htmlFor={`${emailKey}`} className="text-sm">Email</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id={`${pushKey}`}
            checked={localPreferences[pushKey] || false}
            onCheckedChange={(checked) => handleToggle(pushKey, checked)}
          />
          <Label htmlFor={`${pushKey}`} className="text-sm">Push</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id={`${inAppKey}`}
            checked={localPreferences[inAppKey] || false}
            onCheckedChange={(checked) => handleToggle(inAppKey, checked)}
          />
          <Label htmlFor={`${inAppKey}`} className="text-sm">Dans l'app</Label>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Préférences de notification</DialogTitle>
          <DialogDescription>
            Choisissez comment vous souhaitez être notifié pour chaque type d'événement.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Messages */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Messages</CardTitle>
              <CardDescription>
                Notifications pour les nouveaux messages et conversations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PreferenceRow
                title="Nouveaux messages"
                description="Recevoir une notification pour chaque nouveau message"
                emailKey="email_messages"
                pushKey="push_messages"
                inAppKey="in_app_messages"
              />
            </CardContent>
          </Card>

          {/* Applications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Candidatures</CardTitle>
              <CardDescription>
                Notifications relatives aux candidatures aux castings et événements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PreferenceRow
                title="Candidatures et réponses"
                description="Mises à jour sur le statut de vos candidatures"
                emailKey="email_applications"
                pushKey="push_applications"
                inAppKey="in_app_applications"
              />
            </CardContent>
          </Card>

          {/* Events */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Événements</CardTitle>
              <CardDescription>
                Notifications sur les événements et masterclasses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PreferenceRow
                title="Nouveaux événements"
                description="Notifications pour les nouveaux événements qui pourraient vous intéresser"
                emailKey="email_events"
                pushKey="push_events"
                inAppKey="in_app_events"
              />
            </CardContent>
          </Card>

          {/* Marketing */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Marketing</CardTitle>
              <CardDescription>
                Newsletters et promotions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Switch
                  id="email_marketing"
                  checked={localPreferences.email_marketing || false}
                  onCheckedChange={(checked) => handleToggle('email_marketing', checked)}
                />
                <Label htmlFor="email_marketing">
                  Recevoir des emails marketing et promotionnels
                </Label>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={isUpdating}>
            {isUpdating ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationPreferencesDialog;