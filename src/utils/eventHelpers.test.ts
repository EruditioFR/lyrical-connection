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
    ['published', 'Publié', 'bg-green-100 text-green-800'],
    ['draft', 'Brouillon', 'bg-gray-100 text-gray-800'],
    ['cancelled', 'Annulé', 'bg-red-100 text-red-800'],
    ['completed', 'Terminé', 'bg-blue-100 text-blue-800'],
  ])('%s', (status, label, color) => {
    expect(getStatusLabel(status)).toBe(label);
    expect(getStatusColor(status)).toBe(color);
  });

  it('gère un statut inconnu', () => {
    expect(getStatusLabel('archived')).toBe('archived');
    expect(getStatusColor('archived')).toBe('bg-gray-100 text-gray-800');
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
