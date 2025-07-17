
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { useCreateEvent, useEventCategories } from '@/hooks/useEvents';
import { useProfessionalProfile } from '@/hooks/useProfessionalProfile';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { EventWithRules } from '@/types/event';
import { eventTypes } from '@/constants/eventTypes';
import { currencies } from '@/constants/currencies';
import { useEventFormData } from '@/hooks/useEventFormData';
import { useEventFormValidation } from '@/hooks/useEventFormValidation';
import { useEventFormSteps } from '@/hooks/useEventFormSteps';

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
  
  const { formData, handleInputChange, handleLocationSelect } = useEventFormData(event);
  const {
    startDate,
    endDate,
    registrationDeadline,
    dateErrors,
    setStartDate,
    setEndDate,
    setRegistrationDeadline,
    validateDates,
    handleDateChange
  } = useEventFormValidation();
  
  const { steps } = useEventFormSteps(formData, dateErrors);
  const { data: categories = [] } = useEventCategories();
  const { profile: professionalProfile } = useProfessionalProfile();
  const createEventMutation = useCreateEvent();
  const { toast } = useToast();

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  // Load existing event data
  useEffect(() => {
    if (event) {
      setStartDate(new Date(event.start_date));
      setEndDate(new Date(event.end_date));
      if (event.registration_deadline) {
        setRegistrationDeadline(new Date(event.registration_deadline));
      }
    }
  }, [event, setStartDate, setEndDate, setRegistrationDeadline]);

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
                handleDateChange={(field, date) => handleDateChange(field, date, handleInputChange)}
                handleLocationSelect={handleLocationSelect}
                startDate={startDate}
                endDate={endDate}
                registrationDeadline={registrationDeadline}
                dateErrors={dateErrors}
                eventTypes={[...eventTypes]}
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
                currencies={[...currencies]}
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
                eventTypes={[...eventTypes]}
                categories={categories}
                currencies={[...currencies]}
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
