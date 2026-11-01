import type { Database } from '@/integrations/supabase/types';

export type ProfessionalRole = Database['public']['Enums']['professional_role'];

export const PROFESSIONAL_ROLE_LABELS: Record<ProfessionalRole, string> = {
  casting_director: 'Directeur de casting',
  vocal_coach: 'Coach vocal',
  conductor: "Chef d'orchestre",
  opera_house_manager: "Directeur d'opéra",
  voice_teacher: 'Professeur de chant',
  artistic_agent: 'Agent artistique',
  producer: 'Producteur',
  competition_director: 'Directeur de concours',
};

export const getProfessionalRoleLabel = (role: string | null | undefined) =>
  (role && PROFESSIONAL_ROLE_LABELS[role as ProfessionalRole]) || role || '';
