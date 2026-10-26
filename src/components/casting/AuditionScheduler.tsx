import React, { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarPlus, Download, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { applicationStatusLabel } from '@/constants/applicationStatus';
import { generateSlots, toICS, toCSV, downloadFile, type ScheduledAudition } from '@/utils/auditionSchedule';
import type { ApplicationWithDetails } from '@/hooks/useApplications';

interface AuditionSchedulerProps {
  applications: ApplicationWithDetails[];
  castingTitle: string;
  defaultLocation?: string | null;
}

const timeLabel = (d: Date) => d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
const dateTimeLabel = (d: Date) =>
  d.toLocaleString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
const fileSlug = (s: string) => s.replace(/[^\p{L}\p{N}]+/gu, '-').toLowerCase();

/** Génère des créneaux d'audition, les attribue aux candidats choisis et exporte le planning */
const AuditionScheduler = ({ applications, castingTitle, defaultLocation }: AuditionSchedulerProps) => {
  const queryClient = useQueryClient();
  const [date, setDate] = useState('');
  const [start, setStart] = useState('10:00');
  const [end, setEnd] = useState('13:00');
  const [slotMinutes, setSlotMinutes] = useState(15);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [location, setLocation] = useState(defaultLocation || '');

  // Par défaut : les candidatures présélectionnées ou retenues, sans audition programmée
  const candidates = applications.filter(a => a.status !== 'rejected');
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(candidates.filter(a => (a.status === 'waitlisted' || a.status === 'accepted') && !a.audition_scheduled_at).map(a => a.id))
  );

  const slots = useMemo(
    () => generateSlots({ date, start, end, slotMinutes, breakMinutes }),
    [date, start, end, slotMinutes, breakMinutes]
  );
  const toSchedule = candidates.filter(a => selected.has(a.id));
  const assignments = toSchedule.slice(0, slots.length).map((app, i) => ({ app, slot: slots[i] }));
  const overflow = toSchedule.length - assignments.length;

  const scheduled = applications
    .filter(a => a.audition_scheduled_at)
    .sort((a, b) => a.audition_scheduled_at!.localeCompare(b.audition_scheduled_at!));

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['casting-applications'] });

  const saveSchedule = useMutation({
    mutationFn: async () => {
      const results = await Promise.all(assignments.map(({ app, slot }) =>
        supabase
          .from('applications')
          .update({
            audition_scheduled_at: slot.start.toISOString(),
            // Le lieu est communiqué au candidat sans écraser des instructions déjà saisies
            ...(location && !app.audition_notes ? { audition_notes: `Lieu : ${location}` } : {}),
          })
          .eq('id', app.id)
      ));
      const failed = results.filter(r => r.error);
      if (failed.length) throw new Error(`${failed.length} créneau(x) n'ont pas pu être enregistrés`);
      return results.length;
    },
    onSuccess: (count) => {
      invalidate();
      setSelected(new Set());
      toast({ title: 'Planning enregistré', description: `${count} audition(s) programmée(s). Les candidats voient leur horaire dans « Mes candidatures ».` });
    },
    onError: (error: Error) => toast({ title: 'Erreur', description: error.message, variant: 'destructive' }),
  });

  const unschedule = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('applications').update({ audition_scheduled_at: null }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (error: Error) => toast({ title: 'Erreur', description: error.message, variant: 'destructive' }),
  });

  const toExport = (): ScheduledAudition[] => scheduled.map(a => ({
    id: a.id,
    artistName: a.artist_profiles?.stage_name || 'Artiste',
    voiceType: a.artist_profiles?.voice_type,
    email: a.artist_profiles?.contact_email,
    phone: a.artist_profiles?.phone,
    start: new Date(a.audition_scheduled_at!),
    durationMinutes: slotMinutes,
    location: location || defaultLocation,
  }));

  const exportIcs = () => downloadFile(`auditions-${fileSlug(castingTitle)}.ics`, toICS(toExport(), castingTitle), 'text/calendar;charset=utf-8');
  const exportCsv = () => downloadFile(
    `auditions-${fileSlug(castingTitle)}.csv`,
    toCSV(['Date et heure', 'Artiste', 'Tessiture', 'Statut', 'E-mail', 'Téléphone'], scheduled.map(a => [
      new Date(a.audition_scheduled_at!).toLocaleString('fr-FR'),
      a.artist_profiles?.stage_name,
      a.artist_profiles?.voice_type,
      applicationStatusLabel(a.status),
      a.artist_profiles?.contact_email,
      a.artist_profiles?.phone,
    ])),
    'text/csv;charset=utf-8'
  );

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <CalendarPlus className="h-5 w-5" />
            Programmer une session
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor="session-date">Date</Label>
              <Input id="session-date" type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="session-start">Début</Label>
              <Input id="session-start" type="time" value={start} onChange={e => setStart(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="session-end">Fin</Label>
              <Input id="session-end" type="time" value={end} onChange={e => setEnd(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="slot-minutes">Passage (min)</Label>
              <Input id="slot-minutes" type="number" min={5} max={120} step={5} value={slotMinutes} onChange={e => setSlotMinutes(Number(e.target.value))} />
            </div>
            <div>
              <Label htmlFor="break-minutes">Pause (min)</Label>
              <Input id="break-minutes" type="number" min={0} max={60} step={5} value={breakMinutes} onChange={e => setBreakMinutes(Number(e.target.value))} />
            </div>
            <div className="col-span-2 sm:col-span-3">
              <Label htmlFor="session-location">Lieu</Label>
              <Input id="session-location" value={location} onChange={e => setLocation(e.target.value)} placeholder="Salle, adresse" />
            </div>
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Candidats à programmer ({toSchedule.length})</legend>
            {candidates.length === 0 && <p className="text-sm text-muted-foreground">Aucune candidature à programmer.</p>}
            <ul className="max-h-64 space-y-2 overflow-y-auto">
              {candidates.map(app => {
                const id = `pick-${app.id}`;
                return (
                  <li key={app.id} className="flex items-center gap-3">
                    <Checkbox id={id} checked={selected.has(app.id)} onCheckedChange={() => toggle(app.id)} />
                    <Label htmlFor={id} className="font-normal">
                      {app.artist_profiles?.stage_name}
                      <span className="text-muted-foreground">
                        {' · '}{applicationStatusLabel(app.status)}
                        {app.audition_scheduled_at && ` · déjà programmé(e) le ${dateTimeLabel(new Date(app.audition_scheduled_at))}`}
                      </span>
                    </Label>
                  </li>
                );
              })}
            </ul>
          </fieldset>

          <div className="space-y-2">
            <p className="text-sm font-medium">
              Aperçu : {slots.length} créneau(x) disponible(s){date ? '' : ' — choisissez une date'}
            </p>
            {assignments.length > 0 && (
              <ol className="space-y-1 text-sm">
                {assignments.map(({ app, slot }) => (
                  <li key={app.id} className="flex gap-3">
                    <span className="w-28 tabular-nums text-muted-foreground">{timeLabel(slot.start)}–{timeLabel(slot.end)}</span>
                    <span>{app.artist_profiles?.stage_name}</span>
                  </li>
                ))}
              </ol>
            )}
            {overflow > 0 && (
              <p className="text-sm text-destructive">
                {overflow} candidat(s) sans créneau : allongez la session ou raccourcissez les passages.
              </p>
            )}
          </div>

          <Button onClick={() => saveSchedule.mutate()} disabled={assignments.length === 0 || saveSchedule.isPending}>
            Enregistrer le planning ({assignments.length})
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0">
          <CardTitle className="text-xl">Auditions programmées ({scheduled.length})</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={exportIcs} disabled={scheduled.length === 0}>
              <Download className="h-4 w-4 mr-1" />
              Agenda (.ics)
            </Button>
            <Button size="sm" variant="outline" onClick={exportCsv} disabled={scheduled.length === 0}>
              <Download className="h-4 w-4 mr-1" />
              CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {scheduled.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune audition programmée pour ce casting.</p>
          ) : (
            <ul className="divide-y">
              {scheduled.map(app => (
                <li key={app.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <div>
                    <p className="font-medium">{app.artist_profiles?.stage_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {dateTimeLabel(new Date(app.audition_scheduled_at!))}
                      {app.artist_profiles?.voice_type && ` · ${app.artist_profiles.voice_type}`}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label={`Annuler l'audition de ${app.artist_profiles?.stage_name}`}
                    disabled={unschedule.isPending}
                    onClick={() => unschedule.mutate(app.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditionScheduler;
