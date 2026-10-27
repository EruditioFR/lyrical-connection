import { describe, it, expect } from 'vitest';
import { synthesize } from './jurySynthesis';

describe('synthesize', () => {
  it('fait la moyenne par juré, puis la moyenne des jurés', () => {
    const [r] = synthesize(['app1'], [
      { application_id: 'app1', scored_by: 'A', score: 16 },
      { application_id: 'app1', scored_by: 'A', score: 12 },
      { application_id: 'app1', scored_by: 'B', score: 10 },
    ]);
    expect(r.jurorAverages.get('A')).toBe(14);
    expect(r.jurorAverages.get('B')).toBe(10);
    // Chaque juré pèse autant : (14 + 10) / 2, et non (16 + 12 + 10) / 3
    expect(r.overall).toBe(12);
  });

  it('renvoie null pour un candidat sans note', () => {
    const [r] = synthesize(['app2'], [{ application_id: 'app1', scored_by: 'A', score: 15 }]);
    expect(r.overall).toBeNull();
    expect(r.jurorAverages.size).toBe(0);
  });
});
