
import React, { useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useProfessionalMedia } from '@/hooks/useProfessionalMedia';
import { Image, Video, Music, Upload, Trash2, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface MediaUploadSectionProps {
  profileId?: string;
}

const MediaUploadSection: React.FC<MediaUploadSectionProps> = ({ profileId }) => {
  const { media, isLoading, uploading, uploadFile, deleteMedia, getMediaUrl } = useProfessionalMedia(profileId);
  const [uploadForm, setUploadForm] = useState({
    file: null as File | null,
    mediaType: 'photo' as 'photo' | 'video' | 'audio',
    title: '',
    description: '',
  });

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadForm(prev => ({
        ...prev,
        file,
        title: file.name.split('.')[0],
      }));
    }
  }, []);

  const handleUpload = async () => {
    if (!uploadForm.file) return;
    
    await uploadFile(
      uploadForm.file,
      uploadForm.mediaType,
      uploadForm.title,
      uploadForm.description
    );

    setUploadForm({
      file: null,
      mediaType: 'photo',
      title: '',
      description: '',
    });

    // Reset file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'photo': return <Image className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'audio': return <Music className="h-4 w-4" />;
      default: return <Image className="h-4 w-4" />;
    }
  };

  const getAcceptTypes = (mediaType: string) => {
    switch (mediaType) {
      case 'photo': return 'image/*';
      case 'video': return 'video/*';
      case 'audio': return 'audio/*';
      default: return 'image/*';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Médias
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Form */}
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {(['photo', 'video', 'audio'] as const).map((type) => (
              <Button
                key={type}
                type="button"
                variant={uploadForm.mediaType === type ? "default" : "outline"}
                onClick={() => setUploadForm(prev => ({ ...prev, mediaType: type }))}
                className="flex items-center gap-2"
              >
                {getMediaIcon(type)}
                {type === 'photo' && 'Photo'}
                {type === 'video' && 'Vidéo'}
                {type === 'audio' && 'Audio'}
              </Button>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="media-file">Fichier</Label>
            <Input
              id="media-file"
              type="file"
              accept={getAcceptTypes(uploadForm.mediaType)}
              onChange={handleFileSelect}
              disabled={uploading}
            />
          </div>

          {uploadForm.file && (
            <>
              <div className="space-y-2">
                <Label htmlFor="media-title">Titre</Label>
                <Input
                  id="media-title"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Titre du média"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="media-description">Description (facultatif)</Label>
                <Textarea
                  id="media-description"
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description du média"
                  rows={2}
                />
              </div>

              <Button 
                onClick={handleUpload} 
                disabled={uploading || !uploadForm.title}
                className="w-full"
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Upload en cours...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Ajouter le média
                  </>
                )}
              </Button>
            </>
          )}
        </div>

        {/* Media List */}
        {media.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium">Médias ajoutés ({media.length})</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {media.map((item) => (
                <div key={item.id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="flex items-center gap-1">
                      {getMediaIcon(item.media_type)}
                      {item.media_type}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMedia(item.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {item.media_type === 'photo' && (
                    <img
                      src={getMediaUrl(item.file_path)}
                      alt={item.title || 'Photo'}
                      className="w-full h-32 object-cover rounded"
                    />
                  )}

                  {item.media_type === 'video' && (
                    <video
                      src={getMediaUrl(item.file_path)}
                      className="w-full h-32 rounded"
                      controls
                    />
                  )}

                  {item.media_type === 'audio' && (
                    <audio
                      src={getMediaUrl(item.file_path)}
                      className="w-full"
                      controls
                    />
                  )}

                  <div>
                    <p className="font-medium text-sm truncate">{item.title}</p>
                    {item.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MediaUploadSection;
