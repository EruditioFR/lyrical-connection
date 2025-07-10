
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSendInvitation } from '@/hooks/useInvitations';
import { useCastings } from '@/hooks/useCastings';
import { UserPlus } from 'lucide-react';

interface InviteArtistDialogProps {
  artistId: string;
  artistName: string;
  trigger?: React.ReactNode;
}

const InviteArtistDialog: React.FC<InviteArtistDialogProps> = ({
  artistId,
  artistName,
  trigger
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCasting, setSelectedCasting] = useState('');
  const [message, setMessage] = useState('');
  const sendInvitationMutation = useSendInvitation();
  const { castings } = useCastings();

  // Filtrer les castings actifs de l'utilisateur
  const myCastings = castings.filter(casting => casting.is_active);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCasting || !message.trim()) {
      return;
    }

    try {
      await sendInvitationMutation.mutateAsync({
        casting_id: selectedCasting,
        artist_profile_id: artistId,
        message: message.trim(),
      });
      
      setIsOpen(false);
      setSelectedCasting('');
      setMessage('');
    } catch (error) {
      console.error('Error sending invitation:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <UserPlus className="h-4 w-4 mr-2" />
            Inviter
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Inviter {artistName}</DialogTitle>
          <DialogDescription>
            Invitez cet artiste à postuler pour l'un de vos castings.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="casting">Casting</Label>
            <Select value={selectedCasting} onValueChange={setSelectedCasting} required>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un casting" />
              </SelectTrigger>
              <SelectContent>
                {myCastings.map((casting) => (
                  <SelectItem key={casting.id} value={casting.id}>
                    {casting.title} - {casting.production_type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message">Message d'invitation</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Personnalisez votre invitation..."
              rows={4}
              required
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={sendInvitationMutation.isPending || !selectedCasting || !message.trim()}
            >
              {sendInvitationMutation.isPending ? 'Envoi...' : 'Envoyer l\'invitation'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InviteArtistDialog;
