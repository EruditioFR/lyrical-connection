import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useCreateEvent, useEventCategories, CreateEventData, ProfessionalEvent } from '@/hooks/useEvents';
import { useProfessionalProfile } from '@/hooks/useProfessionalProfile';
import { AddressAutocomplete } from './AddressAutocomplete';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EventFormProps {
  event?: ProfessionalEvent | null;
  onClose: () => void;
}

export const EventForm: React.FC<EventFormProps> = ({ event, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'masterclass' as 'masterclass' | 'stage' | 'concours' | 'atelier' | 'conference',
    status: 'draft' as 'draft' | 'published',
    category_id: '',
    start_date: '',
    end_date: '',
    registration_deadline: '',
    location: '',
    venue: '',
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
  });

  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [registrationDeadline, setRegistrationDeadline] = useState<Date>();

  const { data: categories = [] } = useEventCategories();
  const { profile: professionalProfile } = useProfessionalProfile();
  const createEventMutation = useCreateEvent();

  // Remplir le formulaire si on modifie un événement
  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description || '',
        event_type: event.event_type,
        status: event.status === 'draft' || event.status === 'published' ? event.status : 'draft',
        category_id: event.category_id || '',
        start_date: event.start_date,
        end_date: event.end_date,
        registration_deadline: event.registration_deadline || '',
        location: event.location || '',
        venue: event.venue || '',
        address: (event as any).address || '',
        latitude: (event as any).latitude?.toString() || '',
        longitude: (event as any).longitude?.toString() || '',
        max_participants: event.max_participants?.toString() || '',
        price: event.price?.toString() || '',
        currency: event.currency,
        requirements: event.requirements || '',
        program: event.program || '',
        contact_info: event.contact_info || '',
        image_url: event.image_url || '',
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

  const handleDateChange = (field: string, date: Date | undefined) => {
    if (date) {
      const isoString = date.toISOString();
      setFormData(prev => ({ ...prev, [field]: isoString }));
      
      if (field === 'start_date') setStartDate(date);
      if (field === 'end_date') setEndDate(date);
      if (field === 'registration_deadline') setRegistrationDeadline(date);
    }
  };

  const handleLocationSelect = (latitude: number, longitude: number) => {
    setFormData(prev => ({
      ...prev,
      latitude: latitude.toString(),
      longitude: longitude.toString()
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('HandleSubmit called');
    console.log('Professional profile:', professionalProfile);
    
    if (!professionalProfile) {
      console.error('No professional profile found');
      return;
    }

    const eventData: CreateEventData & { id?: string } = {
      professional_profile_id: professionalProfile.id,
      title: formData.title,
      description: formData.description || undefined,
      event_type: formData.event_type,
      status: formData.status,
      category_id: formData.category_id || undefined,
      start_date: formData.start_date,
      end_date: formData.end_date,
      registration_deadline: formData.registration_deadline || undefined,
      location: formData.location || undefined,
      venue: formData.venue || undefined,
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
    };

    if (event) {
      eventData.id = event.id;
    }

    try {
      await createEventMutation.mutateAsync(eventData);
      onClose();
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const eventTypes = [
    { value: 'masterclass', label: 'Masterclass' },
    { value: 'stage', label: 'Stage' },
    { value: 'concours', label: 'Concours' },
    { value: 'atelier', label: 'Atelier' },
    { value: 'conference', label: 'Conférence' },
  ];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {event ? 'Modifier l\'événement' : 'Créer un nouvel événement'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Informations de base */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event_type">Type d'événement *</Label>
              <Select
                value={formData.event_type}
                onValueChange={(value) => handleInputChange('event_type', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un type" />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
            />
          </div>

          {/* Catégorie et statut */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Catégorie</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => handleInputChange('category_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Brouillon</SelectItem>
                  <SelectItem value="published">Publié</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Date de début *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PP", { locale: fr }) : "Sélectionner"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => handleDateChange('start_date', date)}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Date de fin *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PP", { locale: fr }) : "Sélectionner"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => handleDateChange('end_date', date)}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Date limite d'inscription</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !registrationDeadline && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {registrationDeadline ? format(registrationDeadline, "PP", { locale: fr }) : "Optionnel"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={registrationDeadline}
                    onSelect={(date) => handleDateChange('registration_deadline', date)}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Lieu et adresse */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Ville</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Paris, Lyon..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="venue">Lieu précis</Label>
              <Input
                id="venue"
                value={formData.venue}
                onChange={(e) => handleInputChange('venue', e.target.value)}
                placeholder="Conservatoire, Studio..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_participants">Participants max</Label>
              <Input
                id="max_participants"
                type="number"
                value={formData.max_participants}
                onChange={(e) => handleInputChange('max_participants', e.target.value)}
                placeholder="20"
              />
            </div>
          </div>

          {/* Adresse complète avec autocomplétion */}
          <div className="space-y-2">
            <Label htmlFor="address">Adresse complète</Label>
            <AddressAutocomplete
              value={formData.address}
              onChange={(value) => handleInputChange('address', value)}
              onLocationSelect={handleLocationSelect}
              placeholder="Tapez une adresse dans le monde entier..."
            />
            {formData.latitude && formData.longitude && (
              <p className="text-sm text-muted-foreground">
                Coordonnées: {parseFloat(formData.latitude).toFixed(6)}, {parseFloat(formData.longitude).toFixed(6)}
              </p>
            )}
          </div>

          {/* Prix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Prix</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Devise</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => handleInputChange('currency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Détails supplémentaires */}
          <div className="space-y-2">
            <Label htmlFor="requirements">Prérequis</Label>
            <Textarea
              id="requirements"
              value={formData.requirements}
              onChange={(e) => handleInputChange('requirements', e.target.value)}
              placeholder="Niveau requis, matériel à apporter..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="program">Programme</Label>
            <Textarea
              id="program"
              value={formData.program}
              onChange={(e) => handleInputChange('program', e.target.value)}
              placeholder="Détail du programme, horaires..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_info">Informations de contact</Label>
            <Textarea
              id="contact_info"
              value={formData.contact_info}
              onChange={(e) => handleInputChange('contact_info', e.target.value)}
              placeholder="Email, téléphone..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">URL de l'image</Label>
            <Input
              id="image_url"
              type="url"
              value={formData.image_url}
              onChange={(e) => handleInputChange('image_url', e.target.value)}
              placeholder="https://..."
            />
          </div>

          {/* Boutons */}
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={createEventMutation.isPending || !formData.title || !formData.event_type || !formData.start_date || !formData.end_date}
              className="flex-1"
            >
              {createEventMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                event ? 'Modifier' : 'Créer'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
