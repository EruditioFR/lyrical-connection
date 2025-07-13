
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { AddressAutocomplete } from '../AddressAutocomplete';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarIcon, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EventEssentialStepProps {
  formData: any;
  handleInputChange: (field: string, value: string) => void;
  handleDateChange: (field: string, date: Date | undefined) => void;
  handleLocationSelect: (latitude: number, longitude: number) => void;
  startDate?: Date;
  endDate?: Date;
  registrationDeadline?: Date;
  dateErrors: any;
  eventTypes: any[];
}

export const EventEssentialStep: React.FC<EventEssentialStepProps> = ({
  formData,
  handleInputChange,
  handleDateChange,
  handleLocationSelect,
  startDate,
  endDate,
  registrationDeadline,
  dateErrors,
  eventTypes
}) => {
  const DatePicker = ({ 
    value, 
    onChange, 
    label, 
    placeholder = "Sélectionner", 
    error,
    minDate,
    maxDate 
  }: {
    value?: Date;
    onChange: (date: Date | undefined) => void;
    label: string;
    placeholder?: string;
    error?: string;
    minDate?: Date;
    maxDate?: Date;
  }) => (
    <div className="space-y-2">
      <Label className={error ? "text-red-500" : ""}>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground",
              error && "border-red-500 focus:border-red-500"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, "EEEE d MMMM yyyy", { locale: fr }) : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 z-50">
          <Calendar
            mode="single"
            selected={value}
            onSelect={onChange}
            initialFocus
            locale={fr}
            className="pointer-events-auto"
            disabled={(date) => {
              if (minDate && date < minDate) return true;
              if (maxDate && date > maxDate) return true;
              return false;
            }}
          />
        </PopoverContent>
      </Popover>
      {error && (
        <div className="flex items-center gap-1 text-sm text-red-500">
          <AlertCircle className="h-3 w-3" />
          {error}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Informations essentielles</h3>
        <p className="text-muted-foreground mb-6">
          Renseignez les informations de base de votre événement
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Titre de l'événement *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Ex: Masterclass de chant lyrique"
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
        <Label htmlFor="description">Description courte</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Résumé de votre événement en quelques lignes..."
          rows={3}
        />
      </div>

      <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
        <h4 className="font-medium text-blue-900 mb-4 flex items-center gap-2">
          <CalendarIcon className="h-4 w-4" />
          Programmation
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DatePicker
            value={startDate}
            onChange={(date) => handleDateChange('start_date', date)}
            label="Date de début *"
            placeholder="Quand commence l'événement ?"
            minDate={new Date()}
          />

          <DatePicker
            value={endDate}
            onChange={(date) => handleDateChange('end_date', date)}
            label="Date de fin *"
            placeholder="Quand se termine l'événement ?"
            error={dateErrors.endDate}
            minDate={startDate || new Date()}
          />
        </div>

        <div className="mt-4">
          <DatePicker
            value={registrationDeadline}
            onChange={(date) => handleDateChange('registration_deadline', date)}
            label="Date limite d'inscription"
            placeholder="Jusqu'à quand peut-on s'inscrire ?"
            error={dateErrors.registrationDeadline}
            minDate={new Date()}
            maxDate={startDate ? new Date(startDate.getTime() - 24 * 60 * 60 * 1000) : undefined}
          />
        </div>

        {startDate && endDate && !dateErrors.endDate && (
          <div className="mt-3 p-2 bg-green-50 rounded text-sm text-green-700">
            Durée de l'événement : {Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} jour(s)
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Adresse complète *</Label>
        <AddressAutocomplete
          value={formData.address}
          onChange={(value) => handleInputChange('address', value)}
          onLocationSelect={handleLocationSelect}
          placeholder="Tapez une adresse..."
        />
        {formData.latitude && formData.longitude && (
          <p className="text-sm text-muted-foreground">
            Coordonnées: {parseFloat(formData.latitude).toFixed(6)}, {parseFloat(formData.longitude).toFixed(6)}
          </p>
        )}
      </div>
    </div>
  );
};
