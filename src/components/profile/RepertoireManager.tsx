
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Music } from 'lucide-react';
import { useArtistRepertoire } from '@/hooks/useArtistRepertoire';
import RepertoireAddForm from './repertoire/RepertoireAddForm';
import RepertoireList from './repertoire/RepertoireList';

interface RepertoireManagerProps {
  artistProfileId: string;
}

const RepertoireManager: React.FC<RepertoireManagerProps> = ({ artistProfileId }) => {
  const { repertoire, isLoading, addToRepertoire, updateRepertoire, deleteFromRepertoire, isAdding, isUpdating } = useArtistRepertoire(artistProfileId);

  if (isLoading) {
    return <div className="text-center py-8">Chargement du répertoire...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5" />
          Répertoire lyrique
        </CardTitle>
        <CardDescription>
          Gérez votre répertoire d'airs lyriques
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Header avec compteur et bouton d'ajout */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Mes airs ({repertoire.length})</h3>
          <RepertoireAddForm
            artistProfileId={artistProfileId}
            onAdd={addToRepertoire}
            isAdding={isAdding}
          />
        </div>

        {/* Liste du répertoire */}
        <RepertoireList
          repertoire={repertoire}
          onUpdate={updateRepertoire}
          onDelete={deleteFromRepertoire}
          isUpdating={isUpdating}
        />
      </CardContent>
    </Card>
  );
};

export default RepertoireManager;
