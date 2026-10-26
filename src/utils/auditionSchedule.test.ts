import { describe, it, expect } from 'vitest';
import { generateSlots, toICS, toCSV } from './auditionSchedule';

describe('generateSlots', () => {
  it('découpe la session en passages + pauses', () => {
    const slots = generateSlots({ date: '2026-11-03', start: '10:00', end: '11:00', slotMinutes: 15, breakMinutes: 5 });
    expect(slots.map(s => s.start.toTimeString().slice(0, 5))).toEqual(['10:00', '10:20', '10:40']);
    expect(slots[2].end.toTimeString().slice(0, 5)).toBe('10:55');
  });

  it("n'ajoute pas un créneau qui dépasserait l'heure de fin", () => {
    const slots = generateSlots({ date: '2026-11-03', start: '10:00', end: '10:50', slotMinutes: 20, breakMinutes: 10 });
    expect(slots).toHaveLength(2);
  });

  it('renvoie une liste vide pour des réglages invalides', () => {
    expect(generateSlots({ date: '2026-11-03', start: '10:00', end: '09:00', slotMinutes: 15, breakMinutes: 0 })).toEqual([]);
    expect(generateSlots({ date: '', start: '10:00', end: '11:00', slotMinutes: 15, breakMinutes: 0 })).toEqual([]);
    expect(generateSlots({ date: '2026-11-03', start: '10:00', end: '11:00', slotMinutes: 0, breakMinutes: 0 })).toEqual([]);
  });
});

describe('toICS', () => {
  it('produit un VEVENT par audition, en UTC, avec texte échappé', () => {
    const ics = toICS(
      [{ id: 'a1', artistName: 'Marie Lombard', voiceType: 'Soprano', start: new Date(Date.UTC(2026, 10, 3, 9, 0)), durationMinutes: 15, location: 'Salle 2, Opéra' }],
      'Carmen; 2027',
      new Date(Date.UTC(2026, 9, 1)),
    );
    expect(ics).toContain('BEGIN:VCALENDAR\r\n');
    expect(ics).toContain('DTSTART:20261103T090000Z');
    expect(ics).toContain('DTEND:20261103T091500Z');
    expect(ics).toContain('SUMMARY:Audition Marie Lombard — Carmen\\; 2027');
    expect(ics).toContain('LOCATION:Salle 2\\, Opéra');
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(1);
  });
});

describe('toCSV', () => {
  it('sépare par des points-virgules, protège guillemets et formules', () => {
    const csv = toCSV(['Nom', 'Note'], [['Baldo', 'dit "bravo"; superbe'], ['=1+1', null]]);
    expect(csv.startsWith('﻿')).toBe(true);
    expect(csv).toContain('Nom;Note\r\n');
    expect(csv).toContain('Baldo;"dit ""bravo""; superbe"\r\n');
    expect(csv).toContain("'=1+1;\r\n");
  });
});
