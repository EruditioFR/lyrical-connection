
import type { RepertoireFilters } from '@/components/artists/RepertoireFilters';

export interface SearchCriteria {
  searchTerm?: string;
  voiceType?: string;
  location?: string;
  repertoireFilters?: RepertoireFilters;
}
