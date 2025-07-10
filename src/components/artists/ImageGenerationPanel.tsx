import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ImagePlus, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Artist {
  id: string;
  stage_name: string;
  voice_type: string | null;
  profile_image_url: string | null;
}

interface ImageGenerationPanelProps {
  artists: Artist[];
  onImagesGenerated: () => void;
}

export const ImageGenerationPanel: React.FC<ImageGenerationPanelProps> = ({
  artists,
  onImagesGenerated
}) => {
  const [generatingForId, setGeneratingForId] = useState<string | null>(null);
  const [generatingAll, setGeneratingAll] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  // Détecter le genre basé sur le type de voix et le nom de scène
  const detectGender = (artist: Artist): 'male' | 'female' | 'neutral' => {
    const voiceType = artist.voice_type?.toLowerCase() || '';
    const stageName = artist.stage_name.toLowerCase();
    
    // Basé sur le type de voix
    if (voiceType.includes('soprano') || voiceType.includes('mezzo')) {
      return 'female';
    }
    if (voiceType.includes('tenor') || voiceType.includes('baryton') || voiceType.includes('basse')) {
      return 'male';
    }
    
    // Basé sur des indices dans le nom (très basique)
    const femaleIndicators = ['marie', 'anna', 'sophie', 'claire', 'isabelle', 'camille'];
    const maleIndicators = ['jean', 'pierre', 'louis', 'henri', 'antoine', 'paul'];
    
    if (femaleIndicators.some(indicator => stageName.includes(indicator))) {
      return 'female';
    }
    if (maleIndicators.some(indicator => stageName.includes(indicator))) {
      return 'male';
    }
    
    return 'neutral';
  };

  const generateImageForArtist = async (artist: Artist) => {
    setGeneratingForId(artist.id);
    
    try {
      const gender = detectGender(artist);
      
      const { data, error } = await supabase.functions.invoke('generate-artist-image', {
        body: {
          artistId: artist.id,
          stageName: artist.stage_name,
          voiceType: artist.voice_type,
          gender: gender
        }
      });

      if (error) throw error;

      if (data.success) {
        toast.success(`Image générée pour ${artist.stage_name}`);
        onImagesGenerated();
      } else {
        throw new Error(data.error || 'Erreur inconnue');
      }
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error(`Erreur lors de la génération pour ${artist.stage_name}: ${error.message}`);
    } finally {
      setGeneratingForId(null);
    }
  };

  const generateAllImages = async () => {
    const artistsWithoutImages = artists.filter(artist => !artist.profile_image_url);
    
    if (artistsWithoutImages.length === 0) {
      toast.info('Tous les artistes ont déjà une image');
      return;
    }

    setGeneratingAll(true);
    setProgress({ current: 0, total: artistsWithoutImages.length });

    for (let i = 0; i < artistsWithoutImages.length; i++) {
      const artist = artistsWithoutImages[i];
      setProgress({ current: i + 1, total: artistsWithoutImages.length });
      
      try {
        const gender = detectGender(artist);
        
        const { data, error } = await supabase.functions.invoke('generate-artist-image', {
          body: {
            artistId: artist.id,
            stageName: artist.stage_name,
            voiceType: artist.voice_type,
            gender: gender
          }
        });

        if (error) throw error;

        if (data.success) {
          toast.success(`Image générée pour ${artist.stage_name}`);
        } else {
          throw new Error(data.error || 'Erreur inconnue');
        }
        
        // Attendre un peu entre chaque génération pour éviter les limites de taux
        if (i < artistsWithoutImages.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error(`Error generating image for ${artist.stage_name}:`, error);
        toast.error(`Erreur pour ${artist.stage_name}: ${error.message}`);
      }
    }

    setGeneratingAll(false);
    setProgress({ current: 0, total: 0 });
    onImagesGenerated();
    toast.success('Génération terminée !');
  };

  const artistsWithoutImages = artists.filter(artist => !artist.profile_image_url);
  const artistsWithImages = artists.filter(artist => artist.profile_image_url);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImagePlus className="h-5 w-5" />
          Génération d'Images d'Artistes
        </CardTitle>
        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4 text-green-500" />
            {artistsWithImages.length} avec image
          </span>
          <span className="flex items-center gap-1">
            <AlertCircle className="h-4 w-4 text-orange-500" />
            {artistsWithoutImages.length} sans image
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {artistsWithoutImages.length > 0 && (
          <div className="flex gap-2">
            <Button 
              onClick={generateAllImages}
              disabled={generatingAll || generatingForId !== null}
              className="flex items-center gap-2"
            >
              {generatingAll ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ImagePlus className="h-4 w-4" />
              )}
              Générer toutes les images manquantes
              {artistsWithoutImages.length > 0 && ` (${artistsWithoutImages.length})`}
            </Button>
          </div>
        )}

        {generatingAll && (
          <div className="bg-muted p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Génération en cours...</span>
              <span className="text-sm text-muted-foreground">
                {progress.current} / {progress.total}
              </span>
            </div>
            <div className="w-full bg-background rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <h4 className="font-medium">Artistes sans image :</h4>
          <div className="grid gap-2">
            {artistsWithoutImages.map((artist) => (
              <div key={artist.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div>
                    <span className="font-medium">{artist.stage_name}</span>
                    {artist.voice_type && (
                      <Badge variant="secondary" className="ml-2">
                        {artist.voice_type}
                      </Badge>
                    )}
                    <Badge variant="outline" className="ml-2">
                      {detectGender(artist) === 'female' ? 'Femme' : 
                       detectGender(artist) === 'male' ? 'Homme' : 'Non déterminé'}
                    </Badge>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => generateImageForArtist(artist)}
                  disabled={generatingForId === artist.id || generatingAll}
                >
                  {generatingForId === artist.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ImagePlus className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        </div>

        {artistsWithImages.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-green-700">Artistes avec image :</h4>
            <div className="grid gap-2">
              {artistsWithImages.slice(0, 5).map((artist) => (
                <div key={artist.id} className="flex items-center gap-3 p-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>{artist.stage_name}</span>
                  {artist.voice_type && (
                    <Badge variant="secondary">
                      {artist.voice_type}
                    </Badge>
                  )}
                </div>
              ))}
              {artistsWithImages.length > 5 && (
                <div className="text-sm text-muted-foreground pl-7">
                  ... et {artistsWithImages.length - 5} autres
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};