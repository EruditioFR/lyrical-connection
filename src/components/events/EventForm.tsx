import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useCreateEvent, useUpdateEvent, useEventDetail, CreateEventData, Event } from '@/hooks/useEvents';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const EventForm = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = !!eventId;

  const { data: existingEvent, isLoading: eventLoading } = useEventDetail(eventId);
  const { mutate: createEvent, isPending: isCreating } = useCreateEvent();
  const { mutate: updateEvent, isPending: isUpdating } = useUpdateEvent();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventType, setEventType] = useState('concert');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [location, setLocation] = useState('');
  const [venue, setVenue] = useState('');
  const [price, setPrice] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [requirements, setRequirements] = useState('');
  const [program, setProgram] = useState('');
  const [contactInfo, setContactInfo] = useState('');

  useEffect(() => {
    if (existingEvent) {
      setTitle(existingEvent.title);
      setDescription(existingEvent.description || '');
      setEventType(existingEvent.event_type);
      setStartDate(existingEvent.start_date ? new Date(existingEvent.start_date) : null);
      setEndDate(existingEvent.end_date ? new Date(existingEvent.end_date) : null);
      setLocation(existingEvent.location || '');
      setVenue(existingEvent.venue || '');
      setPrice(existingEvent.price ? existingEvent.price.toString() : '');
      setMaxParticipants(existingEvent.max_participants ? existingEvent.max_participants.toString() : '');
      setRequirements(existingEvent.requirements || '');
      setProgram(existingEvent.program || '');
      setContactInfo(existingEvent.contact_info || '');
    }
  }, [existingEvent]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !startDate || !endDate) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive"
      });
      return;
    }

    const eventData: CreateEventData = {
      title,
      description: description || null,
      event_type: eventType as any,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      location: location || null,
      venue: venue || null,
      price: price ? parseFloat(price) : null,
      max_participants: maxParticipants ? parseInt(maxParticipants) : null,
      requirements: requirements || null,
      program: program || null,
      contact_info: contactInfo || null,
      status: 'draft',
      currency: 'EUR',
      is_featured: false
    };

    if (isEditing && existingEvent) {
      const updateData: Event = {
        ...existingEvent,
        ...eventData,
        professional_profile_id: existingEvent.professional_profile_id
      };
      updateEvent(updateData, {
        onSuccess: () => {
          toast({
            title: "Succès",
            description: "Événement mis à jour avec succès."
          });
          navigate('/professional/events');
        }
      });
    } else {
      createEvent(eventData, {
        onSuccess: () => {
          toast({
            title: "Succès", 
            description: "Événement créé avec succès."
          });
          navigate('/professional/events');
        }
      });
    }
  };

  if (eventLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Modifier un événement' : 'Créer un événement'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Titre</Label>
            <Input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="eventType">Type d'événement</Label>
            <Select value={eventType} onValueChange={setEventType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionnez un type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="concert">Concert</SelectItem>
                <SelectItem value="masterclass">Masterclass</SelectItem>
                {/* Add other event types as needed */}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Date de début</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !startDate && 'text-muted-foreground'
                    )}
                  >
                    {startDate ? format(startDate, 'PPP', { locale: fr }) : <span>Choisir une date</span>}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center" side="bottom">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    disabled={date =>
                      date < new Date()
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>Date de fin</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !endDate && 'text-muted-foreground'
                    )}
                  >
                    {endDate ? format(endDate, 'PPP', { locale: fr }) : <span>Choisir une date</span>}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center" side="bottom">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    disabled={date =>
                      date < new Date()
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div>
            <Label htmlFor="location">Lieu</Label>
            <Input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="venue">Salle</Label>
            <Input
              type="text"
              id="venue"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Prix (€)</Label>
              <Input
                type="number"
                id="price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="maxParticipants">Nombre maximum de participants</Label>
              <Input
                type="number"
                id="maxParticipants"
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="requirements">Exigences</Label>
            <Textarea
              id="requirements"
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="program">Programme</Label>
            <Textarea
              id="program"
              value={program}
              onChange={(e) => setProgram(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="contactInfo">Informations de contact</Label>
            <Textarea
              id="contactInfo"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={isCreating || isUpdating}>
            {isCreating || isUpdating ? (
              <>
                Enregistrement...
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              </>
            ) : (
              'Enregistrer'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default EventForm;
