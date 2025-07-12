
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Star, Crown, Calendar, MapPin } from 'lucide-react';
import { useProfessionalEvents } from '@/hooks/useEvents';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const EventPromotionManager = () => {
  const { data: events = [] } = useProfessionalEvents();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Filtrer les événements publiés et non promus
  const availableEvents = events.filter(event => 
    event.status === 'published' && !event.is_featured
  );

  // Événements actuellement promus
  const promotedEvents = events.filter(event => event.is_featured);

  const promoteEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await supabase
        .from('professional_events')
        .update({ is_featured: true })
        .eq('id', eventId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professionalEvents'] });
      queryClient.invalidateQueries({ queryKey: ['publicEvents'] });
      toast({
        title: 'Événement promu',
        description: 'Votre événement apparaîtra maintenant en page d\'accueil.',
      });
      setIsDialogOpen(false);
      setSelectedEventId('');
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: 'Impossible de promouvoir l\'événement.',
        variant: 'destructive',
      });
    },
  });

  const unpromoteEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await supabase
        .from('professional_events')
        .update({ is_featured: false })
        .eq('id', eventId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professionalEvents'] });
      queryClient.invalidateQueries({ queryKey: ['publicEvents'] });
      toast({
        title: 'Promotion arrêtée',
        description: 'Votre événement n\'apparaîtra plus en page d\'accueil.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'arrêter la promotion.',
        variant: 'destructive',
      });
    },
  });

  const handlePromoteEvent = () => {
    if (selectedEventId) {
      promoteEventMutation.mutate(selectedEventId);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-gold-500" />
            Promotion d'événements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gradient-to-r from-gold-50 to-lyrical-50 p-4 rounded-lg border border-gold-200">
            <h3 className="font-semibold text-gold-700 mb-2">Service de promotion</h3>
            <p className="text-sm text-gold-600 mb-3">
              Mettez en avant vos événements sur la page d'accueil du site pour plus de visibilité.
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-gold-100 text-gold-700">
                50€/mois par événement
              </Badge>
            </div>
          </div>

          {promotedEvents.length > 0 && (
            <div>
              <h4 className="font-medium mb-3">Événements actuellement promus</h4>
              <div className="space-y-2">
                {promotedEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 bg-gold-50 rounded-lg border border-gold-200">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Star className="h-4 w-4 text-gold-500" />
                        <span className="font-medium">{event.title}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(event.start_date), 'dd MMM yyyy', { locale: fr })}
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.location}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => unpromoteEventMutation.mutate(event.id)}
                      disabled={unpromoteEventMutation.isPending}
                    >
                      Arrêter la promotion
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {availableEvents.length > 0 ? (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <Crown className="h-4 w-4 mr-2" />
                  Promouvoir un événement
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Promouvoir un événement</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Sélectionnez l'événement que vous souhaitez promouvoir sur la page d'accueil.
                  </p>
                  
                  <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un événement" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableEvents.map((event) => (
                        <SelectItem key={event.id} value={event.id}>
                          <div>
                            <div className="font-medium">{event.title}</div>
                            <div className="text-xs text-muted-foreground">
                              {format(new Date(event.start_date), 'dd MMMM yyyy', { locale: fr })}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="bg-muted p-3 rounded-lg">
                    <div className="text-sm">
                      <div className="font-medium mb-1">Tarification :</div>
                      <div>50€ par mois par événement promu</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        La facturation sera automatique et le paiement sera prélevé mensuellement.
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handlePromoteEvent}
                      disabled={!selectedEventId || promoteEventMutation.isPending}
                      className="flex-1"
                    >
                      {promoteEventMutation.isPending ? 'Traitement...' : 'Confirmer la promotion'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Crown className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun événement disponible pour la promotion</p>
              <p className="text-sm">Publiez d'abord vos événements pour pouvoir les promouvoir.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
