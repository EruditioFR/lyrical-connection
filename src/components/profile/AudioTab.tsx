
import React from 'react';
import AirManager from './AirManager';

interface AudioTabProps {
  artistProfileId: string;
}

const AudioTab = ({ artistProfileId }: AudioTabProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Vos médias</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Ajoutez et gérez vos enregistrements audio et vidéos
        </p>
        <AirManager artistProfileId={artistProfileId} />
      </div>
    </div>
  );
};

export default AudioTab;
