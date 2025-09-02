
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { User, Phone, Music, Image as ImageIcon, Mic, Save, Crown } from 'lucide-react';
import { useArtistProfile } from '@/hooks/useArtistProfile';
import ProfileBasicInfo from './ProfileBasicInfo';
import ContactInfo from './ContactInfo';
import RepertoireTab from './RepertoireTab';
import PhotosTab from './PhotosTab';
import AudioTab from './AudioTab';
import PremiumVisibilityCard from '@/components/premium/PremiumVisibilityCard';
import SubscriptionSummary from '@/components/subscription/SubscriptionSummary';

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
    <div className="content-spacing">
      {/* En-tête avec nom de scène */}
      {profile?.stage_name && (
        <div className="text-center card-spacing">
          <h1 className="title-main mb-2">
            {profile.stage_name}
          </h1>
          <p className="body-text text-muted-foreground mb-4">Édition du profil artiste</p>
          <Button 
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90 body-text"
          >
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? "Mise à jour..." : "Mettre à jour le profil"}
          </Button>
        </div>
      )}
      
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="title-main">Mon Profil Artiste</CardTitle>
          <CardDescription className="body-text">
            Gérez vos informations professionnelles et votre contenu artistique
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="profile" className="flex items-center gap-2 body-text">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profil</span>
              </TabsTrigger>
              <TabsTrigger value="contact" className="flex items-center gap-2 body-text">
                <Phone className="h-4 w-4" />
                <span className="hidden sm:inline">Contact</span>
              </TabsTrigger>
              <TabsTrigger value="repertoire" className="flex items-center gap-2 body-text" disabled={!profile}>
                <Music className="h-4 w-4" />
                <span className="hidden sm:inline">Répertoire</span>
              </TabsTrigger>
              <TabsTrigger value="photos" className="flex items-center gap-2 body-text" disabled={!profile}>
                <ImageIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Photos</span>
              </TabsTrigger>
              <TabsTrigger value="audio" className="flex items-center gap-2 body-text" disabled={!profile}>
                <Mic className="h-4 w-4" />
                <span className="hidden sm:inline">Vos médias</span>
              </TabsTrigger>
              <TabsTrigger value="premium" className="flex items-center gap-2 body-text" disabled={!profile}>
                <Crown className="h-4 w-4" />
                <span className="hidden sm:inline">Premium</span>
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
                <div className="text-center py-8">
                  <p className="secondary-text">Créez d'abord votre profil dans l'onglet "Profil" pour accéder à cette section.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="photos" className="mt-6">
              {profile ? (
                <PhotosTab artistProfileId={profile.id} />
              ) : (
                <div className="text-center py-8">
                  <p className="secondary-text">Créez d'abord votre profil dans l'onglet "Profil" pour accéder à cette section.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="audio" className="mt-6">
              {profile ? (
                <AudioTab artistProfileId={profile.id} />
              ) : (
                <div className="text-center py-8">
                  <p className="secondary-text">Créez d'abord votre profil dans l'onglet "Profil" pour accéder à cette section.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="premium" className="mt-6">
              {profile ? (
                <div className="max-w-2xl mx-auto content-spacing">
                  <SubscriptionSummary 
                    profileType="artist" 
                    profileId={profile.id}
                  />
                  <PremiumVisibilityCard 
                    profileType="artist" 
                    profileId={profile.id}
                    title="Visibilité Premium Artiste"
                  />
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="secondary-text">Créez d'abord votre profil dans l'onglet "Profil" pour accéder à cette section.</p>
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
