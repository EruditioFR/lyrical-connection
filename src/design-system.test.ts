// Garde-fous du système visuel « Programme de salle » (voir docs/design-system.md).
// Ces tests échouent si un motif écarté réapparaît dans le code.
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap(name => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : path.endsWith('.tsx') ? [path] : [];
  });

const files = walk('src').filter(f => !f.includes('/components/ui/'));
const offenders = (pattern: RegExp, allow: (line: string) => boolean = () => false) =>
  files.flatMap(file =>
    readFileSync(file, 'utf8').split('\n')
      .map((line, i) => ({ line, at: `${file}:${i + 1}` }))
      .filter(({ line }) => pattern.test(line) && !allow(line))
      .map(({ at }) => at)
  );

describe('système visuel', () => {
  it("pas de dégradé décoratif (seuls les voiles vers « transparent » sur les photos)", () => {
    expect(offenders(/bg-gradient-to-/, line => line.includes('transparent'))).toEqual([]);
  });

  it('pas de texte en dégradé', () => {
    expect(offenders(/bg-clip-text/)).toEqual([]);
  });

  it("pas d'emoji décoratif dans l'interface", () => {
    expect(offenders(/[✨🌟🎉🚀💫]/u)).toEqual([]);
  });

  it("pas de couleur Tailwind codée en dur : jetons du thème (success, warning, info, destructive, muted…)", () => {
    expect(offenders(
      /(?<![\w-])(?:[a-z-]+:)*(?:bg|text|border|ring|from|to|via|fill|stroke|divide|outline|placeholder)-(?:red|green|blue|yellow|amber|orange|purple|pink|indigo|violet|emerald|teal|cyan|sky|lime|rose|fuchsia|gray|slate|zinc|neutral|stone)-\d{2,3}(?![\w-])/
    )).toEqual([]);
  });

  it('pas de fond blanc opaque : surface du thème (bg-card, bg-background)', () => {
    expect(offenders(/(?<![\w:-])bg-white(?![\w/-])/)).toEqual([]);
  });

  it('les boutons utilisent les variantes du thème, pas une couleur maison', () => {
    expect(offenders(/<Button[^>]*\bbg-lyrical-\d{3}\b/)).toEqual([]);
  });
});
