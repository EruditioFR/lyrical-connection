import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from 'lucide-react';
import { useArtistProfile } from '@/hooks/useArtistProfile';
import PhotoGallery from './PhotoGallery';
import BannerUpload from './BannerUpload';
import AirManager from './AirManager';

const voiceTypes = [
  'Soprano',
  'Mezzo-soprano',
  'Alto',
  'Ténor',
  'Baryton',
  'Basse',
  'Autre'
];

const ArtistProfileForm = () => {
  const { profile, createProfile, updateProfile, isCreating, isUpdating } = useArtistProfile();
  const [repertoireInput, setRepertoireInput] = useState('');
  
  const [formData, setFormData] = useState({
    stage_name: '',
    bio: '',
    voice_type: '',
    experience_years: 0,
    contact_email: '',
    phone: '',
    location: '',
    website: '',
    repertoire: [] as string[],
    cover_image_url: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        stage_name: profile.stage_name || '',
        bio: profile.bio || '',
        voice_type: profile.voice_type || '',
        experience_years: profile.experience_years || 0,
        contact_email: profile.contact_email || '',
        phone: profile.phone || '',
        location: profile.location || '',
        website: profile.website || '',
        repertoire: profile.repertoire || [],
        cover_image_url: profile.cover_image_url || '',
      });
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const profileData = {
      ...formData,
      updated_at: new Date().toISOString(),
    };

    if (profile) {
      updateProfile(profileData);
    } else {
      createProfile(profileData);
    }
  };

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
      repertoire: formData.repertoire.filter(r => r !== item)
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addRepertoire();
    }
  };

  const handleBannerChange = (url: string | null) => {
    const newFormData = {
      ...formData,
      cover_image_url: url || ''
    };
    setFormData(newFormData);
    
    // Auto-save the banner change if profile exists
    if (profile) {
      updateProfile({
        ...newFormData,
        updated_at: new Date().toISOString(),
      });
    }
  };

  const isLoading = isCreating || isUpdating;

  return (
    <div className="space-y-6">
      {/* Bannière - affichée seulement si le profil existe */}
      {profile && (
        <div className="max-w-2xl mx-auto">
          <BannerUpload 
            currentBannerUrl={formData.cover_image_url || undefined}
            onBannerChange={handleBannerChange}
          />
        </div>
      )}

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Mon Profil Artiste</CardTitle>
          <CardDescription>
            Gérez vos informations professionnelles et votre répertoire
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="space-y-2">
              <Label>Répertoire</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Ajouter une chanson ou un style..."
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
                  {formData.repertoire.map((item, index) => (
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact_email">Email de contact</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  type="tel"
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
                placeholder="https://..."
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-lyrical-600 to-gold-500 hover:from-lyrical-700 hover:to-gold-600"
              disabled={isLoading}
            >
              {isLoading ? 'Sauvegarde...' : (profile ? 'Mettre à jour le profil' : 'Créer le profil')}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Galerie photos - affichée seulement si le profil existe */}
      {profile && (
        <div className="max-w-2xl mx-auto">
          <PhotoGallery artistProfileId={profile.id} />
        </div>
      )}

      {/* Gestionnaire d'airs - affiché seulement si le profil existe */}
      {profile && (
        <div className="max-w-2xl mx-auto">
          <AirManager artistProfileId={profile.id} />
        </div>
      )}
    </div>
  );
};

export default ArtistProfileForm;
