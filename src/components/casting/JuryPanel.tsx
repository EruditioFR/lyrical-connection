import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, Gavel, UserPlus, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCastingJury, useProfessionalSearch } from '@/hooks/useCastingJury';
import { toCSV, downloadFile } from '@/utils/auditionSchedule';
import { applicationStatusLabel } from '@/constants/applicationStatus';
import type { ApplicationWithDetails } from '@/hooks/useApplications';
import { synthesize } from '@/utils/jurySynthesis';

interface JuryPanelProps {
  castingId: string;
  castingTitle: string;
  ownerProfessionalProfileId: string;
  applications: ApplicationWithDetails[];
}

const fmt = (n: number | null | undefined) => (n === null || n === undefined ? '—' : n.toFixed(1));

/** Jury d'un casting : invitation des jurés et synthèse de leurs notes */
const JuryPanel = ({ castingId, castingTitle, ownerProfessionalProfileId, applications }: JuryPanelProps) => {
  const { user } = useAuth();
  const { members, unavailable, invite, remove } = useCastingJury(castingId);
  const [term, setTerm] = useState('');
  const results = useProfessionalSearch(term, [ownerProfessionalProfileId, ...members.map(m => m.professional_profile_id)]);

  const appIds = applications.map(a => a.id);
  const { data: scores = [] } = useQuery({
    queryKey: ['jury-synthesis', castingId, appIds],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('candidate_scores')
        .select('application_id, scored_by, score')
        .in('application_id', appIds);
      if (error) throw error;
      return data || [];
    },
    enabled: appIds.length > 0,
  });

  // Colonnes : vous, puis chaque juré invité
  const jurors = [
    { userId: user?.id || '', name: 'Vous' },
    ...members.filter(m => m.professional_profiles).map(m => ({ userId: m.professional_profiles!.user_id, name: m.professional_profiles!.company_name })),
  ];
  const rows = synthesize(appIds, scores)
    .map(r => ({ ...r, app: applications.find(a => a.id === r.applicationId)! }))
    .sort((a, b) => (b.overall ?? -1) - (a.overall ?? -1));

  const exportCsv = () => downloadFile(
    `jury-${castingTitle.replace(/[^\p{L}\p{N}]+/gu, '-').toLowerCase()}.csv`,
    toCSV(['Rang', 'Artiste', 'Tessiture', 'Statut', ...jurors.map(j => j.name), 'Moyenne'],
      rows.map((r, i) => [r.overall === null ? '' : i + 1, r.app.artist_profiles?.stage_name, r.app.artist_profiles?.voice_type,
        applicationStatusLabel(r.app.status), ...jurors.map(j => fmt(r.jurorAverages.get(j.userId))), fmt(r.overall)])),
    'text/csv;charset=utf-8'
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0">
          <CardTitle className="flex items-center gap-2 text-xl"><Gavel className="h-5 w-5" /> Jury</CardTitle>
          <Button asChild>
            <Link to={`/professional/castings/${castingId}/seance`}>Ouvrir la séance d'audition</Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {unavailable ? (
            <p className="text-sm text-muted-foreground">
              L'invitation de jurés sera disponible après la mise à jour de la base de données. Vous pouvez déjà noter seul en séance.
            </p>
          ) : (
            <>
              <ul className="flex flex-wrap gap-2">
                <li className="rounded-full border px-3 py-1 text-sm">Vous (responsable)</li>
                {members.map(m => (
                  <li key={m.id} className="flex items-center gap-1 rounded-full border px-3 py-1 text-sm">
                    {m.professional_profiles?.company_name || 'Professionnel'}
                    <button type="button" aria-label={`Retirer ${m.professional_profiles?.company_name} du jury`} onClick={() => remove.mutate(m.id)}>
                      <X className="h-3 w-3" />
                    </button>
                  </li>
                ))}
              </ul>
              <div className="max-w-md space-y-2">
                <Label htmlFor="jury-search">Inviter un juré (professionnel inscrit)</Label>
                <Input id="jury-search" value={term} onChange={e => setTerm(e.target.value)} placeholder="Nom de la structure" />
                {results.length > 0 && (
                  <ul className="divide-y rounded-md border">
                    {results.map(p => (
                      <li key={p.id} className="flex items-center justify-between gap-2 px-3 py-2 text-sm">
                        <span>{p.company_name}{p.location && <span className="text-muted-foreground"> · {p.location}</span>}</span>
                        <Button size="sm" variant="outline" disabled={invite.isPending} onClick={() => invite.mutate(p.id, { onSuccess: () => setTerm('') })}>
                          <UserPlus className="h-4 w-4 mr-1" /> Inviter
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
                {term.trim().length >= 2 && results.length === 0 && (
                  <p className="text-sm text-muted-foreground">Aucun professionnel trouvé.</p>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0">
          <CardTitle className="text-xl">Synthèse des notes</CardTitle>
          <Button size="sm" variant="outline" onClick={exportCsv} disabled={scores.length === 0}>
            <Download className="h-4 w-4 mr-1" /> CSV
          </Button>
        </CardHeader>
        <CardContent>
          {scores.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune note pour l'instant. Les notes apparaissent ici dès qu'un juré les enregistre.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <caption className="sr-only">Moyennes sur 20 par juré et moyenne générale</caption>
                <thead>
                  <tr className="border-b text-left">
                    <th scope="col" className="py-2 pr-4">Rang</th>
                    <th scope="col" className="py-2 pr-4">Artiste</th>
                    {jurors.map(j => <th key={j.userId} scope="col" className="py-2 pr-4 text-right">{j.name}</th>)}
                    <th scope="col" className="py-2 text-right">Moyenne /20</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {rows.map((r, i) => (
                    <tr key={r.applicationId}>
                      <td className="py-2 pr-4 tabular-nums">{r.overall === null ? '—' : i + 1}</td>
                      <td className="py-2 pr-4">
                        {r.app.artist_profiles?.stage_name}
                        <span className="text-muted-foreground"> · {r.app.artist_profiles?.voice_type}</span>
                      </td>
                      {jurors.map(j => <td key={j.userId} className="py-2 pr-4 text-right tabular-nums">{fmt(r.jurorAverages.get(j.userId))}</td>)}
                      <td className="py-2 text-right font-semibold tabular-nums">{fmt(r.overall)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default JuryPanel;
