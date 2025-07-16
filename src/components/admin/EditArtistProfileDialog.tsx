
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { voiceTypes } from '@/constants/voiceTypes';
import { countries } from '@/constants/countries';
import { languages } from '@/constants/languages';

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

interface EditArtistProfileDialogProps {
  account: Account;
  onAccountUpdated: () => void;
}

const EditArtistProfileDialog = ({ account, onAccountUpdated }: EditArtistProfileDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    stage_name: '',
    bio: '',
    voice_type: '',
    contact_email: '',
    location: '',
    phone: '',
    website: '',
    nationality: '',
    experience_years: '',
    birth_date: '',
    gender: '',
    spoken_languages: [] as string[],
    project_description: '',
    repertoire: [] as string[],
  });

  useEffect(() => {
    if (open) {
      console.log('Loading artist profile data:', account);
      setFormData({
        stage_name: account.stage_name || '',
        bio: account.bio || '',
        voice_type: account.voice_type || '',
        contact_email: account.contact_email || '',
        location: account.location || '',
        phone: account.phone || '',
        website: account.website || '',
        nationality: account.nationality || '',
        experience_years: account.experience_years !== null && account.experience_years !== undefined 
          ? account.experience_years.toString() 
          : '',
        birth_date: account.birth_date || '',
        gender: account.gender || '',
        spoken_languages: account.spoken_languages || [],
        project_description: account.project_description || '',
        repertoire: account.repertoire || [],
      });
    }
  }, [account, open]);

  const handleLanguageChange = (language: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      spoken_languages: checked
        ? [...prev.spoken_languages, language]
        : prev.spoken_languages.filter(l => l !== language)
    }));
  };

  const handleRepertoireChange = (value: string) => {
    const repertoireList = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({
      ...prev,
      repertoire: repertoireList
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Submitting form data:', formData);
      console.log('Account ID:', account.id);

      // Préparer les données avec la gestion correcte des types
      const updateData = {
        stage_name: formData.stage_name,
        bio: formData.bio || null,
        voice_type: formData.voice_type || null,
        contact_email: formData.contact_email,
        location: formData.location || null,
        phone: formData.phone || null,
        website: formData.website || null,
        nationality: formData.nationality || null,
        // Corriger la logique pour experience_years : gérer correctement 0
        experience_years: formData.experience_years !== '' && formData.experience_years !== null
          ? parseInt(formData.experience_years)
          : null,
        birth_date: formData.birth_date || null,
        gender: formData.gender || null,
        // Corriger la gestion des arrays : toujours retourner un array, jamais null
        spoken_languages: formData.spoken_languages,
        project_description: formData.project_description || null,
        repertoire: formData.repertoire,
      };

      console.log('Prepared update data:', updateData);

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

      console.log('Update successful:', data);

      toast({
        title: "Profil modifié",
        description: "Le profil artiste a été modifié avec succès.",
      });

      setOpen(false);
      onAccountUpdated();
    } catch (error: any) {
      console.error('Error updating artist profile:', error);
      
      // Gestion d'erreur améliorée avec messages spécifiques
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
          <DialogTitle>Modifier le profil artiste complet</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations de base */}
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

          {/* Biographie */}
          <div className="space-y-2">
            <Label htmlFor="bio">Biographie</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={3}
            />
          </div>

          {/* Description du projet */}
          <div className="space-y-2">
            <Label htmlFor="project_description">Description du projet</Label>
            <Textarea
              id="project_description"
              value={formData.project_description}
              onChange={(e) => setFormData({ ...formData, project_description: e.target.value })}
              rows={3}
            />
          </div>

          {/* Informations vocales */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="voice_type">Type de voix</Label>
              <Select
                value={formData.voice_type}
                onValueChange={(value) => setFormData({ ...formData, voice_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type de voix" />
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
              <Label htmlFor="experience_years">Années d'expérience</Label>
              <Input
                id="experience_years"
                type="number"
                min="0"
                value={formData.experience_years}
                onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
              />
            </div>
          </div>

          {/* Informations personnelles */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="birth_date">Date de naissance</Label>
              <Input
                id="birth_date"
                type="date"
                value={formData.birth_date}
                onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Genre</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => setFormData({ ...formData, gender: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Homme</SelectItem>
                  <SelectItem value="female">Femme</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                  <SelectItem value="prefer_not_to_say">Préfère ne pas dire</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nationality">Nationalité</Label>
              <Select
                value={formData.nationality}
                onValueChange={(value) => setFormData({ ...formData, nationality: value })}
              >
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

          {/* Langues parlées */}
          <div className="space-y-2">
            <Label>Langues parlées</Label>
            <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
              {languages.map((language) => (
                <div key={language} className="flex items-center space-x-2">
                  <Checkbox
                    id={`language-${language}`}
                    checked={formData.spoken_languages.includes(language)}
                    onCheckedChange={(checked) => handleLanguageChange(language, checked as boolean)}
                  />
                  <Label htmlFor={`language-${language}`} className="text-sm">
                    {language}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Répertoire */}
          <div className="space-y-2">
            <Label htmlFor="repertoire">Répertoire (séparé par des virgules)</Label>
            <Textarea
              id="repertoire"
              value={formData.repertoire.join(', ')}
              onChange={(e) => handleRepertoireChange(e.target.value)}
              placeholder="Exemple: La Traviata, Carmen, Don Giovanni"
              rows={3}
            />
          </div>

          {/* Contact et localisation */}
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

          {/* Site web */}
          <div className="space-y-2">
            <Label htmlFor="website">Site web</Label>
            <Input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
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

export default EditArtistProfileDialog;
