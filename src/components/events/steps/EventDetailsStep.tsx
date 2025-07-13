
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EventDetailsStepProps {
  formData: any;
  handleInputChange: (field: string, value: string) => void;
  categories: any[];
}

export const EventDetailsStep: React.FC<EventDetailsStepProps> = ({
  formData,
  handleInputChange,
  categories
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Détails de l'événement</h3>
        <p className="text-muted-foreground mb-6">
          Décrivez en détail votre événement pour attirer les participants
        </p>
      </div>

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
        <Label htmlFor="program">Programme détaillé</Label>
        <Textarea
          id="program"
          value={formData.program}
          onChange={(e) => handleInputChange('program', e.target.value)}
          placeholder="Détaillez le déroulement de votre événement, les horaires, les activités..."
          rows={5}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="requirements">Prérequis et niveau requis</Label>
        <Textarea
          id="requirements"
          value={formData.requirements}
          onChange={(e) => handleInputChange('requirements', e.target.value)}
          placeholder="Niveau requis, compétences préalables, matériel à apporter..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact_info">Informations de contact</Label>
        <Textarea
          id="contact_info"
          value={formData.contact_info}
          onChange={(e) => handleInputChange('contact_info', e.target.value)}
          placeholder="Email, téléphone, ou autres moyens de contact pour les questions..."
          rows={2}
        />
      </div>
    </div>
  );
};
