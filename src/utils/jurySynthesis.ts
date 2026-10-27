// Synthèse des notes d'un jury

/** Moyenne par juré puis moyenne générale (chaque juré pèse autant, quel que soit son nombre de critères notés) */
export const synthesize = (
  applicationIds: string[],
  scores: { application_id: string; scored_by: string; score: number }[],
) => {
  return applicationIds.map(id => {
    const byJuror = new Map<string, number[]>();
    scores.filter(s => s.application_id === id).forEach(s => {
      byJuror.set(s.scored_by, [...(byJuror.get(s.scored_by) || []), s.score]);
    });
    const jurorAverages = new Map([...byJuror].map(([juror, list]) => [juror, list.reduce((a, b) => a + b, 0) / list.length]));
    const values = [...jurorAverages.values()];
    return { applicationId: id, jurorAverages, overall: values.length ? values.reduce((a, b) => a + b, 0) / values.length : null };
  });
};
