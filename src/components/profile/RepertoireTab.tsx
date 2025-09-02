import React from 'react';
import { RepertoireManager } from './RepertoireManager';
interface RepertoireTabProps {
  artistProfileId: string;
}
const RepertoireTab = ({
  artistProfileId
}: RepertoireTabProps) => {
  return <div className="space-y-6">
      <div>
        
        
        <RepertoireManager artistProfileId={artistProfileId} />
      </div>
    </div>;
};
export default RepertoireTab;