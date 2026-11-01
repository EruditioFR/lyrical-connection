import { describe, it, expect } from 'vitest';
import { getEventTypeLabel, getStatusLabel, getStatusColor, getCurrencySymbol } from './eventHelpers';

describe('getEventTypeLabel', () => {
  it('traduit les types connus', () => {
    expect(getEventTypeLabel('concours')).toBe('Concours');
    expect(getEventTypeLabel('conference')).toBe('Conférence');
  });

  it('renvoie la valeur brute pour un type inconnu', () => {
    expect(getEventTypeLabel('recital')).toBe('recital');
  });
});

describe('getStatusLabel / getStatusColor', () => {
  it.each([
    ['published', 'Publié', 'bg-success/15 text-success'],
    ['draft', 'Brouillon', 'bg-muted text-foreground'],
    ['cancelled', 'Annulé', 'bg-destructive/15 text-destructive'],
    ['completed', 'Terminé', 'bg-info/15 text-info'],
  ])('%s', (status, label, color) => {
    expect(getStatusLabel(status)).toBe(label);
    expect(getStatusColor(status)).toBe(color);
  });

  it('gère un statut inconnu', () => {
    expect(getStatusLabel('archived')).toBe('archived');
    expect(getStatusColor('archived')).toBe('bg-muted text-foreground');
  });
});

describe('getCurrencySymbol', () => {
  it('renvoie le symbole des devises connues', () => {
    expect(getCurrencySymbol('EUR')).toBe('€');
    expect(getCurrencySymbol('GBP')).toBe('£');
    expect(getCurrencySymbol('CHF')).toBe('Fr');
  });

  it('renvoie le code pour une devise inconnue', () => {
    expect(getCurrencySymbol('XYZ')).toBe('XYZ');
  });
});
