
// Event type definitions
export interface EventWithRules {
  id: string;
  title: string;
  description?: string;
  program?: string;
  requirements?: string;
  contact_info?: string;
  start_date: string;
  end_date: string;
  location?: string;
  venue?: string;
  address?: string;
  price?: number;
  currency?: string;
  max_participants?: number;
  event_type: string;
  status: string;
  professional_profile_id: string;
  participation_rules?: string;
  code_of_conduct?: string;
  cancellation_policy?: string;
  liability_waiver?: string;
  professional_profile?: any;
  category?: any;
  latitude?: number;
  longitude?: number;
  registration_deadline?: string;
  is_featured?: boolean;
  image_url?: string;
}
