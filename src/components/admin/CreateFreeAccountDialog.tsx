
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdminManagement } from '@/hooks/useAdminManagement';
import { useToast } from '@/hooks/use-toast';
import { voiceTypes } from '@/constants/voiceTypes';
import { countries } from '@/constants/countries';

interface CreateFreeAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultAccountType?: 'artist' | 'professional';
}

const CreateFreeAccountDialog = ({ open, onOpenChange, defaultAccountType }: CreateFreeAccountDialogProps) => {
  const { createFreeArtist, createFreeProfessional, isCreatingFreeArtist, isCreatingFreeProfessional } = useAdminManagement();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<'artist' | 'professional'>(defaultAccountType || 'artist');
  
  const [artistForm, setArtistForm] = useState({
    stage_name: '',
    bio: '',
    voice_type: '',
    contact_email: '',
    location: '',
    phone: '',
    website: '',
    nationality: '',
    experience_years: ''
  });

  const [professionalForm, setProfessionalForm] = useState({
    company_name: '',
    professional_role: '',
    bio: '',
    contact_email: '',
    location: '',
    phone: '',
    website: '',
    team_description: ''
  });

  const handleCreateArtist = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!artistForm.stage_name || !artistForm.contact_email) {
      toast({
        title: "Erreur",
        description: "Le nom de scène et l'email sont requis.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createFreeArtist(artistForm);
      setArtistForm({
        stage_name: '',
        bio: '',
        voice_type: '',
        contact_email: '',
        location: '',
        phone: '',
        website: '',
        nationality: '',
        experience_years: ''
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating artist:', error);
    }
  };

  const handleCreateProfessional = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!professionalForm.company_name || !professionalForm.contact_email || !professionalForm.professional_role) {
      toast({
        title: "Erreur",
        description: "Le nom de l'entreprise, l'email et le rôle sont requis.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createFreeProfessional(professionalForm);
      setProfessionalForm({
        company_name: '',
        professional_role: '',
        bio: '',
        contact_email: '',
        location: '',
        phone: '',
        website: '',
        team_description: ''
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating professional:', error);
    }
  };

  // Réinitialiser l'onglet actif quand defaultAccountType change
  React.useEffect(() => {
    if (defaultAccountType) {
      setActiveTab(defaultAccountType);
    }
  }, [defaultAccountType]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer un compte gratuit</DialogTitle>
          <DialogDescription>
            {defaultAccountType 
              ? `Créer un nouveau compte ${defaultAccountType === 'artist' ? 'artiste' : 'professionnel'} gratuit`
              : 'Créer un nouveau compte artiste ou professionnel gratuit'
            }
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'artist' | 'professional')} className="space-y-4">
          {!defaultAccountType && (
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="artist">Artiste</TabsTrigger>
              <TabsTrigger value="professional">Professionnel</TabsTrigger>
            </TabsList>
          )}

          <TabsContent value="artist" className="space-y-4">
            <form onSubmit={handleCreateArtist} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stage_name">Nom de scène *</Label>
                  <Input
                    id="stage_name"
                    value={artistForm.stage_name}
                    onChange={(e) => setArtistForm({ ...artistForm, stage_name: e.target.value })}
                    placeholder="Nom de scène"
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
                    placeholder="email@exemple.com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="voice_type">Type de voix</Label>
                  <Select value={artistForm.voice_type} onValueChange={(value) => setArtistForm({ ...artistForm, voice_type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un type de voix" />
                    </SelectTrigger>
                    <SelectContent>
                      {voiceTypes.map((voice) => (
                        <SelectItem key={voice} value={voice}>
                          {voice}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nationality">Nationalité</Label>
                  <Select value={artistForm.nationality} onValueChange={(value) => setArtistForm({ ...artistForm, nationality: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une nationalité" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Localisation</Label>
                  <Input
                    id="location"
                    value={artistForm.location}
                    onChange={(e) => setArtistForm({ ...artistForm, location: e.target.value })}
                    placeholder="Ville, Pays"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience_years">Années d'expérience</Label>
                  <Input
                    id="experience_years"
                    type="number"
                    value={artistForm.experience_years}
                    onChange={(e) => setArtistForm({ ...artistForm, experience_years: e.target.value })}
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    value={artistForm.phone}
                    onChange={(e) => setArtistForm({ ...artistForm, phone: e.target.value })}
                    placeholder="+33 1 23 45 67 89"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Site web</Label>
                  <Input
                    id="website"
                    value={artistForm.website}
                    onChange={(e) => setArtistForm({ ...artistForm, website: e.target.value })}
                    placeholder="https://monsite.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Biographie</Label>
                <Textarea
                  id="bio"
                  value={artistForm.bio}
                  onChange={(e) => setArtistForm({ ...artistForm, bio: e.target.value })}
                  placeholder="Décrivez votre parcours artistique..."
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

          <TabsContent value="professional" className="space-y-4">
            <form onSubmit={handleCreateProfessional} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Nom de l'entreprise *</Label>
                  <Input
                    id="company_name"
                    value={professionalForm.company_name}
                    onChange={(e) => setProfessionalForm({ ...professionalForm, company_name: e.target.value })}
                    placeholder="Nom de l'entreprise"
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
                    placeholder="email@exemple.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="professional_role">Rôle professionnel *</Label>
                <Select value={professionalForm.professional_role} onValueChange={(value) => setProfessionalForm({ ...professionalForm, professional_role: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="director">Directeur artistique</SelectItem>
                    <SelectItem value="agent">Agent</SelectItem>
                    <SelectItem value="casting_director">Directeur de casting</SelectItem>
                    <SelectItem value="producer">Producteur</SelectItem>
                    <SelectItem value="theater_manager">Directeur de théâtre</SelectItem>
                    <SelectItem value="festival_organizer">Organisateur de festival</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prof_location">Localisation</Label>
                  <Input
                    id="prof_location"
                    value={professionalForm.location}
                    onChange={(e) => setProfessionalForm({ ...professionalForm, location: e.target.value })}
                    placeholder="Ville, Pays"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prof_phone">Téléphone</Label>
                  <Input
                    id="prof_phone"
                    value={professionalForm.phone}
                    onChange={(e) => setProfessionalForm({ ...professionalForm, phone: e.target.value })}
                    placeholder="+33 1 23 45 67 89"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prof_website">Site web</Label>
                <Input
                  id="prof_website"
                  value={professionalForm.website}
                  onChange={(e) => setProfessionalForm({ ...professionalForm, website: e.target.value })}
                  placeholder="https://monentreprise.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prof_bio">Description de l'entreprise</Label>
                <Textarea
                  id="prof_bio"
                  value={professionalForm.bio}
                  onChange={(e) => setProfessionalForm({ ...professionalForm, bio: e.target.value })}
                  placeholder="Décrivez votre entreprise et vos activités..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="team_description">Description de l'équipe</Label>
                <Textarea
                  id="team_description"
                  value={professionalForm.team_description}
                  onChange={(e) => setProfessionalForm({ ...professionalForm, team_description: e.target.value })}
                  placeholder="Décrivez votre équipe..."
                  rows={2}
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
