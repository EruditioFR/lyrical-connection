import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, ChevronLeft, ChevronRight, ExternalLink, Loader2, Pause, Play, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { saveCandidateScore } from '@/hooks/useCandidateScores';

type Draft = Record<string, { score: number; comments: string }>;

const timeLabel = (iso: string | null) =>
  iso ? new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '—';

/** Séance d'audition : le juré passe d'un candidat à l'autre et note chaque critère sur 20 */
const AuditionSession = () => {
  const { castingId } = useParams<{ castingId: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [index, setIndex] = useState(0);
  const [draft, setDraft] = useState<Draft>({});
  const [saving, setSaving] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['audition-session', castingId, user?.id],
    queryFn: async () => {
      const { data: casting, error: castingError } = await supabase
        .from('castings')
        .select('id, title, professional_profile_id, audition_location')
        .eq('id', castingId as string)
        .maybeSingle();
      if (castingError) throw castingError;
      if (!casting) throw new Error("Casting introuvable ou vous n'êtes pas membre de son jury.");

      const [apps, criteria] = await Promise.all([
        supabase
          .from('applications')
          .select('id, status, audition_scheduled_at, artist_profile_id, artist_profiles(stage_name, voice_type)')
          .eq('casting_id', casting.id)
          .neq('status', 'rejected'),
        supabase
          .from('custom_criteria')
          .select('id, name, description')
          .eq('professional_profile_id', casting.professional_profile_id)
          .eq('is_active', true)
          .order('display_order', { ascending: true }),
      ]);
      if (apps.error) throw apps.error;
      if (criteria.error) throw criteria.error;

      // Ordre de passage : horaire d'audition, puis candidats non programmés
      const candidates = [...(apps.data || [])].sort((a, b) =>
        (a.audition_scheduled_at || '9999').localeCompare(b.audition_scheduled_at || '9999') ||
        (a.artist_profiles?.stage_name || '').localeCompare(b.artist_profiles?.stage_name || '', 'fr')
      );
      const ids = candidates.map(c => c.id);
      const scores = ids.length
        ? await supabase.from('candidate_scores').select('application_id, criteria_id, score, comments')
            .in('application_id', ids).eq('scored_by', user!.id)
        : { data: [], error: null };
      if (scores.error) throw scores.error;
      return { casting, candidates, criteria: criteria.data || [], scores: scores.data || [] };
    },
    enabled: !!castingId && !!user,
  });

  const candidates = data?.candidates || [];
  const criteria = data?.criteria || [];
  const current = candidates[index];

  const scoredIds = useMemo(() => {
    const byApp = new Map<string, number>();
    (data?.scores || []).forEach(s => byApp.set(s.application_id, (byApp.get(s.application_id) || 0) + 1));
    return new Set([...byApp].filter(([, n]) => n >= criteria.length && criteria.length > 0).map(([id]) => id));
  }, [data?.scores, criteria.length]);

  // Pré-remplir la grille avec les notes déjà données à ce candidat
  useEffect(() => {
    if (!current) return;
    const next: Draft = {};
    criteria.forEach(c => {
      const s = data?.scores.find(x => x.application_id === current.id && x.criteria_id === c.id);
      next[c.id] = { score: s?.score ?? 10, comments: s?.comments ?? '' };
    });
    setDraft(next);
    setElapsed(0);
    setRunning(false);
    // Réinitialiser seulement au changement de candidat ou de notes enregistrées
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id, criteria, data?.scores]);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  const saveAndGo = async (step: number) => {
    if (!current || !user) return;
    setSaving(true);
    try {
      await Promise.all(criteria.map(c => saveCandidateScore({
        application_id: current.id,
        criteria_id: c.id,
        score: draft[c.id]?.score ?? 10,
        comments: draft[c.id]?.comments || null,
        scored_by: user.id,
      })));
      await queryClient.invalidateQueries({ queryKey: ['audition-session', castingId, user.id] });
      queryClient.invalidateQueries({ queryKey: ['candidate-scores'] });
      toast({ title: `Notes de ${current.artist_profiles?.stage_name} enregistrées` });
      setIndex(i => Math.min(Math.max(i + step, 0), candidates.length - 1));
    } catch (e) {
      toast({ title: 'Erreur', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return <Layout><div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></Layout>;
  }
  if (error || !data) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl">Séance d'audition</h1>
          <p className="mt-3 text-muted-foreground">{(error as Error)?.message || 'Impossible de charger la séance.'}</p>
        </div>
      </Layout>
    );
  }

  const average = criteria.length
    ? (criteria.reduce((sum, c) => sum + (draft[c.id]?.score ?? 0), 0) / criteria.length).toFixed(1)
    : null;
  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const ss = String(elapsed % 60).padStart(2, '0');

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">Séance d'audition</p>
          <h1 className="text-3xl">{data.casting.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Vos notes restent personnelles ; le responsable du casting voit la synthèse du jury.
          </p>
        </div>

        {criteria.length === 0 ? (
          <Card><CardContent className="py-10 text-center text-muted-foreground">
            Aucun critère de notation n'est défini pour ce casting. Le responsable peut les créer dans
            {' '}<Link to="/casting-dashboard" className="underline">Tableau de bord Casting → Critères</Link>.
          </CardContent></Card>
        ) : candidates.length === 0 ? (
          <Card><CardContent className="py-10 text-center text-muted-foreground">Aucun candidat à auditionner.</CardContent></Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[18rem_1fr]">
            <nav aria-label="Ordre de passage" className="rounded-lg border">
              <p className="border-b px-4 py-3 text-sm font-medium">
                Ordre de passage · {scoredIds.size}/{candidates.length} noté(s)
              </p>
              <ol className="max-h-[60vh] overflow-y-auto">
                {candidates.map((c, i) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => setIndex(i)}
                      aria-current={i === index ? 'step' : undefined}
                      className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm hover:bg-muted ${i === index ? 'bg-muted font-medium' : ''}`}
                    >
                      <span className="w-12 tabular-nums text-muted-foreground">{timeLabel(c.audition_scheduled_at)}</span>
                      <span className="flex-1">{c.artist_profiles?.stage_name}</span>
                      {scoredIds.has(c.id) && <Check className="h-4 w-4 text-primary" aria-label="noté" />}
                    </button>
                  </li>
                ))}
              </ol>
            </nav>

            {current && (
              <Card>
                <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4 space-y-0">
                  <div>
                    <CardTitle className="text-2xl">{current.artist_profiles?.stage_name}</CardTitle>
                    <p className="text-muted-foreground">
                      {[current.artist_profiles?.voice_type, current.audition_scheduled_at && `passage prévu à ${timeLabel(current.audition_scheduled_at)}`].filter(Boolean).join(' · ')}
                    </p>
                    <a href={`/artistes/${current.artist_profile_id}`} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-sm text-primary hover:underline">
                      Fiche, répertoire et enregistrements <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    </a>
                  </div>
                  <div className="flex items-center gap-2" aria-label="Chronomètre">
                    <span className="font-mono text-2xl tabular-nums" aria-live="off">{mm}:{ss}</span>
                    <Button size="icon" variant="outline" aria-label={running ? 'Mettre en pause' : 'Démarrer le chronomètre'} onClick={() => setRunning(r => !r)}>
                      {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button size="icon" variant="ghost" aria-label="Remettre à zéro" onClick={() => { setElapsed(0); setRunning(false); }}>
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {criteria.map(c => {
                    const value = draft[c.id]?.score ?? 10;
                    return (
                      <div key={c.id} className="space-y-2">
                        <div className="flex items-baseline justify-between gap-4">
                          <Label htmlFor={`score-${c.id}`} className="text-base">{c.name}</Label>
                          <span className="font-mono text-xl tabular-nums" aria-hidden="true">{value}/20</span>
                        </div>
                        {c.description && <p className="text-sm text-muted-foreground">{c.description}</p>}
                        <input
                          id={`score-${c.id}`}
                          type="range"
                          min={1}
                          max={20}
                          step={1}
                          value={value}
                          aria-valuetext={`${value} sur 20`}
                          onChange={e => setDraft(d => ({ ...d, [c.id]: { ...d[c.id], score: Number(e.target.value) } }))}
                          className="w-full accent-primary"
                        />
                        <Label htmlFor={`comment-${c.id}`} className="sr-only">Commentaire sur {c.name}</Label>
                        <Input
                          id={`comment-${c.id}`}
                          value={draft[c.id]?.comments ?? ''}
                          onChange={e => setDraft(d => ({ ...d, [c.id]: { ...d[c.id], comments: e.target.value } }))}
                          placeholder="Commentaire (facultatif)"
                        />
                      </div>
                    );
                  })}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                    <p className="text-lg">Moyenne : <span className="font-semibold">{average}/20</span></p>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" disabled={index === 0 || saving} onClick={() => setIndex(i => i - 1)}>
                        <ChevronLeft className="h-4 w-4 mr-1" /> Précédent
                      </Button>
                      <Button variant="outline" disabled={saving} onClick={() => saveAndGo(0)}>Enregistrer</Button>
                      <Button disabled={saving} onClick={() => saveAndGo(1)}>
                        {index === candidates.length - 1 ? 'Enregistrer' : 'Enregistrer et suivant'}
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AuditionSession;
