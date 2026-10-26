import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Music, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useProfessionalProfile } from '@/hooks/useProfessionalProfile';
import { useArtistEvaluations } from '@/hooks/useArtistEvaluations';
import { useArtistNotes } from '@/hooks/useArtistLists';

const MAX_COMPARE = 4;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const EVALUATION_CRITERIA = [
  ['vocal_quality', 'Qualité vocale'],
  ['vocal_technique', 'Technique'],
  ['stage_presence', 'Présence scénique'],
  ['language_mastery', 'Langues'],
  ['pitch_accuracy', 'Justesse'],
] as const;

const MASTERY_LABELS: Record<string, string> = {
  beginner: 'découverte',
  intermediate: 'en travail',
  advanced: 'maîtrisé',
  expert: 'chanté en scène',
};

/** Comparaison côte à côte de 2 à 4 artistes : profil, répertoire, enregistrements, évaluations et notes */
const CompareArtists = () => {
  const [params] = useSearchParams();
  const ids = [...new Set((params.get('ids') || '').split(',').filter(id => UUID.test(id)))].slice(0, MAX_COMPARE);
  const { profile: professionalProfile } = useProfessionalProfile();
  const { evaluations } = useArtistEvaluations(professionalProfile?.id);
  const { noteFor } = useArtistNotes(professionalProfile?.id);

  const { data, isLoading } = useQuery({
    queryKey: ['compare-artists', ids],
    queryFn: async () => {
      const [profiles, repertoire, airs] = await Promise.all([
        supabase
          .from('artist_profiles')
          .select('id, stage_name, voice_type, location, nationality, experience_years, spoken_languages, artist_photos(file_path, is_profile_photo)')
          .in('id', ids),
        supabase
          .from('artist_repertoire')
          .select('artist_profile_id, mastery_level, lyrical_works(title, composer), work_roles(role_name)')
          .in('artist_profile_id', ids),
        supabase
          .from('artist_airs')
          .select('id, artist_profile_id, title, type, external_url, file_path')
          .in('artist_profile_id', ids)
          .eq('is_active', true)
          .order('display_order', { ascending: true }),
      ]);
      if (profiles.error) throw profiles.error;
      // Garder l'ordre choisi par l'utilisateur
      const ordered = ids.map(id => profiles.data.find(p => p.id === id)).filter(Boolean) as NonNullable<typeof profiles.data>[number][];
      return { profiles: ordered, repertoire: repertoire.data || [], airs: airs.data || [] };
    },
    enabled: ids.length >= 2,
  });

  const photoUrl = (photos: { file_path: string; is_profile_photo: boolean | null }[] | null) => {
    const photo = photos?.find(p => p.is_profile_photo);
    return photo ? supabase.storage.from('artist-photos').getPublicUrl(photo.file_path).data.publicUrl : null;
  };
  const airUrl = (air: { external_url: string | null; file_path: string | null }) =>
    air.external_url || (air.file_path ? supabase.storage.from('artist-airs').getPublicUrl(air.file_path).data.publicUrl : null);

  if (ids.length < 2) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center space-y-4">
          <h1 className="text-3xl">Comparer des artistes</h1>
          <p className="text-muted-foreground">Sélectionnez 2 à 4 artistes dans la recherche ou dans une de vos listes.</p>
          <Button asChild><Link to="/recherche-artistes">Rechercher des artistes</Link></Button>
        </div>
      </Layout>
    );
  }

  const profiles = data?.profiles || [];
  const rowHeader = 'sticky left-0 z-10 bg-background w-40 min-w-[10rem] py-4 pr-4 text-left align-top text-sm font-semibold';
  const cell = 'min-w-[14rem] py-4 px-4 align-top text-sm';

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl">Comparer des artistes</h1>
            <p className="mt-2 text-muted-foreground">Vos évaluations et notes ne sont visibles que par vous.</p>
          </div>
          <Button variant="outline" asChild><Link to="/recherche-artistes">Retour à la recherche</Link></Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full border-collapse">
              <caption className="sr-only">Comparaison de {profiles.length} artistes</caption>
              <thead>
                <tr className="border-b">
                  <td className={rowHeader} />
                  {profiles.map(p => {
                    const url = photoUrl(p.artist_photos);
                    return (
                      <th key={p.id} scope="col" className={`${cell} text-left`}>
                        {url ? (
                          <img src={url} alt={`Portrait de ${p.stage_name}`} className="mb-3 aspect-[3/4] w-full max-w-[12rem] rounded-md object-cover" />
                        ) : (
                          <div className="mb-3 flex aspect-[3/4] w-full max-w-[12rem] items-center justify-center rounded-md bg-muted">
                            <Music className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
                          </div>
                        )}
                        <Link to={`/artistes/${p.id}`} className="font-serif text-xl font-semibold hover:underline">{p.stage_name}</Link>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <th scope="row" className={rowHeader}>Tessiture</th>
                  {profiles.map(p => <td key={p.id} className={cell}>{p.voice_type || '—'}</td>)}
                </tr>
                <tr>
                  <th scope="row" className={rowHeader}>Lieu · nationalité</th>
                  {profiles.map(p => <td key={p.id} className={cell}>{[p.location, p.nationality].filter(Boolean).join(' · ') || '—'}</td>)}
                </tr>
                <tr>
                  <th scope="row" className={rowHeader}>Expérience</th>
                  {profiles.map(p => <td key={p.id} className={cell}>{p.experience_years ? `${p.experience_years} ans` : '—'}</td>)}
                </tr>
                <tr>
                  <th scope="row" className={rowHeader}>Langues</th>
                  {profiles.map(p => <td key={p.id} className={cell}>{p.spoken_languages?.length ? p.spoken_languages.join(', ') : '—'}</td>)}
                </tr>
                <tr>
                  <th scope="row" className={rowHeader}>Répertoire</th>
                  {profiles.map(p => {
                    const works = data!.repertoire.filter(r => r.artist_profile_id === p.id);
                    return (
                      <td key={p.id} className={cell}>
                        {works.length === 0 ? '—' : (
                          <ul className="space-y-1">
                            {works.map((r, i) => (
                              <li key={i}>
                                <span className="italic">{r.lyrical_works?.title}</span>
                                {r.work_roles?.role_name && ` — ${r.work_roles.role_name}`}
                                <span className="text-muted-foreground">
                                  {r.lyrical_works?.composer && ` (${r.lyrical_works.composer})`}
                                  {r.mastery_level && MASTERY_LABELS[r.mastery_level] && `, ${MASTERY_LABELS[r.mastery_level]}`}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <th scope="row" className={rowHeader}>Enregistrements</th>
                  {profiles.map(p => {
                    const list = data!.airs.filter(a => a.artist_profile_id === p.id);
                    return (
                      <td key={p.id} className={cell}>
                        {list.length === 0 ? '—' : (
                          <ul className="space-y-3">
                            {list.map(air => {
                              const url = airUrl(air);
                              return (
                                <li key={air.id} className="space-y-1">
                                  <p>{air.title}</p>
                                  {url && air.type === 'audio' ? (
                                    <audio controls preload="none" src={url} className="w-full" aria-label={`Écouter ${air.title}`} />
                                  ) : url ? (
                                    <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                                      Ouvrir l'enregistrement <ExternalLink className="h-3 w-3" aria-hidden="true" />
                                    </a>
                                  ) : null}
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <th scope="row" className={rowHeader}>Mon évaluation</th>
                  {profiles.map(p => {
                    const ev = evaluations.find(e => e.artist_profile_id === p.id);
                    const scores = ev ? EVALUATION_CRITERIA.map(([k]) => ev[k]).filter((v): v is number => typeof v === 'number') : [];
                    const avg = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : null;
                    return (
                      <td key={p.id} className={cell}>
                        {!ev ? <span className="text-muted-foreground">Pas encore évalué(e)</span> : (
                          <div className="space-y-1">
                            {avg && <p className="text-base font-semibold">{avg} / 10</p>}
                            <dl className="grid grid-cols-[1fr_auto] gap-x-3">
                              {EVALUATION_CRITERIA.map(([k, label]) => typeof ev[k] === 'number' && (
                                <React.Fragment key={k}><dt className="text-muted-foreground">{label}</dt><dd>{ev[k]}</dd></React.Fragment>
                              ))}
                            </dl>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <th scope="row" className={rowHeader}>Mes notes</th>
                  {profiles.map(p => {
                    const n = noteFor(p.id);
                    return (
                      <td key={p.id} className={cell}>
                        {n?.tags.length ? (
                          <div className="mb-2 flex flex-wrap gap-1">{n.tags.map(t => <Badge key={t} variant="secondary">{t}</Badge>)}</div>
                        ) : null}
                        {n?.note ? <p className="whitespace-pre-line">{n.note}</p> : !n?.tags.length && <span className="text-muted-foreground">—</span>}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CompareArtists;
