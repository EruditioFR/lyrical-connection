import React from 'react';
import { initials } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DashboardProfessional } from '@/hooks/useDashboardData';
import { getProfessionalRoleLabel } from '@/constants/professionalRoles';
import { Panel, PanelList, PanelLink, PanelEmpty, PanelSkeleton } from '@/components/dashboard/Panel';

interface ProfessionalsPreviewProps {
  professionals: DashboardProfessional[];
  isLoading: boolean;
}

const ProfessionalsPreview: React.FC<ProfessionalsPreviewProps> = ({ professionals, isLoading }) => (
  <Panel title="Professionnels" action={{ to: '/professionnels', label: 'Tous les professionnels' }}>
    {isLoading ? (
      <PanelSkeleton />
    ) : professionals.length === 0 ? (
      <PanelEmpty>Aucun professionnel à afficher pour le moment.</PanelEmpty>
    ) : (
      <PanelList>
        {professionals.map((professional) => (
          <PanelLink key={professional.id} to={`/professionnels/${professional.id}`} className="items-center">
            <Avatar className="h-12 w-12">
              <AvatarImage src={professional.profile_image_url || ''} alt="" />
              <AvatarFallback>{initials(professional.company_name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-serif text-base truncate">{professional.company_name}</p>
              <p className="text-sm text-muted-foreground truncate">
                {[getProfessionalRoleLabel(professional.professional_role), professional.location].filter(Boolean).join(' · ')}
              </p>
            </div>
          </PanelLink>
        ))}
      </PanelList>
    )}
  </Panel>
);

export default ProfessionalsPreview;
