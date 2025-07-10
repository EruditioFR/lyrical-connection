
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useCreateCasting } from '@/hooks/useCastings';
import { Calendar, MapPin, Users, Euro, Clock, Loader2 } from 'lucide-react';

const productionTypes = [
  { value: 'opera', label: 'Opéra' },
  { value: 'operetta', label: 'Opérette' },
  { value: 'concert', label: 'Concert' },
  { value: 'competition', label: 'Concours' },
  { value: 'masterclass', label: 'Masterclass' },
  { value: 'other', label: 'Autre' },
];

const compensationTypes = [
  { value: 'paid', label: 'Rémunéré' },
  { value: 'unpaid', label: 'Non rémunéré' },
  { value: 'travel_covered', label: 'Frais de transport couverts' },
  { value: 'accommodation_covered', label: 'Hébergement couvert' },
];

const voiceTypes = [
  'Soprano colorature', 'Soprano lyrique', 'Soprano dramatique',
  'Mezzo-soprano', 'Alto', 'Contralto',
  'Ténor léger', 'Ténor lyrique', 'Ténor dramatique',
  'Baryton', 'Basse-baryton', 'Basse'
];

const experienceLevels = [
  'beginner', 'intermediate', 'advanced', 'professional'
];

const CastingForm = () => {
  const { mutate: createCasting, isPending } = useCreateCasting();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    production_type: '',
    venue: '',
    location: '',
    start_date: '',
    end_date: '',
    application_deadline: '',
    audition_date: '',
    audition_location: '',
    compensation_type: '',
    compensation_amount: '',
    age_range_min: '',
    age_range_max: '',
    specific_requirements: '',
    required_voice_types: [] as string[],
    required_experience_level: [] as string[],
    required_languages: [] as string[],
    repertoire_requirements: [] as string[],
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayAdd = (field: string, value: string) => {
    if (value && !formData[field as keyof typeof formData].includes(value)) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field as keyof typeof formData] as string[], value]
      }));
    }
  };

  const handleArrayRemove = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field as keyof typeof formData] as string[]).filter(item => item !== value)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      compensation_amount: formData.compensation_amount ? parseInt(formData.compensation_amount) : null,
      age_range_min: formData.age_range_min ? parseInt(formData.age_range_min) : null,
      age_range_max: formData.age_range_max ? parseInt(formData.age_range_max) : null,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
      application_deadline: formData.application_deadline || null,
      audition_date: formData.audition_date || null,
    };

    createCasting(submitData);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-lyrical-600" />
            Créer un nouveau casting
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations générales */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informations générales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Titre du casting *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    placeholder="Ex: La Traviata - Rôle de Violetta"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Décrivez le projet, le contexte, les attentes..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="production_type">Type de production *</Label>
                    <Select 
                      value={formData.production_type}
                      onValueChange={(value) => handleChange('production_type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un type" />
                      </SelectTrigger>
                      <SelectContent>
                        {productionTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="venue">Lieu/Théâtre</Label>
                    <Input
                      id="venue"
                      value={formData.venue}
                      onChange={(e) => handleChange('venue', e.target.value)}
                      placeholder="Ex: Opéra de Paris"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="location">Ville/Région *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    placeholder="Ex: Paris, France"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Dates importantes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Dates importantes
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Date de début</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => handleChange('start_date', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="end_date">Date de fin</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => handleChange('end_date', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="application_deadline">Date limite de candidature</Label>
                  <Input
                    id="application_deadline"
                    type="date"
                    value={formData.application_deadline}
                    onChange={(e) => handleChange('application_deadline', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="audition_date">Date d'audition</Label>
                  <Input
                    id="audition_date"
                    type="date"
                    value={formData.audition_date}
                    onChange={(e) => handleChange('audition_date', e.target.value)}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="audition_location">Lieu d'audition</Label>
                  <Input
                    id="audition_location"
                    value={formData.audition_location}
                    onChange={(e) => handleChange('audition_location', e.target.value)}
                    placeholder="Adresse complète du lieu d'audition"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Compensation */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Euro className="h-4 w-4" />
                  Compensation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="compensation_type">Type de compensation</Label>
                  <Select 
                    value={formData.compensation_type}
                    onValueChange={(value) => handleChange('compensation_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un type" />
                    </SelectTrigger>
                    <SelectContent>
                      {compensationTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.compensation_type === 'paid' && (
                  <div>
                    <Label htmlFor="compensation_amount">Montant (€)</Label>
                    <Input
                      id="compensation_amount"
                      type="number"
                      value={formData.compensation_amount}
                      onChange={(e) => handleChange('compensation_amount', e.target.value)}
                      placeholder="Montant en euros"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Exigences */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Profil recherché</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="age_range_min">Âge minimum</Label>
                    <Input
                      id="age_range_min"
                      type="number"
                      value={formData.age_range_min}
                      onChange={(e) => handleChange('age_range_min', e.target.value)}
                      placeholder="Ex: 25"
                    />
                  </div>

                  <div>
                    <Label htmlFor="age_range_max">Âge maximum</Label>
                    <Input
                      id="age_range_max"
                      type="number"
                      value={formData.age_range_max}
                      onChange={(e) => handleChange('age_range_max', e.target.value)}
                      placeholder="Ex: 40"
                    />
                  </div>
                </div>

                <div>
                  <Label>Types de voix recherchés</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.required_voice_types.map(voice => (
                      <Badge 
                        key={voice} 
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => handleArrayRemove('required_voice_types', voice)}
                      >
                        {voice} ×
                      </Badge>
                    ))}
                  </div>
                  <Select onValueChange={(value) => handleArrayAdd('required_voice_types', value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Ajouter un type de voix" />
                    </SelectTrigger>
                    <SelectContent>
                      {voiceTypes.map(voice => (
                        <SelectItem key={voice} value={voice}>
                          {voice}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Niveau d'expérience requis</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.required_experience_level.map(level => (
                      <Badge 
                        key={level} 
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => handleArrayRemove('required_experience_level', level)}
                      >
                        {level} ×
                      </Badge>
                    ))}
                  </div>
                  <Select onValueChange={(value) => handleArrayAdd('required_experience_level', value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Ajouter un niveau" />
                    </SelectTrigger>
                    <SelectContent>
                      {experienceLevels.map(level => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="specific_requirements">Exigences spécifiques</Label>
                  <Textarea
                    id="specific_requirements"
                    value={formData.specific_requirements}
                    onChange={(e) => handleChange('specific_requirements', e.target.value)}
                    placeholder="Exigences particulières, compétences spéciales requises..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Button type="submit" disabled={isPending || !formData.title || !formData.production_type || !formData.location}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création...
                  </>
                ) : (
                  'Publier le casting'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CastingForm;
