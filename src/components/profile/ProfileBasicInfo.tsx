
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import BannerUpload from './BannerUpload';
import { BirthDatePicker } from '@/components/ui/birth-date-picker';
import { countries } from '@/constants/countries';
import { languages } from '@/constants/languages';

const voiceTypes = [
  'Soprano',
  'Mezzo-soprano',
  'Alto',
  'Ténor',
  'Baryton',
  'Basse',
  'Autre'
];

interface ProfileBasicInfoProps {
  formData: any;
  setFormData: (data: any) => void;
  repertoireInput: string;
  setRepertoireInput: (value: string) => void;
  profile: any;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  handleBannerChange: (url: string | null) => void;
}

const ProfileBasicInfo = ({ 
  formData, 
  setFormData, 
  repertoireInput, 
  setRepertoireInput,
  profile,
  onSubmit, 
  isLoading,
  handleBannerChange 
}: ProfileBasicInfoProps) => {
  const addRepertoire = () => {
    if (repertoireInput.trim() && !formData.repertoire.includes(repertoireInput.trim())) {
      setFormData({
        ...formData,
        repertoire: [...formData.repertoire, repertoireInput.trim()]
      });
      setRepertoireInput('');
    }
  };

  const removeRepertoire = (item: string) => {
    setFormData({
      ...formData,
      repertoire: formData.repertoire.filter((r: string) => r !== item)
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addRepertoire();
    }
  };

  return (
    <div className="space-y-6">
      {/* Bannière - affichée seulement si le profil existe */}
      {profile && (
        <BannerUpload 
          currentBannerUrl={formData.cover_image_url || undefined}
          onBannerChange={handleBannerChange}
        />
      )}

      <form onSubmit={onSubmit} className="space-y-6">
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
          <Label htmlFor="bio">Biographie</Label>
          <Textarea
            id="bio"
            placeholder="Parlez-nous de votre parcours artistique..."
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            rows={4}
          />
        </div>

        {/* Nouveaux champs obligatoires */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nationality">Nationalité *</Label>
            <Select 
              value={formData.nationality} 
              onValueChange={(value) => setFormData({ ...formData, nationality: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une nationalité" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {countries.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Date de naissance *</Label>
            <BirthDatePicker
              value={formData.birth_date ? (() => {
                const [year, month, day] = formData.birth_date.split('-').map(Number);
                return new Date(year, month - 1, day);
              })() : undefined}
              onChange={(date) => {
                if (date) {
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const day = String(date.getDate()).padStart(2, '0');
                  setFormData({ ...formData, birth_date: `${year}-${month}-${day}` });
                } else {
                  setFormData({ ...formData, birth_date: '' });
                }
              }}
              placeholder="Sélectionner une date"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="gender">Sexe *</Label>
            <Select 
              value={formData.gender} 
              onValueChange={(value) => setFormData({ ...formData, gender: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le sexe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="H">Homme</SelectItem>
                <SelectItem value="F">Femme</SelectItem>
                <SelectItem value="autre">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
        </div>

        {/* Langues parlées */}
        <div className="space-y-2">
          <Label>Langues parlées *</Label>
          <div className="border rounded-md p-3 max-h-40 overflow-y-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {languages.map((language) => (
                <div key={language} className="flex items-center space-x-2">
                  <Checkbox
                    id={`lang-${language}`}
                    checked={formData.spoken_languages?.includes(language) || false}
                    onCheckedChange={(checked) => {
                      const currentLangs = formData.spoken_languages || [];
                      if (checked) {
                        setFormData({
                          ...formData,
                          spoken_languages: [...currentLangs, language]
                        });
                      } else {
                        setFormData({
                          ...formData,
                          spoken_languages: currentLangs.filter((l: string) => l !== language)
                        });
                      }
                    }}
                  />
                  <Label htmlFor={`lang-${language}`} className="text-sm font-normal">
                    {language}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          {formData.spoken_languages?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {formData.spoken_languages.map((lang: string) => (
                <Badge key={lang} variant="outline" className="text-xs">
                  {lang}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          
          <div className="space-y-2">
            <Label htmlFor="location">Localisation</Label>
            <Input
              id="location"
              placeholder="Ville, Région"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>
        </div>

        {/* Présentation du projet */}
        <div className="space-y-2">
          <Label htmlFor="project_description">Présentation de votre projet artistique</Label>
          <Textarea
            id="project_description"
            placeholder="Décrivez votre projet artistique, vos objectifs, votre vision..."
            value={formData.project_description}
            onChange={(e) => setFormData({ ...formData, project_description: e.target.value })}
            rows={6}
          />
        </div>

        {/* Tags libres (répertoire) */}
        <div className="space-y-2">
          <Label>Tags libres (styles, notes personnelles)</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Ajouter un tag libre..."
              value={repertoireInput}
              onChange={(e) => setRepertoireInput(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <Button type="button" onClick={addRepertoire} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {formData.repertoire.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.repertoire.map((item: string, index: number) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {item}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeRepertoire(item)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>

        <Button 
          type="submit" 
          className="w-full bg-gradient-to-r from-lyrical-600 to-gold-500 hover:from-lyrical-700 hover:to-gold-600"
          disabled={isLoading}
        >
          {isLoading ? 'Sauvegarde...' : (profile ? 'Mettre à jour le profil' : 'Créer le profil')}
        </Button>
      </form>
    </div>
  );
};

export default ProfileBasicInfo;
