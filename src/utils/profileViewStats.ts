// Statistiques de visites d'un profil, calculées à partir des vraies lignes de `profile_views`.

export type ViewRow = { created_at: string; viewer_id: string | null };

export interface ViewStats {
  /** Vues sur la période chargée (12 semaines). */
  periodViews: number;
  /** Membres connectés distincts ayant consulté le profil sur la période. */
  distinctMembers: number;
  today: number;
  last7: number;
  previous7: number;
  /** Variation en % des 7 derniers jours par rapport aux 7 précédents ; null si pas de base de comparaison. */
  change7: number | null;
  dailyViews: { date: string; count: number }[];
  weeklyViews: { week: string; count: number }[];
}

export const PERIOD_DAYS = 84;

const DAY = 86_400_000;
const pad = (n: number) => String(n).padStart(2, '0');
/** Date locale AAAA-MM-JJ (pas toISOString, qui décale d'un jour selon le fuseau). */
export const localDay = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const mondayOf = (d: Date) => {
  const s = startOfDay(d);
  s.setDate(s.getDate() - ((s.getDay() + 6) % 7));
  return s;
};

export const computeViewStats = (rows: ViewRow[], now = new Date()): ViewStats => {
  const today = startOfDay(now);
  const perDay = new Map<string, number>();
  for (const r of rows) {
    const key = localDay(new Date(r.created_at));
    perDay.set(key, (perDay.get(key) ?? 0) + 1);
  }
  const countOn = (daysAgo: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - daysAgo);
    return perDay.get(localDay(d)) ?? 0;
  };

  const dailyViews = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (29 - i));
    return { date: localDay(d), count: perDay.get(localDay(d)) ?? 0 };
  });

  const thisMonday = mondayOf(now);
  const weeklyViews = Array.from({ length: 12 }, (_, i) => {
    const start = new Date(thisMonday);
    start.setDate(start.getDate() - 7 * (11 - i));
    const end = start.getTime() + 7 * DAY;
    const count = rows.filter(r => {
      const t = new Date(r.created_at).getTime();
      return t >= start.getTime() && t < end;
    }).length;
    return { week: localDay(start), count };
  });

  const sum = (from: number, to: number) => {
    let s = 0;
    for (let i = from; i <= to; i++) s += countOn(i);
    return s;
  };
  const last7 = sum(0, 6);
  const previous7 = sum(7, 13);

  return {
    periodViews: rows.length,
    distinctMembers: new Set(rows.map(r => r.viewer_id).filter(Boolean)).size,
    today: countOn(0),
    last7,
    previous7,
    change7: previous7 > 0 ? Math.round(((last7 - previous7) / previous7) * 100) : null,
    dailyViews,
    weeklyViews,
  };
};
