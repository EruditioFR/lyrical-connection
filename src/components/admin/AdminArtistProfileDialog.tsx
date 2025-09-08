
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    stage_name: '',
    bio: '',
    voice_type: '',
    experience_years: 0,
    contact_email: '',
    phone: '',
    location: '',
    website: '',
    nationality: '',
    birth_date: '',
    gender: '',
    spoken_languages: [] as string[],
    project_description: ''
  });

  useEffect(() => {
    if (open) {
      console.log('=== ADMIN ARTIST DIALOG OPENED ===');
      console.log('Full account data:', JSON.stringify(account, null, 2));
      console.log('Available properties:', Object.keys(account));
      
      setFormData({
        stage_name: account.stage_name || '',
        bio: account.bio || '',
        voice_type: account.voice_type || '',
        experience_years: account.experience_years || 0,
        contact_email: account.contact_email || '',
        phone: account.phone || '',
        location: account.location || '',
        website: account.website || '',
        nationality: account.nationality || '',
        birth_date: account.birth_date || '',
        gender: account.gender || '',
        spoken_languages: account.spoken_languages || [],
        project_description: account.project_description || ''
      });
      
      console.log('Form data after setting:', {
        stage_name: account.stage_name,
        bio: account.bio,
        voice_type: account.voice_type,
        experience_years: account.experience_years,
        contact_email: account.contact_email,
        phone: account.phone,
        location: account.location,
        website: account.website,
        nationality: account.nationality,
        birth_date: account.birth_date,
        gender: account.gender,
        spoken_languages: account.spoken_languages,
        project_description: account.project_description
      });
    }
  }, [account, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Submitting artist form data:', formData);
      console.log('Account ID:', account.id);

      const updateData = {
        stage_name: formData.stage_name,
        bio: formData.bio || null,
        voice_type: formData.voice_type || null,
        experience_years: formData.experience_years || 0,
        contact_email: formData.contact_email,
        phone: formData.phone || null,
        location: formData.location || null,
        website: formData.website || null,
        nationality: formData.nationality || null,
        birth_date: formData.birth_date || null,
        gender: formData.gender || null,
        spoken_languages: formData.spoken_languages,
        project_description: formData.project_description || null,
      };

      console.log('Prepared artist update data:', updateData);
      console.log('Current user auth.uid():', (await supabase.auth.getUser()).data.user?.id);
      console.log('Trying to update profile with ID:', account.id);

      // Vérifier d'abord les permissions admin
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);
      
      console.log('User roles:', userRoles, 'Error:', rolesError);

      const { data, error } = await supabase
        .from('artist_profiles')
        .update(updateData)
        .eq('id', account.id)
        .select();

      if (error) {
        console.error('Supabase error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      console.log('Artist update successful:', data);

      toast({
        title: "Profil modifié",
        description: "Le profil artiste a été modifié avec succès.",
      });

      setOpen(false);
      onAccountUpdated();
    } catch (error: any) {
      console.error('Error updating artist profile:', error);
      
      let errorMessage = "Impossible de modifier le profil artiste.";
      
      if (error.code === '42501') {
        errorMessage = "Permissions insuffisantes pour modifier ce profil.";
      } else if (error.code === 'PGRST301') {
        errorMessage = "Profil non trouvé ou accès refusé.";
      } else if (error.message) {
        errorMessage = `Erreur: ${error.message}`;
      }

      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1">
          <Edit className="h-3 w-3" />
          Modifier
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier le profil artiste - {account.stage_name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Informations de base</TabsTrigger>
              <TabsTrigger value="personal">Personnel</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stage_name">Nom de scène *</Label>
                  <Input
                    id="stage_name"
                    value={formData.stage_name}
                    onChange={(e) => setFormData({ ...formData, stage_name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_email">Email de contact *</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="voice_type">Type de voix</Label>
                  <Select
                    value={formData.voice_type}
                    onValueChange={(value) => setFormData({ ...formData, voice_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un type de voix" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Soprano">Soprano</SelectItem>
                      <SelectItem value="Mezzo-soprano">Mezzo-soprano</SelectItem>
                      <SelectItem value="Contralto">Contralto</SelectItem>
                      <SelectItem value="Contre-ténor">Contre-ténor</SelectItem>
                      <SelectItem value="Ténor">Ténor</SelectItem>
                      <SelectItem value="Baryton">Baryton</SelectItem>
                      <SelectItem value="Basse">Basse</SelectItem>
                      <SelectItem value="Basse-baryton">Basse-baryton</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience_years">Années d'expérience</Label>
                  <Input
                    id="experience_years"
                    type="number"
                    min="0"
                    value={formData.experience_years}
                    onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Biographie</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="project_description">Description du projet</Label>
                <Textarea
                  id="project_description"
                  value={formData.project_description}
                  onChange={(e) => setFormData({ ...formData, project_description: e.target.value })}
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="personal" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nationality">Nationalité</Label>
                  <Input
                    id="nationality"
                    value={formData.nationality}
                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Genre</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => setFormData({ ...formData, gender: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un genre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Homme</SelectItem>
                      <SelectItem value="F">Femme</SelectItem>
                      <SelectItem value="non-binaire">Non-binaire</SelectItem>
                      <SelectItem value="autre">Autre</SelectItem>
                      <SelectItem value="prefere-ne-pas-dire">Préfère ne pas dire</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="birth_date">Date de naissance</Label>
                <Input
                  id="birth_date"
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                />
              </div>
            </TabsContent>

            <TabsContent value="contact" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Localisation</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Site web</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Modification...' : 'Modifier le profil'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdminArtistProfileDialog;
