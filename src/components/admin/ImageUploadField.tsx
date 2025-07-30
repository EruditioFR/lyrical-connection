import { useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadFieldProps {
  label: string;
  value?: string;
  onChange: (url: string) => void;
  bucket: string;
  path?: string;
}

export const ImageUploadField = ({ 
  label, 
  value, 
  onChange, 
  bucket, 
  path = '' 
}: ImageUploadFieldProps) => {
  const [uploading, setUploading] = useState(false);
  const [manualUrl, setManualUrl] = useState(value || '');
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un fichier image valide.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erreur",
        description: "La taille du fichier ne doit pas dépasser 5MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = path ? `${path}/${fileName}` : fileName;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      onChange(publicUrl);
      setManualUrl(publicUrl);
      
      toast({
        title: "Succès",
        description: "Image uploadée avec succès!",
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de l'upload de l'image.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleManualUrlChange = (url: string) => {
    setManualUrl(url);
    onChange(url);
  };

  const clearImage = () => {
    setManualUrl('');
    onChange('');
  };

  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      
      {/* Upload button */}
      <div className="flex gap-2">
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={uploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            id={`upload-${bucket}`}
          />
          <Button
            type="button"
            variant="outline"
            disabled={uploading}
            className="gap-2"
            asChild
          >
            <label htmlFor={`upload-${bucket}`} className="cursor-pointer">
              <Upload className="w-4 h-4" />
              {uploading ? 'Upload en cours...' : 'Uploader une image'}
            </label>
          </Button>
        </div>
        
        {value && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={clearImage}
            title="Supprimer l'image"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Manual URL input */}
      <div className="space-y-2">
        <Label htmlFor={`manual-url-${bucket}`} className="text-sm text-muted-foreground">
          Ou entrez une URL manuellement
        </Label>
        <Input
          id={`manual-url-${bucket}`}
          type="url"
          value={manualUrl}
          onChange={(e) => handleManualUrlChange(e.target.value)}
          placeholder="https://example.com/image.jpg"
        />
      </div>

      {/* Image preview */}
      {value && (
        <div className="relative w-full max-w-md border rounded-lg overflow-hidden">
          <img
            src={value}
            alt="Aperçu"
            className="w-full h-48 object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
          <div className="absolute top-2 right-2">
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={clearImage}
              className="w-6 h-6"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}

      {!value && (
        <div className="flex items-center justify-center w-full max-w-md h-48 border-2 border-dashed border-muted-foreground/25 rounded-lg">
          <div className="text-center">
            <ImageIcon className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Aucune image sélectionnée</p>
          </div>
        </div>
      )}
    </div>
  );
};