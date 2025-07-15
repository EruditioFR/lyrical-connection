
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApplyToEvent, CreateApplicationData, Event } from '@/hooks/useEvents';
import { useArtistProfile } from '@/hooks/useArtistProfile';
import { Loader2 } from 'lucide-react';

interface EventApplicationDialogProps {
  event: Event;
  children: React.ReactNode;
}

export const EventApplicationDialog: React.FC<EventApplicationDialogProps> = ({
  event,
  children,
}) => {
  const [open, setOpen] = useState(false);
  const [motivation, setMotivation] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [specialRequirements, setSpecialRequirements] = useState('');

  const { profile: artistProfile } = useArtistProfile();
  const applyMutation = useApplyToEvent();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!artistProfile) return;

    const applicationData: CreateApplicationData = {
      event_id: event.id,
      motivation,
      experience_level: experienceLevel,
      special_requirements: specialRequirements || undefined,
    };

    try {
      await applyMutation.mutateAsync(applicationData);
      setOpen(false);
      // Reset form
      setMotivation('');
      setExperienceLevel('');
      setSpecialRequirements('');
    } catch (error) {
      // Error is handled by the hook
    }
  };

  if (!artistProfile) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>S'inscrire à {event.title}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="motivation">Lettre de motivation *</Label>
            <Textarea
              id="motivation"
              placeholder="Expliquez pourquoi vous souhaitez participer à cet événement..."
              value={motivation}
              onChange={(e) => setMotivation(e.target.value)}
              required
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience">Niveau d'expérience *</Label>
            <Select value={experienceLevel} onValueChange={setExperienceLevel} required>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez votre niveau" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="debutant">Débutant</SelectItem>
                <SelectItem value="intermediaire">Intermédiaire</SelectItem>
                <SelectItem value="avance">Avancé</SelectItem>
                <SelectItem value="professionnel">Professionnel</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="requirements">Besoins spéciaux ou commentaires</Label>
            <Textarea
              id="requirements"
              placeholder="Allergies, restrictions, matériel spécifique..."
              value={specialRequirements}
              onChange={(e) => setSpecialRequirements(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={applyMutation.isPending || !motivation || !experienceLevel}
              className="flex-1"
            >
              {applyMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Inscription...
                </>
              ) : (
                'S\'inscrire'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
