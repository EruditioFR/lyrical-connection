import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useMyCastings } from '@/hooks/useCastings';
import { APPLICATION_PIPELINE } from '@/constants/applicationStatus';
import { Panel, PanelList, PanelLink, PanelEmpty, PanelSkeleton, Stat, StatRow } from '@/components/dashboard/Panel';

// Chiffres réels des castings du professionnel connecté (aucune donnée d'exemple)
export const CastingAnalytics = () => {
  const { castings, isLoading: castingsLoading } = useMyCastings();
  const castingIds = castings.map(c => c.id);

  const { data: applications = [], isLoading: applicationsLoading } = useQuery({
    queryKey: ['casting-analytics-applications', castingIds],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('applications')
        .select('casting_id, status')
        .in('casting_id', castingIds);
      if (error) throw error;
      return data ?? [];
    },
    enabled: castingIds.length > 0,
  });

  if (castingsLoading || (castingIds.length > 0 && applicationsLoading)) return <PanelSkeleton />;

  if (castings.length === 0) {
    return <PanelEmpty>Vous n'avez pas encore publié de casting : les chiffres apparaîtront ici.</PanelEmpty>;
  }

  const today = format(new Date(), 'yyyy-MM-dd');
  const open = castings.filter(c => c.is_active && c.application_deadline >= today).length;
  const byStatus = (status: string) => applications.filter(a => a.status === status).length;
  const perCasting = (id: string) => applications.filter(a => a.casting_id === id).length;

  return (
    <div className="space-y-10">
      <StatRow>
        <Stat label="Castings" value={castings.length} />
        <Stat label="Ouverts" value={open} note="Date limite non dépassée" />
        <Stat label="Candidatures" value={applications.length} />
        <Stat
          label="Moyenne"
          value={castings.length ? Math.round((applications.length / castings.length) * 10) / 10 : 0}
          note="Candidatures par casting"
        />
      </StatRow>

      <Panel title="Où en sont les candidatures">
        <dl className="divide-y divide-border">
          {APPLICATION_PIPELINE.map(({ status, plural }) => (
            <div key={status} className="flex items-baseline justify-between py-3">
              <dt>{plural}</dt>
              <dd className="font-serif text-xl tabular-nums">{byStatus(status)}</dd>
            </div>
          ))}
        </dl>
      </Panel>

      <Panel title="Par casting">
        <PanelList>
          {castings.map((casting) => (
            <PanelLink
              key={casting.id}
              to={`/professional/castings/${casting.id}/applications`}
              className="items-baseline justify-between"
            >
              <span className="min-w-0 truncate">{casting.title}</span>
              <span className="text-sm text-muted-foreground tabular-nums shrink-0">
                {perCasting(casting.id)} candidature{perCasting(casting.id) > 1 ? 's' : ''}
              </span>
            </PanelLink>
          ))}
        </PanelList>
      </Panel>
    </div>
  );
};
