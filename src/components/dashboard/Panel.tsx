// Panneau de tableau de bord « Programme de salle » : titre serif sur un filet, lien d'action,
// contenu en liste à filets. Remplace les cartes à ombre des espaces membres.
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type PanelProps = {
  title: string;
  action?: { to: string; label: string };
  children: React.ReactNode;
  className?: string;
};

export const Panel = ({ title, action, children, className }: PanelProps) => (
  <section className={cn('border-t border-foreground pt-4', className)}>
    <div className="flex items-baseline justify-between gap-4 mb-2">
      <h2 className="text-xl font-serif">{title}</h2>
      {action && (
        <Link
          to={action.to}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
        >
          {action.label}
          <ArrowRight className="h-3.5 w-3.5 ml-1" aria-hidden="true" />
        </Link>
      )}
    </div>
    {children}
  </section>
);

export const PanelList = ({ children }: { children: React.ReactNode }) => (
  <ul className="divide-y divide-border">{children}</ul>
);

/** Ligne cliquable : un vrai lien, accessible au clavier. */
export const PanelLink = ({ to, children, className }: { to: string; children: React.ReactNode; className?: string }) => (
  <li>
    <Link
      to={to}
      className={cn(
        'flex items-start gap-3 py-3 -mx-2 px-2 hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
    >
      {children}
    </Link>
  </li>
);

export const PanelEmpty = ({ children }: { children: React.ReactNode }) => (
  <p className="py-6 text-sm text-muted-foreground">{children}</p>
);

export const PanelSkeleton = ({ rows = 3 }: { rows?: number }) => (
  <ul className="divide-y divide-border" aria-busy="true" aria-label="Chargement">
    {Array.from({ length: rows }).map((_, i) => (
      <li key={i} className="flex items-center gap-3 py-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </li>
    ))}
  </ul>
);

/** Pastille « non lu » : point rouge rideau + texte pour les lecteurs d'écran. */
export const UnreadDot = () => (
  <>
    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-gold-600" aria-hidden="true" />
    <span className="sr-only">Non lu</span>
  </>
);

/** Rangée de chiffres clés : valeurs en serif, séparées par des filets (pas de tuiles). */
export const StatRow = ({ children }: { children: React.ReactNode }) => (
  <dl className="grid grid-cols-2 lg:grid-cols-4 border-y border-border lg:divide-x lg:divide-border">{children}</dl>
);

export const Stat = ({ label, value, note }: { label: string; value: React.ReactNode; note?: React.ReactNode }) => (
  <div className="py-4 pr-4 lg:px-6 lg:first:pl-0">
    <dt className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{label}</dt>
    <dd className="mt-1 font-serif text-3xl tabular-nums">{value}</dd>
    {note && <dd className="text-sm text-muted-foreground">{note}</dd>}
  </div>
);
