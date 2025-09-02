import React from 'react';
import AirManager from './AirManager';
import AirPlayer from './AirPlayer';

interface AudioTabProps {
  artistProfileId: string;
}

const AudioTab = ({
  artistProfileId
}: AudioTabProps) => {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Écouter vos airs</h3>
        <AirPlayer artistProfileId={artistProfileId} />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Gérer vos airs</h3>
        <AirManager artistProfileId={artistProfileId} />
      </div>
    </div>
  );
};
export default AudioTab;