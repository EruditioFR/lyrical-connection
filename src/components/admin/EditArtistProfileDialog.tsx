import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit2, User, Phone, Music, Image as ImageIcon, Video, Upload, Link as LinkIcon, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { voiceTypes } from '@/constants/voiceTypes';
import { countries } from '@/constants/countries';
import type { Database } from '@/integrations/supabase/types';

interface ArtistAccount {
  id: string;
  user_id: string;
  stage_name?: string;
  contact_email: string;
  created_at: string;
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
  account: ArtistAccount;
  onAccountUpdated: () => void;
}

interface MediaItem {
  id: string;
  type: 'video' | 'audio';
  title: string;
  url: string;
  source: 'file' | 'url';
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
    experience_years: 0,
    birth_date: '',
    gender: '',
    spoken_languages: [] as string[],
    project_description: '',
    repertoire: [] as string[],
    cover_image_url: '',
  });

  const [newRepertoireItem, setNewRepertoireItem] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [newMedia, setNewMedia] = useState({
    type: 'video' as 'video' | 'audio',
    title: '',
    url: '',
    file: null as File | null,
    source: 'url' as 'file' | 'url'
  });

  useEffect(() => {
    if (account && open) {
      setFormData({
        stage_name: account.stage_name || '',
        bio: account.bio || '',
        voice_type: account.voice_type || '',
        contact_email: account.contact_email || '',
        location: account.location || '',
        phone: account.phone || '',
        website: account.website || '',
        nationality: account.nationality || '',
        experience_years: account.experience_years || 0,
        birth_date: account.birth_date || '',
        gender: account.gender || '',
        spoken_languages: account.spoken_languages || [],
        project_description: account.project_description || '',
        repertoire: account.repertoire || [],
        cover_image_url: account.cover_image_url || '',
      });
    }
  }, [account, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const updateData = {
        ...formData,
        experience_years: formData.experience_years || null,
        birth_date: formData.birth_date || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('artist_profiles')
        .update(updateData)
        .eq('id', account.id);

      if (error) throw error;

      toast({
        title: "Profil modifié",
        description: "Le profil artiste a été modifié avec succès.",
      });

      setOpen(false);
      onAccountUpdated();
    } catch (error) {
      console.error('Error updating artist profile:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le profil artiste.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addRepertoireItem = () => {
    if (newRepertoireItem.trim()) {
      setFormData({
        ...formData,
        repertoire: [...formData.repertoire, newRepertoireItem.trim()]
      });
      setNewRepertoireItem('');
    }
  };

  const removeRepertoireItem = (index: number) => {
    setFormData({
      ...formData,
      repertoire: formData.repertoire.filter((_, i) => i !== index)
    });
  };

  const addLanguage = () => {
    if (newLanguage.trim() && !formData.spoken_languages.includes(newLanguage.trim())) {
      setFormData({
        ...formData,
        spoken_languages: [...formData.spoken_languages, newLanguage.trim()]
      });
      setNewLanguage('');
    }
  };

  const removeLanguage = (language: string) => {
    setFormData({
      ...formData,
      spoken_languages: formData.spoken_languages.filter(lang => lang !== language)
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewMedia({
        ...newMedia,
        file,
        title: file.name.split('.')[0]
      });
    }
  };

  const addMediaItem = () => {
    if (newMedia.source === 'url' && newMedia.url && newMedia.title) {
      const mediaItem: MediaItem = {
        id: Date.now().toString(),
        type: newMedia.type,
        title: newMedia.title,
        url: newMedia.url,
        source: 'url'
      };
      setMediaItems([...mediaItems, mediaItem]);
      setNewMedia({
        type: 'video',
        title: '',
        url: '',
        file: null,
        source: 'url'
      });
    } else if (newMedia.source === 'file' && newMedia.file && newMedia.title) {
      // For file uploads, we'd need to implement the upload logic
      // For now, we'll create a placeholder URL
      const mediaItem: MediaItem = {
        id: Date.now().toString(),
        type: newMedia.type,
        title: newMedia.title,
        url: URL.createObjectURL(newMedia.file),
        source: 'file'
      };
      setMediaItems([...mediaItems, mediaItem]);
      setNewMedia({
        type: 'video',
        title: '',
        url: '',
        file: null,
        source: 'url'
      });
    }
  };

  const removeMediaItem = (id: string) => {
    setMediaItems(mediaItems.filter(item => item.id !== id));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1">
          <Edit2 className="h-3 w-3" />
          Éditer profil complet
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Édition complète du profil artiste - {account.stage_name}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Infos de base</span>
              </TabsTrigger>
              <TabsTrigger value="contact" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span className="hidden sm:inline">Contact</span>
              </TabsTrigger>
              <TabsTrigger value="artistic" className="flex items-center gap-2">
                <Music className="h-4 w-4" />
                <span className="hidden sm:inline">Artistique</span>
              </TabsTrigger>
              <TabsTrigger value="media" className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Images</span>
              </TabsTrigger>
              <TabsTrigger value="videos-audio" className="flex items-center gap-2">
                <Video className="h-4 w-4" />
                <span className="hidden sm:inline">Médias</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Informations personnelles</CardTitle>
                  <CardDescription>Informations de base de l'artiste</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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
                      <Label htmlFor="gender">Genre</Label>
                      <Select
                        value={formData.gender}
                        onValueChange={(value) => setFormData({ ...formData, gender: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un genre" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="homme">Homme</SelectItem>
                          <SelectItem value="femme">Femme</SelectItem>
                          <SelectItem value="autre">Autre</SelectItem>
                          <SelectItem value="non-specifie">Non spécifié</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Biographie</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      rows={4}
                      placeholder="Décrivez le parcours et l'expérience de l'artiste..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
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
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contact" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Informations de contact</CardTitle>
                  <CardDescription>Coordonnées et localisation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
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
                    <div className="space-y-2">
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Localisation</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="Ville, Pays"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Site web</Label>
                      <Input
                        id="website"
                        type="url"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="artistic" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Informations artistiques</CardTitle>
                  <CardDescription>Profil vocal et expérience</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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
                        onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="project_description">Description du projet</Label>
                    <Textarea
                      id="project_description"
                      value={formData.project_description}
                      onChange={(e) => setFormData({ ...formData, project_description: e.target.value })}
                      rows={3}
                      placeholder="Décrivez les projets actuels ou futurs de l'artiste..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Répertoire</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newRepertoireItem}
                        onChange={(e) => setNewRepertoireItem(e.target.value)}
                        placeholder="Ajouter un élément au répertoire"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRepertoireItem())}
                      />
                      <Button type="button" onClick={addRepertoireItem}>Ajouter</Button>
                    </div>
                    {formData.repertoire.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.repertoire.map((item, index) => (
                          <span key={index} className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm flex items-center gap-1">
                            {item}
                            <button type="button" onClick={() => removeRepertoireItem(index)} className="text-red-500 hover:text-red-700">×</button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Langues parlées</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newLanguage}
                        onChange={(e) => setNewLanguage(e.target.value)}
                        placeholder="Ajouter une langue"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
                      />
                      <Button type="button" onClick={addLanguage}>Ajouter</Button>
                    </div>
                    {formData.spoken_languages.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.spoken_languages.map((language, index) => (
                          <span key={index} className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm flex items-center gap-1">
                            {language}
                            <button type="button" onClick={() => removeLanguage(language)} className="text-red-500 hover:text-red-700">×</button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="media" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Médias et visuels</CardTitle>
                  <CardDescription>Images et contenus visuels du profil</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cover_image_url">URL de l'image de couverture</Label>
                    <Input
                      id="cover_image_url"
                      type="url"
                      value={formData.cover_image_url}
                      onChange={(e) => setFormData({ ...formData, cover_image_url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                  {formData.cover_image_url && (
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground mb-2">Aperçu :</p>
                      <img 
                        src={formData.cover_image_url} 
                        alt="Aperçu de l'image de couverture" 
                        className="w-full max-w-md h-32 object-cover rounded-md border"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="videos-audio" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Vidéos et audio</CardTitle>
                  <CardDescription>Ajoutez des vidéos et fichiers audio via fichier ou URL</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Type de média</Label>
                      <Select
                        value={newMedia.type}
                        onValueChange={(value: 'video' | 'audio') => setNewMedia({ ...newMedia, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="video">Vidéo</SelectItem>
                          <SelectItem value="audio">Audio</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Source</Label>
                      <Select
                        value={newMedia.source}
                        onValueChange={(value: 'file' | 'url') => setNewMedia({ ...newMedia, source: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="url">URL</SelectItem>
                          <SelectItem value="file">Fichier</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="media-title">Titre</Label>
                    <Input
                      id="media-title"
                      value={newMedia.title}
                      onChange={(e) => setNewMedia({ ...newMedia, title: e.target.value })}
                      placeholder="Titre du média"
                    />
                  </div>

                  {newMedia.source === 'url' ? (
                    <div className="space-y-2">
                      <Label htmlFor="media-url">URL</Label>
                      <Input
                        id="media-url"
                        type="url"
                        value={newMedia.url}
                        onChange={(e) => setNewMedia({ ...newMedia, url: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="media-file">Fichier</Label>
                      <Input
                        id="media-file"
                        type="file"
                        accept={newMedia.type === 'video' ? 'video/*' : 'audio/*'}
                        onChange={handleFileSelect}
                      />
                    </div>
                  )}

                  <Button type="button" onClick={addMediaItem} className="w-full">
                    <Upload className="h-4 w-4 mr-2" />
                    Ajouter le média
                  </Button>

                  {mediaItems.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="font-medium">Médias ajoutés ({mediaItems.length})</h4>
                      <div className="grid grid-cols-1 gap-4">
                        {mediaItems.map((item) => (
                          <div key={item.id} className="border rounded-lg p-4 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="flex items-center gap-1">
                                  {item.type === 'video' ? <Video className="h-3 w-3" /> : <Music className="h-3 w-3" />}
                                  {item.type}
                                </Badge>
                                <Badge variant="secondary" className="flex items-center gap-1">
                                  {item.source === 'url' ? <LinkIcon className="h-3 w-3" /> : <Upload className="h-3 w-3" />}
                                  {item.source === 'url' ? 'URL' : 'Fichier'}
                                </Badge>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeMediaItem(item.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <p className="font-medium">{item.title}</p>
                            {item.source === 'url' && (
                              <p className="text-sm text-muted-foreground truncate">{item.url}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4 mt-6 border-t">
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
