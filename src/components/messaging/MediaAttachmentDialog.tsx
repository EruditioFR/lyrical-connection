import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Image, Music, Send } from 'lucide-react';
import { useArtistPhotos } from '@/hooks/useArtistPhotos';
import { useArtistAirs } from '@/hooks/useArtistAirs';
import { useUserType } from '@/hooks/useUserType';

interface MediaAttachmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMediaSelect: (mediaData: { type: 'photo' | 'audio'; url: string; name: string }) => void;
}

const MediaAttachmentDialog = ({ open, onOpenChange, onMediaSelect }: MediaAttachmentDialogProps) => {
  const { artistProfile } = useUserType();
  const { photos, getPhotoUrl } = useArtistPhotos(artistProfile?.id);
  const { airs, getFileUrl } = useArtistAirs(artistProfile?.id || '');
  const [selectedTab, setSelectedTab] = useState('photos');

  const handlePhotoSelect = (photo: any) => {
    onMediaSelect({
      type: 'photo',
      url: getPhotoUrl(photo.file_path),
      name: photo.file_name
    });
    onOpenChange(false);
  };

  const handleAirSelect = (air: any) => {
    const url = air.external_url || (air.file_path ? getFileUrl(air.file_path) : '');
    onMediaSelect({
      type: 'audio',
      url,
      name: air.title
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Ajouter un média</DialogTitle>
        </DialogHeader>
        
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="photos" className="flex items-center gap-2">
              <Image className="w-4 h-4" />
              Photos ({photos?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="airs" className="flex items-center gap-2">
              <Music className="w-4 h-4" />
              Airs ({airs?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="photos" className="mt-4">
            <ScrollArea className="h-[400px]">
              {!photos || photos.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-muted-foreground">
                  <p>Aucune photo disponible</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {photos.map((photo) => (
                    <Card key={photo.id} className="overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all">
                      <CardContent className="p-0" onClick={() => handlePhotoSelect(photo)}>
                        <div className="aspect-square relative">
                          <img
                            src={getPhotoUrl(photo.file_path)}
                            alt={photo.file_name}
                            className="w-full h-full object-cover"
                          />
                          {photo.is_profile_photo && (
                            <Badge className="absolute top-2 left-2 text-xs">
                              Profil
                            </Badge>
                          )}
                        </div>
                        <div className="p-2">
                          <p className="text-xs text-muted-foreground truncate">
                            {photo.file_name}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="airs" className="mt-4">
            <ScrollArea className="h-[400px]">
              {!airs || airs.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-muted-foreground">
                  <p>Aucun air disponible</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {airs.map((air) => (
                    <Card key={air.id} className="cursor-pointer hover:ring-2 hover:ring-primary transition-all">
                      <CardContent className="p-4" onClick={() => handleAirSelect(air)}>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium">{air.title}</h4>
                            {air.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {air.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {air.type}
                              </Badge>
                              {air.duration && (
                                <span className="text-xs text-muted-foreground">
                                  {Math.floor(air.duration / 60)}:{(air.duration % 60).toString().padStart(2, '0')}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="ml-4">
                            <Music className="w-6 h-6 text-muted-foreground" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default MediaAttachmentDialog;