import { describe, it, expect, vi } from 'vitest';
import { resources } from './index';
import { extractTranslationKeys } from '@/utils/translationSync';

// The real client needs browser localStorage; these tests never hit the database
vi.mock('@/integrations/supabase/client', () => ({ supabase: {} }));

const keysOf = (lang: keyof typeof resources) =>
  extractTranslationKeys(resources[lang]).map(k => k.key_path).sort();

describe('traductions', () => {
  const frKeys = keysOf('fr');
  const languages = Object.keys(resources).filter(l => l !== 'fr') as (keyof typeof resources)[];

  it('le français contient des clés', () => {
    expect(frKeys.length).toBeGreaterThan(0);
  });

  it.each(languages)('%s contient exactement les mêmes clés que le français', lang => {
    expect(keysOf(lang)).toEqual(frKeys);
  });

  it.each(Object.keys(resources) as (keyof typeof resources)[])('%s ne contient aucun texte vide', lang => {
    const empty = extractTranslationKeys(resources[lang]).filter(k => !k.french_text.trim());
    expect(empty.map(k => k.key_path)).toEqual([]);
  });
});

describe('extractTranslationKeys', () => {
  it('aplatit les clés imbriquées et déduit la section', () => {
    const keys = extractTranslationKeys({ home: { hero: { title: 'Titre' } }, common: { save: 'Enregistrer' } });
    expect(keys).toEqual([
      { key_path: 'home.hero.title', french_text: 'Titre', section: 'home', context: "Titre principal de la page d'accueil" },
      { key_path: 'common.save', french_text: 'Enregistrer', section: 'common', context: 'Bouton pour sauvegarder' },
    ]);
  });
});
