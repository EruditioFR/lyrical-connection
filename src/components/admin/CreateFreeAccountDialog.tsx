
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Briefcase, Mail } from 'lucide-react';
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

const voiceTypes = [
  'Soprano colorature',
  'Soprano lyrique',
  'Soprano dramatique',
  'Mezzo-soprano',
  'Contralto',
  'Ténor léger',
  'Ténor lyrique',
  'Ténor dramatique',
  'Baryton',
  'Basse-baryton',
  'Basse'
];

const CreateFreeAccountDialog = ({ open, onOpenChange }: CreateFreeAccountDialogProps) => {
  const [activeTab, setActiveTab] = useState('artist');
  const { createFreeArtist, createFreeProfessional, isCreatingFreeArtist, isCreatingFreeProfessional } = useAdminManagement();

  const [artistForm, setArtistForm] = useState({
    stage_name: '',
    bio: '',
    voice_type: '',
    contact_email: '',
    location: '',
    phone: '',
    website: '',
    nationality: '',
    experience_years: '',
  });

  const [professionalForm, setProfessionalForm] = useState({
    company_name: '',
    professional_role: '',
    bio: '',
    contact_email: '',
    location: '',
    phone: '',
    website: '',
    team_description: '',
  });

  const resetForms = () => {
    setArtistForm({
      stage_name: '',
      bio: '',
      voice_type: '',
      contact_email: '',
      location: '',
      phone: '',
      website: '',
      nationality: '',
      experience_years: '',
    });
    setProfessionalForm({
      company_name: '',
      professional_role: '',
      bio: '',
      contact_email: '',
      location: '',
      phone: '',
      website: '',
      team_description: '',
    });
  };

  const handleCreateArtist = (e: React.FormEvent) => {
    e.preventDefault();
    createFreeArtist(artistForm);
    resetForms();
    onOpenChange(false);
  };

  const handleCreateProfessional = (e: React.FormEvent) => {
    e.preventDefault();
    createFreeProfessional(professionalForm);
    resetForms();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Créer un compte gratuit
          </DialogTitle>
          <DialogDescription>
            Créez un compte gratuit complet pour un artiste ou un professionnel avec toutes les informations nécessaires
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="artist" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Compte Artiste
            </TabsTrigger>
            <TabsTrigger value="professional" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Compte Professionnel
            </TabsTrigger>
          </TabsList>

          <TabsContent value="artist">
            <form onSubmit={handleCreateArtist} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stage_name">Nom de scène *</Label>
                  <Input
                    id="stage_name"
                    value={artistForm.stage_name}
                    onChange={(e) => setArtistForm({ ...artistForm, stage_name: e.target.value })}
                    required
                    placeholder="Nom d'artiste"
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
                    placeholder="contact@exemple.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="voice_type">Type de voix</Label>
                  <Select 
                    value={artistForm.voice_type} 
                    onValueChange={(value) => setArtistForm({ ...artistForm, voice_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un type de voix" />
                    </SelectTrigger>
                    <SelectContent>
                      {voiceTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nationality">Nationalité</Label>
                  <Input
                    id="nationality"
                    value={artistForm.nationality}
                    onChange={(e) => setArtistForm({ ...artistForm, nationality: e.target.value })}
                    placeholder="Française, Italienne..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Localisation</Label>
                  <Input
                    id="location"
                    value={artistForm.location}
                    onChange={(e) => setArtistForm({ ...artistForm, location: e.target.value })}
                    placeholder="Paris, France"
                  />
                </div>
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
                  <Label htmlFor="experience_years">Années d'expérience</Label>
                  <Input
                    id="experience_years"
                    type="number"
                    min="0"
                    value={artistForm.experience_years}
                    onChange={(e) => setArtistForm({ ...artistForm, experience_years: e.target.value })}
                    placeholder="5"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Site web</Label>
                <Input
                  id="website"
                  type="url"
                  value={artistForm.website}
                  onChange={(e) => setArtistForm({ ...artistForm, website: e.target.value })}
                  placeholder="https://www.monsite.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Biographie</Label>
                <Textarea
                  id="bio"
                  value={artistForm.bio}
                  onChange={(e) => setArtistForm({ ...artistForm, bio: e.target.value })}
                  placeholder="Biographie professionnelle de l'artiste..."
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
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
            <form onSubmit={handleCreateProfessional} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Nom de société *</Label>
                  <Input
                    id="company_name"
                    value={professionalForm.company_name}
                    onChange={(e) => setProfessionalForm({ ...professionalForm, company_name: e.target.value })}
                    required
                    placeholder="Nom de la société"
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
                    placeholder="contact@entreprise.com"
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prof_location">Localisation</Label>
                  <Input
                    id="prof_location"
                    value={professionalForm.location}
                    onChange={(e) => setProfessionalForm({ ...professionalForm, location: e.target.value })}
                    placeholder="Paris, France"
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
                <div className="space-y-2">
                  <Label htmlFor="prof_website">Site web</Label>
                  <Input
                    id="prof_website"
                    type="url"
                    value={professionalForm.website}
                    onChange={(e) => setProfessionalForm({ ...professionalForm, website: e.target.value })}
                    placeholder="https://www.entreprise.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="team_description">Description de l'équipe</Label>
                <Textarea
                  id="team_description"
                  value={professionalForm.team_description}
                  onChange={(e) => setProfessionalForm({ ...professionalForm, team_description: e.target.value })}
                  placeholder="Description de l'équipe et des collaborateurs..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prof_bio">Description de l'entreprise</Label>
                <Textarea
                  id="prof_bio"
                  value={professionalForm.bio}
                  onChange={(e) => setProfessionalForm({ ...professionalForm, bio: e.target.value })}
                  placeholder="Description de l'entreprise et de ses activités..."
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
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
