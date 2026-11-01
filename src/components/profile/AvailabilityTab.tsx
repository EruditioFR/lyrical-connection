import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CalendarX, Trash2 } from 'lucide-react';
import {
  useArtistUnavailabilities, formatPeriod, UNAVAILABILITY_LABELS, type UnavailabilityKind,
} from '@/hooks/useArtistAvailability';

interface AvailabilityTabProps {
  artistProfileId: string;
  /** Lecture seule : agenda affiché aux professionnels sur la fiche de l'artiste */
  readOnly?: boolean;
}

/** Agenda de l'artiste : engagements et périodes d'indisponibilité, visibles des professionnels connectés */
const AvailabilityTab = ({ artistProfileId, readOnly = false }: AvailabilityTabProps) => {
  const { periods, unavailable, addPeriod, removePeriod } = useArtistUnavailabilities(artistProfileId);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [kind, setKind] = useState<UnavailabilityKind>('engagement');
  const [title, setTitle] = useState('');

  if (unavailable) {
    if (readOnly) return null;
    return (
      <p className="text-center text-muted-foreground py-8">
        L'agenda sera disponible après la mise à jour de la base de données.
      </p>
    );
  }
  if (readOnly && periods.length === 0) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!start) return;
    addPeriod.mutate(
      { start_date: start, end_date: end || start, kind, title: title.trim() },
      { onSuccess: () => { setStart(''); setEnd(''); setTitle(''); } }
    );
  };

  const list = (
    <ul className="divide-y">
      {periods.map(p => (
        <li key={p.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3">
          <span className="w-56 tabular-nums">{formatPeriod(p.start_date, p.end_date)}</span>
          <Badge variant={p.kind === 'engagement' ? 'default' : 'secondary'}>
            {UNAVAILABILITY_LABELS[p.kind as UnavailabilityKind] ?? p.kind}
          </Badge>
          {p.title && <span className="flex-1 min-w-[10rem]">{p.title}</span>}
          {!readOnly && (
            <Button
              size="sm"
              variant="ghost"
              className="ml-auto"
              aria-label={`Supprimer la période ${formatPeriod(p.start_date, p.end_date)}`}
              onClick={() => removePeriod.mutate(p.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </li>
      ))}
    </ul>
  );

  if (readOnly) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarX className="w-5 h-5" />
            Agenda
          </CardTitle>
          <CardDescription>Engagements et indisponibilités à venir, déclarés par l'artiste.</CardDescription>
        </CardHeader>
        <CardContent>{list}</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mon agenda</CardTitle>
        <CardDescription>
          Indiquez vos engagements et vos périodes d'indisponibilité : les professionnels qui cherchent
          un artiste disponible à une date donnée ne vous proposeront pas ces jours-là.
          Les intitulés sont visibles des membres connectés.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
          <div>
            <Label htmlFor="unav-start">Du</Label>
            <Input id="unav-start" type="date" required value={start} onChange={e => setStart(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="unav-end">Au</Label>
            <Input id="unav-end" type="date" min={start || undefined} value={end} onChange={e => setEnd(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="unav-kind">Type</Label>
            <select
              id="unav-kind"
              value={kind}
              onChange={e => setKind(e.target.value as UnavailabilityKind)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="engagement">Engagement</option>
              <option value="indisponible">Indisponible</option>
            </select>
          </div>
          <div>
            <Label htmlFor="unav-title">Intitulé (facultatif)</Label>
            <Input id="unav-title" value={title} maxLength={200} onChange={e => setTitle(e.target.value)} placeholder="Carmen, Opéra de Lyon" />
          </div>
          <Button type="submit" disabled={!start || addPeriod.isPending}>Ajouter</Button>
        </form>
        {periods.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune période déclarée : vous apparaissez disponible à toutes les dates.</p>
        ) : list}
      </CardContent>
    </Card>
  );
};

export default AvailabilityTab;
