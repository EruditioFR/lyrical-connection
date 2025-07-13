
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EventMediaSection } from '../EventMediaSection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Link as LinkIcon, Loader2, Image } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface EventMediaStepProps {
  formData: any;
  handleInputChange: (field: string, value: string) => void;
  professionalProfileId?: string;
}

export const EventMediaStep: React.FC<EventMediaStepProps> = ({
  formData,
  handleInputChange,
  professionalProfileId
}) => {
  const [logoUploadType, setLogoUploadType] = React.useState<'url' | 'upload'>('url');
  const [isUploadingLogo, setIsUploadingLogo] = React.useState(false);
  const { toast } = useToast();

  const uploadLogoToStorage = async (file: File): Promise<string | null> => {
    if (!professionalProfileId) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${professionalProfileId}/${Date.now()}.${fileExt}`;

    try {
      const { data, error } = await supabase.storage
        .from('professional-media')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Error uploading logo:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible d\'uploader le logo',
          variant: 'destructive',
        });
        return null;
      }

      const { data: publicUrlData } = supabase.storage
        .from('professional-media')
        .getPublicUrl(data.path);

      return publicUrlData.publicUrl;
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'uploader le logo',
        variant: 'destructive',
      });
      return null;
    }
  };

  const handleLogoFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);

    const uploadedUrl = await uploadLogoToStorage(file);
    
    if (uploadedUrl) {
      handleInputChange('image_url', uploadedUrl);
      toast({
        title: 'Succès',
        description: 'Logo uploadé avec succès',
      });
    }

    setIsUploadingLogo(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Médias et visuels</h3>
        <p className="text-muted-foreground mb-6">
          Ajoutez des images et vidéos pour rendre votre événement attractif
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Logo de l'événement
          </CardTitle>
          <CardDescription>
            Ajoutez un logo ou une image principale pour votre événement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={logoUploadType} onValueChange={(value) => setLogoUploadType(value as 'url' | 'upload')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="url">
                <LinkIcon className="h-4 w-4 mr-2" />
                URL du logo
              </TabsTrigger>
              <TabsTrigger value="upload">
                <Upload className="h-4 w-4 mr-2" />
                Upload fichier
              </TabsTrigger>
            </TabsList>

            <TabsContent value="url" className="space-y-2 mt-4">
              <Label htmlFor="image_url">URL de l'image</Label>
              <Input
                id="image_url"
                value={formData.image_url}
                onChange={(e) => handleInputChange('image_url', e.target.value)}
                placeholder="https://exemple.com/logo.jpg"
              />
            </TabsContent>

            <TabsContent value="upload" className="space-y-2 mt-4">
              <Label htmlFor="logo_file">Fichier image</Label>
              <Input
                id="logo_file"
                type="file"
                onChange={handleLogoFileUpload}
                accept="image/*"
                disabled={isUploadingLogo}
              />
              {isUploadingLogo && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Upload en cours...
                </div>
              )}
            </TabsContent>
          </Tabs>

          {formData.image_url && (
            <div className="mt-4">
              <Label>Aperçu du logo</Label>
              <div className="mt-2">
                <img
                  src={formData.image_url}
                  alt="Aperçu du logo"
                  className="h-20 w-20 object-cover object-top rounded border"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {professionalProfileId && (
        <Card>
          <CardHeader>
            <CardTitle>Galerie médias</CardTitle>
            <CardDescription>
              Ajoutez des photos et vidéos supplémentaires pour présenter votre événement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EventMediaSection professionalProfileId={professionalProfileId} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};
