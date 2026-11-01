// Planning d'auditions : génération de créneaux et exports (iCalendar, CSV)

export interface SlotSettings {
  /** Date de la session, AAAA-MM-JJ (heure locale) */
  date: string;
  /** Heure de début et de fin, HH:MM */
  start: string;
  end: string;
  /** Durée d'un passage et pause entre deux passages, en minutes */
  slotMinutes: number;
  breakMinutes: number;
}

export interface Slot {
  start: Date;
  end: Date;
}

const atTime = (date: string, time: string) => {
  const [y, m, d] = date.split('-').map(Number);
  const [hh, mm] = time.split(':').map(Number);
  return new Date(y, m - 1, d, hh, mm, 0, 0);
};

/** Découpe la session en créneaux consécutifs ; le dernier doit finir avant l'heure de fin */
export const generateSlots = ({ date, start, end, slotMinutes, breakMinutes }: SlotSettings): Slot[] => {
  if (!date || !start || !end || slotMinutes <= 0 || breakMinutes < 0) return [];
  const sessionEnd = atTime(date, end).getTime();
  const slots: Slot[] = [];
  let cursor = atTime(date, start).getTime();
  while (cursor + slotMinutes * 60_000 <= sessionEnd) {
    slots.push({ start: new Date(cursor), end: new Date(cursor + slotMinutes * 60_000) });
    cursor += (slotMinutes + breakMinutes) * 60_000;
  }
  return slots;
};

export interface ScheduledAudition {
  id: string;
  artistName: string;
  voiceType?: string | null;
  email?: string | null;
  phone?: string | null;
  start: Date;
  durationMinutes: number;
  location?: string | null;
}

const icsDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
// RFC 5545 : échapper \ ; , et retours à la ligne
const icsText = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');

/** Fichier .ics importable dans Google Agenda, Outlook ou Calendrier */
export const toICS = (auditions: ScheduledAudition[], title: string, now = new Date()): string => {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Lyrisphere//Planning auditions//FR',
    'CALSCALE:GREGORIAN',
  ];
  for (const a of auditions) {
    const end = new Date(a.start.getTime() + a.durationMinutes * 60_000);
    lines.push(
      'BEGIN:VEVENT',
      `UID:audition-${a.id}@lyrisphere`,
      `DTSTAMP:${icsDate(now)}`,
      `DTSTART:${icsDate(a.start)}`,
      `DTEND:${icsDate(end)}`,
      `SUMMARY:${icsText(`Audition ${a.artistName} — ${title}`)}`,
      ...(a.location ? [`LOCATION:${icsText(a.location)}`] : []),
      `DESCRIPTION:${icsText([a.voiceType, a.email, a.phone].filter(Boolean).join(' · '))}`,
      'END:VEVENT',
    );
  }
  lines.push('END:VCALENDAR');
  return lines.join('\r\n') + '\r\n';
};

const csvCell = (v: unknown) => {
  const s = v === null || v === undefined ? '' : String(v);
  // Neutralise les formules Excel et protège séparateurs et guillemets
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
  return /[";\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};

/** CSV séparé par des points-virgules (ouverture directe dans Excel en français) */
export const toCSV = (header: string[], rows: unknown[][]): string =>
  '\uFEFF' + [header, ...rows].map(r => r.map(csvCell).join(';')).join('\r\n') + '\r\n';

export const downloadFile = (filename: string, content: string, mime: string) => {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
