// Motif « liste éditoriale » du système Programme de salle (voir docs/design-system.md) :
// colonne de titre à gauche (étiquette en rouge rideau + titre serif), liste à filets à droite.
import React from 'react';
import { cn } from '@/lib/utils';

export type EditorialEntry = { title: string; description: React.ReactNode };

export const Eyebrow = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <p className={cn('text-xs uppercase tracking-[0.14em] text-gold-600', className)}>{children}</p>
);

type SectionProps = {
  label: string;
  title: string;
  intro?: React.ReactNode;
  aside?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export const EditorialSection = ({ label, title, intro, aside, children, className }: SectionProps) => (
  <section className={cn('py-16 border-t border-border', className)}>
    <div className="container mx-auto px-4 md:px-6 grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
      <div>
        <Eyebrow className="mb-3">{label}</Eyebrow>
        <h2 className="text-3xl font-serif text-foreground">{title}</h2>
        {intro && <div className="mt-3 text-muted-foreground">{intro}</div>}
        {aside && <div className="mt-6">{aside}</div>}
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  </section>
);

export const EditorialList = ({ entries, numbered = false }: { entries: EditorialEntry[]; numbered?: boolean }) => {
  const Tag = numbered ? 'ol' : 'ul';
  return (
    <Tag className="divide-y divide-border border-y border-border">
      {entries.map((entry, i) => (
        <li key={entry.title} className={cn('py-5', numbered && 'grid grid-cols-[2.5rem_1fr] gap-x-4')}>
          {numbered && (
            <span className="font-serif text-lg text-muted-foreground tabular-nums" aria-hidden="true">
              {String(i + 1).padStart(2, '0')}
            </span>
          )}
          <div>
            <h3 className="text-xl">{entry.title}</h3>
            <p className="mt-1 text-muted-foreground">{entry.description}</p>
          </div>
        </li>
      ))}
    </Tag>
  );
};
