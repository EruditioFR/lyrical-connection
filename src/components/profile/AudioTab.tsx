import React from 'react';
import AirManager from './AirManager';

interface AudioTabProps {
  artistProfileId: string;
}

const AudioTab = ({
  artistProfileId
}: AudioTabProps) => {
  return (
    <div className="space-y-6">
      <AirManager artistProfileId={artistProfileId} />
    </div>
  );
};
export default AudioTab;