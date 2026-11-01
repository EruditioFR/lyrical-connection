
export const eventTypes = [
  { value: 'masterclass', label: 'Masterclass' },
  { value: 'stage', label: 'Stage' },
  { value: 'concours', label: 'Concours' },
  { value: 'atelier', label: 'Atelier' },
  { value: 'conference', label: 'Conférence' },
] as const;

export type EventType = typeof eventTypes[number]['value'];

export const getEventTypeLabel = (value: string | null | undefined) =>
  eventTypes.find(t => t.value === value)?.label ?? value ?? '';
