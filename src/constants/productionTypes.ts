export const PRODUCTION_TYPE_LABELS: Record<string, string> = {
  opera: 'Opéra',
  operetta: 'Opérette',
  concert: 'Concert',
  competition: 'Concours',
  masterclass: 'Masterclass',
  other: 'Autre',
};

export const getProductionTypeLabel = (value: string | null | undefined) =>
  (value && PRODUCTION_TYPE_LABELS[value]) || value || '';
