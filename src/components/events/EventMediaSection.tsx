
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useProfessionalMedia } from '@/hooks/useProfessionalMedia';
import { Trash2, Upload, Link as LinkIcon, Play, Volume2, Image as ImageIcon } from 'lucide-react';

interface EventMediaSectionProps {
  professionalProfileId?: string;
}

export const EventMediaSection: React.FC<EventMediaSectionProps> = ({ professionalProfileId }) => {
  const { media, uploading, uploadFile, addExternalLink, deleteMedia, getMediaUrl } = useProfessionalMedia(professionalProfileId);
  const [selectedMediaType, setSelectedMediaType] = useState<'photo' | 'video' | 'audio'>('photo');
  const [externalUrl, setExternalUrl] = useState('');
  const [mediaTitle, setMediaTitle] = useState('');
  const [mediaDescription, setMediaDescription] = useState('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && professionalProfileId) {
      await uploadFile(file, selectedMediaType, mediaTitle || file.name, mediaDescription);
      setMediaTitle('');
      setMediaDescription('');
      event.target.value = '';
    }
  };

  const handleExternalLinkAdd = async () => {
    if (externalUrl && professionalProfileId) {
      await addExternalLink(selectedMediaType, externalUrl, mediaTitle || 'Lien externe', mediaDescription);
      setExternalUrl('');
      setMediaTitle('');
      setMediaDescription('');
    }
  };

  const getMediaIcon = (mediaType: string) => {
    switch (mediaType) {
      case 'video':
        return <Play className="h-4 w-4" />;
      case 'audio':
        return <Volume2 className="h-4 w-4" />;
      default:
        return <ImageIcon className="h-4 w-4" />;
    }
  };

  const isVideoUrl = (url: string) => {
    return url.startsWith('http') && (url.includes('youtube.com') || url.includes('vimeo.com') || url.includes('youtu.be'));
  };

  const isAudioUrl = (url: string) => {
    return url.startsWith('http') && (url.includes('soundcloud.com') || url.includes('spotify.com'));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Galerie médias</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sélection du type de média */}
        <div className="space-y-2">
          <Label>Type de média</Label>
          <Select
            value={selectedMediaType}
            onValueChange={(value) => setSelectedMediaType(value as 'photo' | 'video' | 'audio')}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="photo">Image</SelectItem>
              <SelectItem value="video">Vidéo</SelectItem>
              <SelectItem value="audio">Audio</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Informations du média */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Titre (optionnel)</Label>
            <Input
              value={mediaTitle}
              onChange={(e) => setMediaTitle(e.target.value)}
              placeholder="Titre du média"
            />
          </div>
          <div className="space-y-2">
            <Label>Description (optionnelle)</Label>
            <Input
              value={mediaDescription}
              onChange={(e) => setMediaDescription(e.target.value)}
              placeholder="Description du média"
            />
          </div>
        </div>

        {/* Tabs pour upload ou URL */}
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">
              <Upload className="h-4 w-4 mr-2" />
              Upload fichier
            </TabsTrigger>
            <TabsTrigger value="url">
              <LinkIcon className="h-4 w-4 mr-2" />
              Lien externe
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <div className="space-y-2">
              <Label>Fichier à uploader</Label>
              <Input
                type="file"
                onChange={handleFileUpload}
                accept={
                  selectedMediaType === 'photo' 
                    ? 'image/*' 
                    : selectedMediaType === 'video' 
                    ? 'video/*' 
                    : 'audio/*'
                }
                disabled={uploading || !professionalProfileId}
              />
            </div>
          </TabsContent>

          <TabsContent value="url" className="space-y-4">
            <div className="space-y-2">
              <Label>URL du média</Label>
              <div className="flex gap-2">
                <Input
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  placeholder={
                    selectedMediaType === 'photo' 
                      ? 'https://exemple.com/image.jpg' 
                      : selectedMediaType === 'video' 
                      ? 'https://youtube.com/watch?v=...' 
                      : 'https://soundcloud.com/...'
                  }
                />
                <Button 
                  onClick={handleExternalLinkAdd}
                  disabled={!externalUrl || uploading || !professionalProfileId}
                >
                  Ajouter
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Liste des médias existants */}
        {media && media.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium">Médias ajoutés</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {media.map((item) => (
                <div key={item.id} className="relative group border rounded-lg overflow-hidden">
                  <div className="aspect-video bg-muted flex items-center justify-center">
                    {item.media_type === 'photo' ? (
                      <img
                        src={getMediaUrl(item.file_path)}
                        alt={item.title || 'Media'}
                        className="w-full h-full object-cover"
                      />
                    ) : item.media_type === 'video' ? (
                      <div className="w-full h-full bg-black flex items-center justify-center">
                        {isVideoUrl(item.file_path) ? (
                          <div className="flex flex-col items-center text-white">
                            <Play className="h-12 w-12 mb-2" />
                            <span className="text-xs">Vidéo externe</span>
                          </div>
                        ) : (
                          <video
                            src={getMediaUrl(item.file_path)}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-full bg-muted-foreground/10 flex flex-col items-center justify-center">
                        <Volume2 className="h-12 w-12 text-muted-foreground mb-2" />
                        <span className="text-xs text-muted-foreground">
                          {isAudioUrl(item.file_path) ? 'Audio externe' : 'Fichier audio'}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="absolute top-2 left-2">
                    <Badge variant="secondary" className="text-xs">
                      {getMediaIcon(item.media_type)}
                      <span className="ml-1 capitalize">{item.media_type}</span>
                    </Badge>
                  </div>

                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteMedia(item.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>

                  {item.title && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                      <p className="text-white text-xs font-medium truncate">{item.title}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {uploading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">Upload en cours...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
