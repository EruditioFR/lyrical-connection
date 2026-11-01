import { describe, it, expect } from 'vitest';
import { computeViewStats, localDay } from './profileViewStats';

const now = new Date(2026, 10, 18, 15, 0); // mercredi 18 novembre 2026, 15 h (heure locale)
const at = (daysAgo: number, viewer: string | null = null, hour = 10) => {
  const d = new Date(2026, 10, 18 - daysAgo, hour);
  return { created_at: d.toISOString(), viewer_id: viewer };
};

describe('computeViewStats', () => {
  it('ne produit que des zéros sans vue (aucun chiffre inventé)', () => {
    const s = computeViewStats([], now);
    expect(s.periodViews).toBe(0);
    expect(s.change7).toBeNull();
    expect(s.dailyViews).toHaveLength(30);
    expect(s.dailyViews.every(d => d.count === 0)).toBe(true);
    expect(s.weeklyViews).toHaveLength(12);
  });

  it("compte aujourd'hui, les 7 derniers jours et la variation", () => {
    const rows = [at(0, 'a'), at(0, 'a'), at(3, 'b'), at(8), at(10, 'c')];
    const s = computeViewStats(rows, now);
    expect(s.today).toBe(2);
    expect(s.last7).toBe(3);
    expect(s.previous7).toBe(2);
    expect(s.change7).toBe(50);
    expect(s.distinctMembers).toBe(3);
    expect(s.dailyViews.at(-1)).toEqual({ date: localDay(now), count: 2 });
  });

  it('range les vues par semaine commençant le lundi', () => {
    // lundi 16 novembre = semaine courante ; dimanche 15 = semaine précédente
    const s = computeViewStats([at(2), at(3)], now);
    expect(s.weeklyViews.at(-1)).toEqual({ week: '2026-11-16', count: 1 });
    expect(s.weeklyViews.at(-2)).toEqual({ week: '2026-11-09', count: 1 });
  });
});
