
import { useState, useEffect } from 'react';
import { EventWithRules } from '@/types/event';

export interface EventFormData {
  title: string;
  description: string;
  event_type: 'masterclass' | 'stage' | 'concours' | 'atelier' | 'conference';
  status: 'draft' | 'published';
  category_id: string;
  start_date: string;
  end_date: string;
  registration_deadline: string;
  address: string;
  latitude: string;
  longitude: string;
  max_participants: string;
  price: string;
  currency: string;
  requirements: string;
  program: string;
  contact_info: string;
  image_url: string;
  participation_rules: string;
  code_of_conduct: string;
  cancellation_policy: string;
  liability_waiver: string;
}

const initialFormData: EventFormData = {
  title: '',
  description: '',
  event_type: 'masterclass',
  status: 'draft',
  category_id: '',
  start_date: '',
  end_date: '',
  registration_deadline: '',
  address: '',
  latitude: '',
  longitude: '',
  max_participants: '',
  price: '',
  currency: 'EUR',
  requirements: '',
  program: '',
  contact_info: '',
  image_url: '',
  participation_rules: '',
  code_of_conduct: '',
  cancellation_policy: '',
  liability_waiver: '',
};

export const useEventFormData = (event?: EventWithRules | null) => {
  const [formData, setFormData] = useState<EventFormData>(initialFormData);

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description || '',
        event_type: event.event_type as 'masterclass' | 'stage' | 'concours' | 'atelier' | 'conference',
        status: event.status === 'draft' || event.status === 'published' ? event.status : 'draft',
        category_id: event.category?.id || '',
        start_date: event.start_date,
        end_date: event.end_date,
        registration_deadline: event.registration_deadline || '',
        address: (event as any).address || '',
        latitude: (event as any).latitude?.toString() || '',
        longitude: (event as any).longitude?.toString() || '',
        max_participants: event.max_participants?.toString() || '',
        price: event.price?.toString() || '',
        currency: event.currency || 'EUR',
        requirements: event.requirements || '',
        program: event.program || '',
        contact_info: event.contact_info || '',
        image_url: event.image_url || '',
        participation_rules: (event as any).participation_rules || '',
        code_of_conduct: (event as any).code_of_conduct || '',
        cancellation_policy: (event as any).cancellation_policy || '',
        liability_waiver: (event as any).liability_waiver || '',
      });
    }
  }, [event]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLocationSelect = (latitude: number, longitude: number) => {
    setFormData(prev => ({
      ...prev,
      latitude: latitude.toString(),
      longitude: longitude.toString()
    }));
  };

  return {
    formData,
    handleInputChange,
    handleLocationSelect,
    setFormData
  };
};
