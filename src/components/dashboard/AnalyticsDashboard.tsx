import React from 'react';
import { useAnalytics, useProfileViews } from '@/hooks/useAnalytics';
import { useArtistProfile } from '@/hooks/useArtistProfile';
import { useProfessionalProfile } from '@/hooks/useProfessionalProfile';
import { Skeleton } from '@/components/ui/skeleton';
import { Panel, PanelList, PanelEmpty, Stat, StatRow } from '@/components/dashboard/Panel';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface AnalyticsDashboardProps {
  profileType: 'artist' | 'professional';
}

// Série unique en rouge rideau (jeton --chart-1, validé en clair et en sombre) ; axes et grille en retrait
const SERIES = 'hsl(var(--chart-1))';
const AXIS = { fontSize: 12, fill: 'hsl(var(--muted-foreground))' };
const GRID = 'hsl(var(--border))';

const shortDate = (value: string) =>
  new Date(`${value}T00:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
const longDate = (value: string) =>
  new Date(`${value}T00:00:00`).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

const ChartTooltip = ({ active, payload, label, prefix = '' }: {
  active?: boolean; payload?: { value: number }[]; label?: string; prefix?: string;
}) =>
  active && payload?.length ? (
    <div className="border border-border bg-popover px-3 py-2 text-sm shadow-lg">
      <p className="text-muted-foreground">{prefix}{label && longDate(label)}</p>
      <p className="font-semibold tabular-nums">{payload[0].value} vue{payload[0].value > 1 ? 's' : ''}</p>
    </div>
  ) : null;

const AnalyticsDashboard = ({ profileType }: AnalyticsDashboardProps) => {
  const { profile: artistProfile } = useArtistProfile();
  const { profile: professionalProfile } = useProfessionalProfile();
  const profileId = profileType === 'artist' ? artistProfile?.id : professionalProfile?.id;

  const { data: analytics, isLoading } = useAnalytics(profileId, profileType);
  const { data: recentViews } = useProfileViews(profileId, profileType);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 border-y border-border py-4" aria-busy="true">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (!analytics) return null;

  const change = analytics.change7;
  const changeNote =
    change === null
      ? 'Pas encore de semaine de comparaison'
      : `${change > 0 ? '+' : ''}${change} % par rapport aux 7 jours précédents`;
  const hasViews = analytics.periodViews > 0;

  return (
    <div className="space-y-10">
      <StatRow>
        <Stat label="7 derniers jours" value={analytics.last7} note={changeNote} />
        <Stat label="Aujourd'hui" value={analytics.today} />
        <Stat label="12 semaines" value={analytics.periodViews} note="Vues de votre profil" />
        <Stat label="Membres" value={analytics.distinctMembers} note="Membres connectés distincts" />
      </StatRow>

      {hasViews ? (
        <div className="grid gap-10 lg:grid-cols-2">
          <Panel title="Vues par jour">
            <p className="text-sm text-muted-foreground mb-4">30 derniers jours</p>
            <div role="img" aria-label={`Vues par jour sur 30 jours, ${analytics.dailyViews.reduce((s, d) => s + d.count, 0)} au total`}>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={analytics.dailyViews} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid stroke={GRID} vertical={false} />
                  <XAxis dataKey="date" tick={AXIS} tickLine={false} axisLine={{ stroke: GRID }} tickFormatter={shortDate} minTickGap={24} />
                  <YAxis tick={AXIS} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1 }} />
                  <Area type="monotone" dataKey="count" stroke={SERIES} strokeWidth={2} fill={SERIES} fillOpacity={0.12}
                    activeDot={{ r: 4, stroke: 'hsl(var(--background))', strokeWidth: 2, fill: SERIES }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel title="Vues par semaine">
            <p className="text-sm text-muted-foreground mb-4">12 dernières semaines</p>
            <div role="img" aria-label={`Vues par semaine sur 12 semaines, ${analytics.periodViews} au total`}>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={analytics.weeklyViews} margin={{ top: 8, right: 8, left: -16, bottom: 0 }} barCategoryGap={4}>
                  <CartesianGrid stroke={GRID} vertical={false} />
                  <XAxis dataKey="week" tick={AXIS} tickLine={false} axisLine={{ stroke: GRID }} tickFormatter={shortDate} minTickGap={24} />
                  <YAxis tick={AXIS} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip content={<ChartTooltip prefix="Semaine du " />} cursor={{ fill: 'hsl(var(--muted))' }} />
                  <Bar dataKey="count" fill={SERIES} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>
      ) : (
        <PanelEmpty>
          Votre profil n'a pas encore été consulté. Les visites apparaîtront ici dès les premières consultations.
        </PanelEmpty>
      )}

      <Panel title="Dernières visites">
        {recentViews && recentViews.length > 0 ? (
          <PanelList>
            {recentViews.slice(0, 20).map((view) => (
              <li key={view.id} className="flex items-baseline justify-between gap-4 py-3">
                <span className="text-sm">{view.viewer_id ? 'Membre connecté' : 'Visiteur anonyme'}</span>
                <time dateTime={view.created_at} className="text-sm text-muted-foreground tabular-nums">
                  {new Date(view.created_at).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}
                </time>
              </li>
            ))}
          </PanelList>
        ) : (
          <PanelEmpty>Aucune visite récente.</PanelEmpty>
        )}
      </Panel>
    </div>
  );
};

export default AnalyticsDashboard;
