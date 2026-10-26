import type { Database } from '@/integrations/supabase/types';

export type ApplicationStatus = Database['public']['Enums']['application_status'];

// Ordre du pipeline de recrutement. « waitlisted » est la présélection : la base n'a pas
// de valeur « shortlisted ».
export const APPLICATION_PIPELINE: { status: ApplicationStatus; label: string; plural: string }[] = [
  { status: 'pending', label: 'Reçue', plural: 'Reçues' },
  { status: 'waitlisted', label: 'Présélectionnée', plural: 'Présélectionnées' },
  { status: 'accepted', label: 'Retenue', plural: 'Retenues' },
  { status: 'rejected', label: 'Refusée', plural: 'Refusées' },
];

export const applicationStatusLabel = (status: string) =>
  APPLICATION_PIPELINE.find(s => s.status === status)?.label ?? status;
