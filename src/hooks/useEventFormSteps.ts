
import { useMemo } from 'react';
import { EventFormData } from './useEventFormData';

export const useEventFormSteps = (formData: EventFormData, dateErrors: Record<string, string>) => {
  const steps = useMemo(() => [
    { 
      id: 'essential', 
      title: 'Essentiel', 
      completed: !!(formData.title && formData.event_type && formData.start_date && formData.end_date && formData.address),
      hasErrors: Object.keys(dateErrors).length > 0
    },
    { 
      id: 'details', 
      title: 'Détails', 
      completed: !!(formData.program || formData.requirements || formData.contact_info),
      hasErrors: false
    },
    { 
      id: 'pricing', 
      title: 'Tarification', 
      completed: true,
      hasErrors: false
    },
    { 
      id: 'media', 
      title: 'Médias', 
      completed: !!formData.image_url,
      hasErrors: false
    },
    { 
      id: 'rules', 
      title: 'Règlement', 
      completed: !!(formData.participation_rules || formData.code_of_conduct),
      hasErrors: false
    },
    { 
      id: 'review', 
      title: 'Révision', 
      completed: false,
      hasErrors: false
    }
  ], [formData, dateErrors]);

  return { steps };
};
