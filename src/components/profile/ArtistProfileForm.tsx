
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Phone, Music, Image as ImageIcon, Mic } from 'lucide-react';
import { useArtistProfile } from '@/hooks/useArtistProfile';
import ProfileBasicInfo from './ProfileBasicInfo';
import ContactInfo from './ContactInfo';
import RepertoireTab from './RepertoireTab';
import PhotosTab from './PhotosTab';
import AudioTab from './AudioTab';

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
    nationality: '',
    birth_date: '',
    gender: '',
    spoken_languages: [] as string[],
    project_description: ''
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
        nationality: profile.nationality || '',
        birth_date: profile.birth_date || '',
        gender: profile.gender || '',
        spoken_languages: profile.spoken_languages || [],
        project_description: profile.project_description || ''
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
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Mon Profil Artiste</CardTitle>
          <CardDescription>
            Gérez vos informations professionnelles et votre contenu artistique
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profil</span>
              </TabsTrigger>
              <TabsTrigger value="contact" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span className="hidden sm:inline">Contact</span>
              </TabsTrigger>
              <TabsTrigger value="repertoire" className="flex items-center gap-2" disabled={!profile}>
                <Music className="h-4 w-4" />
                <span className="hidden sm:inline">Répertoire</span>
              </TabsTrigger>
              <TabsTrigger value="photos" className="flex items-center gap-2" disabled={!profile}>
                <ImageIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Photos</span>
              </TabsTrigger>
              <TabsTrigger value="audio" className="flex items-center gap-2" disabled={!profile}>
                <Mic className="h-4 w-4" />
                <span className="hidden sm:inline">Vos médias</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-6">
              <ProfileBasicInfo
                formData={formData}
                setFormData={setFormData}
                repertoireInput={repertoireInput}
                setRepertoireInput={setRepertoireInput}
                profile={profile}
                onSubmit={handleSubmit}
                isLoading={isLoading}
                handleBannerChange={handleBannerChange}
              />
            </TabsContent>

            <TabsContent value="contact" className="mt-6">
              <ContactInfo
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleSubmit}
                isLoading={isLoading}
                profile={profile}
              />
            </TabsContent>

            <TabsContent value="repertoire" className="mt-6">
              {profile ? (
                <RepertoireTab artistProfileId={profile.id} />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Créez d'abord votre profil dans l'onglet "Profil" pour accéder à cette section.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="photos" className="mt-6">
              {profile ? (
                <PhotosTab artistProfileId={profile.id} />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Créez d'abord votre profil dans l'onglet "Profil" pour accéder à cette section.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="audio" className="mt-6">
              {profile ? (
                <AudioTab artistProfileId={profile.id} />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Créez d'abord votre profil dans l'onglet "Profil" pour accéder à cette section.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ArtistProfileForm;
