
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useSendContact } from '@/hooks/useProfessionalContacts';
import { MessageSquare } from 'lucide-react';

interface ContactArtistDialogProps {
  artistId: string;
  artistName: string;
  trigger?: React.ReactNode;
}

const ContactArtistDialog: React.FC<ContactArtistDialogProps> = ({
  artistId,
  artistName,
  trigger
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const sendContactMutation = useSendContact();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject.trim() || !message.trim()) {
      return;
    }

    try {
      await sendContactMutation.mutateAsync({
        artist_profile_id: artistId,
        subject: subject.trim(),
        message: message.trim(),
      });
      
      setIsOpen(false);
      setSubject('');
      setMessage('');
    } catch (error) {
      console.error('Error sending contact:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <MessageSquare className="h-4 w-4 mr-2" />
            Contacter
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Contacter {artistName}</DialogTitle>
          <DialogDescription>
            Envoyez un message direct à cet artiste pour discuter d'opportunités professionnelles.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Sujet</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Objet de votre message..."
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Votre message..."
              rows={6}
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
              disabled={sendContactMutation.isPending || !subject.trim() || !message.trim()}
            >
              {sendContactMutation.isPending ? 'Envoi...' : 'Envoyer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ContactArtistDialog;
