
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import ArtistProfileForm from '@/components/profile/ArtistProfileForm';
import { useArtistProfile } from '@/hooks/useArtistProfile';

interface Account {
  id: string;
  user_id: string;
  stage_name?: string;
  contact_email: string;
  created_at: string;
  type: 'artist' | 'professional';
  bio?: string;
  voice_type?: string;
  location?: string;
  phone?: string;
  website?: string;
  nationality?: string;
  experience_years?: number;
  birth_date?: string;
  gender?: string;
  spoken_languages?: string[];
  project_description?: string;
  repertoire?: string[];
  cover_image_url?: string;
}

interface AdminArtistProfileDialogProps {
  account: Account;
  onAccountUpdated: () => void;
}

const AdminArtistProfileDialog = ({ account, onAccountUpdated }: AdminArtistProfileDialogProps) => {
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
    onAccountUpdated();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1">
          <Edit className="h-3 w-3" />
          Modifier
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Modifier le profil artiste - {account.stage_name}</DialogTitle>
        </DialogHeader>
        <div className="p-6 pt-0 overflow-y-auto max-h-[80vh]">
          <ArtistProfileForm />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminArtistProfileDialog;
