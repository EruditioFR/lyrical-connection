
import React from 'react';
import { RepertoireManager } from './RepertoireManager';

interface RepertoireTabProps {
  artistProfileId: string;
}

const RepertoireTab = ({ artistProfileId }: RepertoireTabProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Répertoire lyrique structuré</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Ajoutez vos airs spécifiques du répertoire lyrique classique
        </p>
        <RepertoireManager artistProfileId={artistProfileId} />
      </div>
    </div>
  );
};

export default RepertoireTab;
