import { describe, it, expect, vi } from 'vitest';

// Le client réel a besoin du localStorage du navigateur ; ces tests n'appellent pas la base
vi.mock('@/integrations/supabase/client', () => ({ supabase: {} }));
const { overlaps, formatPeriod } = await import('./useArtistAvailability');

describe('overlaps', () => {
  it('détecte un chevauchement, bornes incluses', () => {
    expect(overlaps('2027-03-01', '2027-03-20', '2027-03-20', '2027-04-01')).toBe(true);
    expect(overlaps('2027-03-01', '2027-03-20', '2027-03-05', '2027-03-06')).toBe(true);
  });
  it('ne signale pas des périodes disjointes', () => {
    expect(overlaps('2027-03-01', '2027-03-20', '2027-03-21', '2027-04-01')).toBe(false);
  });
});

describe('formatPeriod', () => {
  it('affiche une seule date pour un jour', () => {
    expect(formatPeriod('2027-03-05', '2027-03-05')).not.toContain('→');
  });
  it('affiche début → fin', () => {
    expect(formatPeriod('2027-03-01', '2027-03-20')).toMatch(/1 mars 2027 → 20 mars 2027/);
  });
});
