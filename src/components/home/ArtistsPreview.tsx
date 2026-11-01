import React from 'react';
import { initials } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DashboardArtist } from '@/hooks/useDashboardData';
import { Panel, PanelList, PanelLink, PanelEmpty, PanelSkeleton } from '@/components/dashboard/Panel';

interface ArtistsPreviewProps {
  artists: DashboardArtist[];
  isLoading: boolean;
}

const ArtistsPreview: React.FC<ArtistsPreviewProps> = ({ artists, isLoading }) => (
  <Panel title="Artistes" action={{ to: '/artistes', label: 'Tous les artistes' }}>
    {isLoading ? (
      <PanelSkeleton />
    ) : artists.length === 0 ? (
      <PanelEmpty>Aucun artiste à afficher pour le moment.</PanelEmpty>
    ) : (
      <PanelList>
        {artists.map((artist) => (
          <PanelLink key={artist.id} to={`/artistes/${artist.id}`} className="items-center">
            <Avatar className="h-12 w-12">
              <AvatarImage src={artist.profile_image_url || ''} alt="" />
              <AvatarFallback>{initials(artist.stage_name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-serif text-base truncate">{artist.stage_name}</p>
              <p className="text-sm text-muted-foreground truncate">
                {[artist.voice_type, artist.location].filter(Boolean).join(' · ')}
              </p>
            </div>
          </PanelLink>
        ))}
      </PanelList>
    )}
  </Panel>
);

export default ArtistsPreview;
