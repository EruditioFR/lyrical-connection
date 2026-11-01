// Chaque lien interne écrit en dur doit correspondre à une route déclarée (voir AppRouter).
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap(name => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : /\.tsx?$/.test(path) && !/\.test\.tsx?$/.test(path) ? [path] : [];
  });

const files = walk('src');
const sources = files.map(file => ({ file, text: readFileSync(file, 'utf8') }));

const routes = sources.flatMap(({ text }) => [...text.matchAll(/path[=:]\s*"(\/[^"]*)"/g)].map(m => m[1]));
const matchers = routes.map(r => new RegExp('^' + r.replace(/:[^/]+/g, '[^/]+') + '/?$'));

// to="/…", navigate('/…'), navigate(`/…/${id}`), href="/…", window.location.href = '/…', to: '/…'
const LINK = /(?:\bto=\{?|navigate\(|\bhref=\{?|window\.location\.href\s*=\s*|\bto:\s*)(["'`])(\/[^"'`?#]*)\1?/g;

describe('liens internes', () => {
  it('pointent tous vers une route existante', () => {
    const broken = sources.flatMap(({ file, text }) =>
      [...text.matchAll(LINK)]
        .map(m => ({ url: m[2].replace(/\$\{[^}]*\}/g, 'x'), at: `${file}:${text.slice(0, m.index).split('\n').length}` }))
        .filter(({ url }) => !url.startsWith('//') && !url.includes('${') && !matchers.some(re => re.test(url)))
        .map(({ url, at }) => `${url} (${at})`)
    );
    expect(broken).toEqual([]);
  });
});
