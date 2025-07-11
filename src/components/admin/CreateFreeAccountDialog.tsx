
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Briefcase } from 'lucide-react';
import { useAdminManagement } from '@/hooks/useAdminManagement';

interface CreateFreeAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const professionalRoles = [
  { value: 'casting_director', label: 'Directeur de casting' },
  { value: 'vocal_coach', label: 'Coach vocal' },
  { value: 'conductor', label: 'Chef d\'orchestre' },
  { value: 'opera_house_manager', label: 'Responsable de maison d\'opéra' },
  { value: 'voice_teacher', label: 'Professeur de chant' },
  { value: 'artistic_agent', label: 'Agent artistique' },
  { value: 'producer', label: 'Producteur' },
  { value: 'competition_director', label: 'Directeur de concours' }
];

const CreateFreeAccountDialog = ({ open, onOpenChange }: CreateFreeAccountDialogProps) => {
  const [activeTab, setActiveTab] = useState('artist');
  const { createFreeArtist, createFreeProfessional, isCreatingFreeArtist, isCreatingFreeProfessional } = useAdminManagement();

  const [artistForm, setArtistForm] = useState({
    stage_name: '',
    bio: '',
    voice_type: '',
    contact_email: '',
  });

  const [professionalForm, setProfessionalForm] = useState({
    company_name: '',
    professional_role: '',
    bio: '',
    contact_email: '',
  });

  const handleCreateArtist = (e: React.FormEvent) => {
    e.preventDefault();
    createFreeArtist(artistForm);
    setArtistForm({ stage_name: '', bio: '', voice_type: '', contact_email: '' });
    onOpenChange(false);
  };

  const handleCreateProfessional = (e: React.FormEvent) => {
    e.preventDefault();
    createFreeProfessional(professionalForm);
    setProfessionalForm({ company_name: '', professional_role: '', bio: '', contact_email: '' });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Créer un compte gratuit</DialogTitle>
          <DialogDescription>
            Créez un compte gratuit pour un artiste ou un professionnel
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="artist" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Artiste
            </TabsTrigger>
            <TabsTrigger value="professional" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Professionnel
            </TabsTrigger>
          </TabsList>

          <TabsContent value="artist">
            <form onSubmit={handleCreateArtist} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stage_name">Nom de scène *</Label>
                  <Input
                    id="stage_name"
                    value={artistForm.stage_name}
                    onChange={(e) => setArtistForm({ ...artistForm, stage_name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_email">Email de contact *</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={artistForm.contact_email}
                    onChange={(e) => setArtistForm({ ...artistForm, contact_email: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="voice_type">Type de voix</Label>
                <Input
                  id="voice_type"
                  value={artistForm.voice_type}
                  onChange={(e) => setArtistForm({ ...artistForm, voice_type: e.target.value })}
                  placeholder="ex: Soprano, Ténor, Baryton..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Biographie</Label>
                <Textarea
                  id="bio"
                  value={artistForm.bio}
                  onChange={(e) => setArtistForm({ ...artistForm, bio: e.target.value })}
                  placeholder="Biographie de l'artiste..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={isCreatingFreeArtist}>
                  {isCreatingFreeArtist ? 'Création...' : 'Créer le compte artiste'}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="professional">
            <form onSubmit={handleCreateProfessional} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Nom de société *</Label>
                  <Input
                    id="company_name"
                    value={professionalForm.company_name}
                    onChange={(e) => setProfessionalForm({ ...professionalForm, company_name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prof_contact_email">Email de contact *</Label>
                  <Input
                    id="prof_contact_email"
                    type="email"
                    value={professionalForm.contact_email}
                    onChange={(e) => setProfessionalForm({ ...professionalForm, contact_email: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="professional_role">Métier *</Label>
                <Select 
                  value={professionalForm.professional_role} 
                  onValueChange={(value) => setProfessionalForm({ ...professionalForm, professional_role: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un métier" />
                  </SelectTrigger>
                  <SelectContent>
                    {professionalRoles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prof_bio">Description</Label>
                <Textarea
                  id="prof_bio"
                  value={professionalForm.bio}
                  onChange={(e) => setProfessionalForm({ ...professionalForm, bio: e.target.value })}
                  placeholder="Description du professionnel..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={isCreatingFreeProfessional}>
                  {isCreatingFreeProfessional ? 'Création...' : 'Créer le compte professionnel'}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CreateFreeAccountDialog;
