import { describe, it, expect } from 'vitest';
import { sortIntoFolders, isStarredBy } from './mailFolders';

const ME = 'me', OTHER = 'other';
const base = { is_deleted_by_sender: false, is_deleted_by_recipient: false, is_starred_by_sender: false, is_starred_by_recipient: false, is_purged_by_sender: false, is_purged_by_recipient: false };

describe('sortIntoFolders', () => {
  it('range reçus et envoyés selon le rôle', () => {
    const f = sortIntoFolders([
      { ...base, id: 'r', sender_id: OTHER, recipient_id: ME },
      { ...base, id: 's', sender_id: ME, recipient_id: OTHER },
    ], ME);
    expect(f.inbox.map(m => m.id)).toEqual(['r']);
    expect(f.sent.map(m => m.id)).toEqual(['s']);
  });

  it("la corbeille de l'un n'affecte pas l'autre", () => {
    const msg = { ...base, id: 'x', sender_id: OTHER, recipient_id: ME, is_deleted_by_recipient: true };
    expect(sortIntoFolders([msg], ME).trash).toHaveLength(1);
    expect(sortIntoFolders([msg], OTHER).sent).toHaveLength(1);
  });

  it('un message supprimé définitivement disparaît seulement chez celui qui l\'a supprimé', () => {
    const msg = { ...base, id: 'x', sender_id: OTHER, recipient_id: ME, is_deleted_by_recipient: true, is_purged_by_recipient: true };
    const mine = sortIntoFolders([msg], ME);
    expect(mine.trash).toHaveLength(0);
    expect(mine.inbox).toHaveLength(0);
    expect(sortIntoFolders([msg], OTHER).sent).toHaveLength(1);
  });

  it('le favori est propre à chacun', () => {
    const msg = { ...base, id: 'x', sender_id: OTHER, recipient_id: ME, is_starred_by_recipient: true };
    expect(sortIntoFolders([msg], ME).starred).toHaveLength(1);
    expect(sortIntoFolders([msg], OTHER).starred).toHaveLength(0);
  });
});

describe('isStarredBy', () => {
  it("avant migration, utilise l'ancien favori commun", () => {
    expect(isStarredBy({ id: 'x', sender_id: OTHER, recipient_id: ME, is_deleted_by_sender: false, is_deleted_by_recipient: false, is_starred: true }, ME)).toBe(true);
  });
});
