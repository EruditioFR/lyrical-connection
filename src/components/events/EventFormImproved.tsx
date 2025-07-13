
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCreateEvent, useEventCategories, CreateEventData, ProfessionalEvent } from '@/hooks/useEvents';
import { useProfessionalProfile } from '@/hooks/useProfessionalProfile';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { EventWithRules } from '@/types/event';

// Import step components
import { EventFormProgress } from './EventFormProgress';
import { EventEssentialStep } from './steps/EventEssentialStep';
import { EventDetailsStep } from './steps/EventDetailsStep';
import { EventPricingStep } from './steps/EventPricingStep';
import { EventMediaStep } from './steps/EventMediaStep';
import { EventRulesStep } from './steps/EventRulesStep';
import { EventReviewStep } from './steps/EventReviewStep';

interface EventFormImprovedProps {
  event?: EventWithRules | null;
  onClose: () => void;
}

export const EventFormImproved: React.FC<EventFormImprovedProps> = ({ event, onClose }) => {
  const [currentStep, setCurrentStep] = useState('essential');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'masterclass' as 'masterclass' | 'stage' | 'concours' | 'atelier' | 'conference',
    status: 'draft' as 'draft' | 'published',
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
  });

  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [registrationDeadline, setRegistrationDeadline] = useState<Date>();
  const [dateErrors, setDateErrors] = useState<{
    endDate?: string;
    registrationDeadline?: string;
  }>({});

  const { data: categories = [] } = useEventCategories();
  const { profile: professionalProfile } = useProfessionalProfile();
  const createEventMutation = useCreateEvent();
  const { toast } = useToast();

  // Form steps configuration
  const steps = [
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
      completed: true, // Always considered complete since price can be 0
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
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  // Load existing event data
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
      
      setStartDate(new Date(event.start_date));
      setEndDate(new Date(event.end_date));
      if (event.registration_deadline) {
        setRegistrationDeadline(new Date(event.registration_deadline));
      }
    }
  }, [event]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateDates = (start: Date | undefined, end: Date | undefined, registration: Date | undefined) => {
    const errors: { endDate?: string; registrationDeadline?: string } = {};
    
    if (start && end && end < start) {
      errors.endDate = 'La date de fin doit être après la date de début';
    }
    
    if (start && registration && registration >= start) {
      errors.registrationDeadline = 'La date limite d\'inscription doit être avant la date de début';
    }
    
    setDateErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleDateChange = (field: string, date: Date | undefined) => {
    if (date) {
      const isoString = date.toISOString();
      setFormData(prev => ({ ...prev, [field]: isoString }));
      
      let newStartDate = startDate;
      let newEndDate = endDate;
      let newRegistrationDeadline = registrationDeadline;
      
      if (field === 'start_date') {
        setStartDate(date);
        newStartDate = date;
      }
      if (field === 'end_date') {
        setEndDate(date);
        newEndDate = date;
      }
      if (field === 'registration_deadline') {
        setRegistrationDeadline(date);
        newRegistrationDeadline = date;
      }
      
      validateDates(newStartDate, newEndDate, newRegistrationDeadline);
    }
  };

  const handleLocationSelect = (latitude: number, longitude: number) => {
    setFormData(prev => ({
      ...prev,
      latitude: latitude.toString(),
      longitude: longitude.toString()
    }));
  };

  const handleNextStep = () => {
    if (!isLastStep) {
      setCurrentStep(steps[currentStepIndex + 1].id);
    }
  };

  const handlePrevStep = () => {
    if (!isFirstStep) {
      setCurrentStep(steps[currentStepIndex - 1].id);
    }
  };

  const canProceedToNextStep = () => {
    const currentStepData = steps[currentStepIndex];
    return currentStepData.completed && !currentStepData.hasErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!professionalProfile) {
      console.error('No professional profile found');
      return;
    }

    if (!formData.title || !formData.event_type || !formData.start_date || !formData.end_date) {
      console.error('Missing required fields');
      return;
    }

    if (!validateDates(startDate, endDate, registrationDeadline)) {
      console.error('Date validation failed');
      return;
    }

    try {
      const eventData: any = {
        professional_profile_id: professionalProfile.id,
        title: formData.title,
        description: formData.description || undefined,
        event_type: formData.event_type,
        status: formData.status,
        category_id: formData.category_id || undefined,
        start_date: formData.start_date,
        end_date: formData.end_date,
        registration_deadline: formData.registration_deadline || undefined,
        location: undefined,
        venue: undefined,
        address: formData.address || undefined,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
        max_participants: formData.max_participants ? parseInt(formData.max_participants) : undefined,
        price: formData.price ? parseFloat(formData.price) : undefined,
        currency: formData.currency,
        requirements: formData.requirements || undefined,
        program: formData.program || undefined,
        contact_info: formData.contact_info || undefined,
        image_url: formData.image_url || undefined,
        participation_rules: formData.participation_rules || undefined,
        code_of_conduct: formData.code_of_conduct || undefined,
        cancellation_policy: formData.cancellation_policy || undefined,
        liability_waiver: formData.liability_waiver || undefined,
      };

      if (event) {
        eventData.id = event.id;
      }

      await createEventMutation.mutateAsync(eventData);
      toast({
        title: 'Succès',
        description: `Événement ${formData.status === 'published' ? 'publié' : 'sauvegardé'} avec succès`,
      });
      onClose();
    } catch (error) {
      console.error('Error in handleSubmit:', error);
    }
  };

  const eventTypes = [
    { value: 'masterclass', label: 'Masterclass' },
    { value: 'stage', label: 'Stage' },
    { value: 'concours', label: 'Concours' },
    { value: 'atelier', label: 'Atelier' },
    { value: 'conference', label: 'Conférence' },
  ];

  const currencies = [
    { value: 'EUR', label: 'EUR (€)', symbol: '€' },
    { value: 'USD', label: 'USD ($)', symbol: '$' },
    { value: 'GBP', label: 'GBP (£)', symbol: '£' },
    { value: 'AED', label: 'AED (د.إ)', symbol: 'د.إ' },
    { value: 'AUD', label: 'AUD (A$)', symbol: 'A$' },
    { value: 'BRL', label: 'BRL (R$)', symbol: 'R$' },
    { value: 'CAD', label: 'CAD (C$)', symbol: 'C$' },
    { value: 'CHF', label: 'CHF (Fr)', symbol: 'Fr' },
    { value: 'CNY', label: 'CNY (¥)', symbol: '¥' },
    { value: 'CZK', label: 'CZK (Kč)', symbol: 'Kč' },
    { value: 'DKK', label: 'DKK (kr)', symbol: 'kr' },
    { value: 'EGP', label: 'EGP (E£)', symbol: 'E£' },
    { value: 'HKD', label: 'HKD (HK$)', symbol: 'HK$' },
    { value: 'HUF', label: 'HUF (Ft)', symbol: 'Ft' },
    { value: 'IDR', label: 'IDR (Rp)', symbol: 'Rp' },
    { value: 'ILS', label: 'ILS (₪)', symbol: '₪' },
    { value: 'INR', label: 'INR (₹)', symbol: '₹' },
    { value: 'JPY', label: 'JPY (¥)', symbol: '¥' },
    { value: 'KRW', label: 'KRW (₩)', symbol: '₩' },
    { value: 'MAD', label: 'MAD (د.م.)', symbol: 'د.م.' },
    { value: 'MXN', label: 'MXN (Mex$)', symbol: 'Mex$' },
    { value: 'NOK', label: 'NOK (kr)', symbol: 'kr' },
    { value: 'NZD', label: 'NZD (NZ$)', symbol: 'NZ$' },
    { value: 'PLN', label: 'PLN (zł)', symbol: 'zł' },
    { value: 'RON', label: 'RON (lei)', symbol: 'lei' },
    { value: 'RUB', label: 'RUB (₽)', symbol: '₽' },
    { value: 'SAR', label: 'SAR (﷼)', symbol: '﷼' },
    { value: 'SEK', label: 'SEK (kr)', symbol: 'kr' },
    { value: 'SGD', label: 'SGD (S$)', symbol: 'S$' },
    { value: 'THB', label: 'THB (฿)', symbol: '฿' },
    { value: 'TRY', label: 'TRY (₺)', symbol: '₺' },
    { value: 'ZAR', label: 'ZAR (R)', symbol: 'R' },
  ];

  const isFormValid = formData.title && 
                     formData.event_type && 
                     formData.start_date && 
                     formData.end_date && 
                     Object.keys(dateErrors).length === 0;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {event ? 'Modifier l\'événement' : 'Créer un nouvel événement'}
          </DialogTitle>
        </DialogHeader>

        <EventFormProgress steps={steps} currentStep={currentStep} />

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs value={currentStep} onValueChange={setCurrentStep}>
            <TabsContent value="essential">
              <EventEssentialStep
                formData={formData}
                handleInputChange={handleInputChange}
                handleDateChange={handleDateChange}
                handleLocationSelect={handleLocationSelect}
                startDate={startDate}
                endDate={endDate}
                registrationDeadline={registrationDeadline}
                dateErrors={dateErrors}
                eventTypes={eventTypes}
              />
            </TabsContent>

            <TabsContent value="details">
              <EventDetailsStep
                formData={formData}
                handleInputChange={handleInputChange}
                categories={categories}
              />
            </TabsContent>

            <TabsContent value="pricing">
              <EventPricingStep
                formData={formData}
                handleInputChange={handleInputChange}
                currencies={currencies}
              />
            </TabsContent>

            <TabsContent value="media">
              <EventMediaStep
                formData={formData}
                handleInputChange={handleInputChange}
                professionalProfileId={professionalProfile?.id}
              />
            </TabsContent>

            <TabsContent value="rules">
              <EventRulesStep
                formData={formData}
                handleInputChange={handleInputChange}
              />
            </TabsContent>

            <TabsContent value="review">
              <EventReviewStep
                formData={formData}
                handleInputChange={handleInputChange}
                startDate={startDate}
                endDate={endDate}
                registrationDeadline={registrationDeadline}
                eventTypes={eventTypes}
                categories={categories}
                currencies={currencies}
              />
            </TabsContent>
          </Tabs>

          <div className="flex justify-between pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevStep}
              disabled={isFirstStep}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Précédent
            </Button>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Annuler
              </Button>

              {isLastStep ? (
                <Button
                  type="submit"
                  disabled={createEventMutation.isPending || !isFormValid}
                >
                  {createEventMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {formData.status === 'published' ? 'Publication...' : 'Sauvegarde...'}
                    </>
                  ) : (
                    formData.status === 'published' ? 'Publier l\'événement' : 'Sauvegarder le brouillon'
                  )}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleNextStep}
                  disabled={!canProceedToNextStep()}
                >
                  Suivant
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
