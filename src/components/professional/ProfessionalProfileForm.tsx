
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useProfessionalProfile } from '@/hooks/useProfessionalProfile';
import { Briefcase, MapPin, Globe, Phone, Mail, Users, Clock, Target, Loader2 } from 'lucide-react';

const professionalRoles = [
  { value: 'casting_director', label: 'Directeur de casting / Directeur artistique', icon: '🎭' },
  { value: 'vocal_coach', label: 'Chef de chant / Coach vocal', icon: '🎶' },
  { value: 'conductor', label: 'Chef d\'orchestre', icon: '🎼' },
  { value: 'opera_house_manager', label: 'Responsable de maison d\'opéra', icon: '🏛️' },
  { value: 'voice_teacher', label: 'Professeur de chant / Pédagogue', icon: '🧑‍🏫' },
  { value: 'artistic_agent', label: 'Agent artistique / Manager', icon: '💼' },
  { value: 'producer', label: 'Producteur de spectacle / festival', icon: '🎥' },
  { value: 'competition_director', label: 'Directeur de concours / jury', icon: '🎤' }
];

const ProfessionalProfileForm = () => {
  const { profile, isLoading, createProfile, updateProfile, isCreating, isUpdating } = useProfessionalProfile();
  
  const [formData, setFormData] = useState({
    professional_role: '',
    company_name: '',
    bio: '',
    website: '',
    location: '',
    intervention_radius: 50,
    team_description: '',
    contact_email: '',
    phone: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        professional_role: profile.professional_role || '',
        company_name: profile.company_name || '',
        bio: profile.bio || '',
        website: profile.website || '',
        location: profile.location || '',
        intervention_radius: profile.intervention_radius || 50,
        team_description: profile.team_description || '',
        contact_email: profile.contact_email || '',
        phone: profile.phone || '',
      });
    }
  }, [profile]);

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (profile) {
      updateProfile(formData);
    } else {
      createProfile(formData);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const selectedRole = professionalRoles.find(role => role.value === formData.professional_role);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-serif font-bold mb-2">Mon Profil Professionnel</h1>
        <p className="text-muted-foreground">
          Gérez vos informations professionnelles et présentez votre activité
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations de base */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Informations générales
            </CardTitle>
            <CardDescription>
              Présentez votre activité professionnelle
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company_name">Nom de société / organisation *</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => handleChange('company_name', e.target.value)}
                  placeholder="Nom de votre société"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="professional_role">Votre métier *</Label>
                <Select 
                  value={formData.professional_role} 
                  onValueChange={(value) => handleChange('professional_role', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez votre métier" />
                  </SelectTrigger>
                  <SelectContent>
                    {professionalRoles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        <div className="flex items-center gap-2">
                          <span>{role.icon}</span>
                          <span>{role.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedRole && (
                  <Badge variant="secondary" className="mt-2">
                    {selectedRole.icon} {selectedRole.label}
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Présentation (max 1000 caractères)</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                placeholder="Décrivez votre activité, votre expérience et vos spécialités..."
                maxLength={1000}
                rows={4}
              />
              <p className="text-sm text-muted-foreground">
                {formData.bio.length}/1000 caractères
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact et localisation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Contact et localisation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact_email">Email de contact</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="contact_email"
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => handleChange('contact_email', e.target.value)}
                    placeholder="contact@votresociete.com"
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="+33 1 23 45 67 89"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Localisation</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  placeholder="Paris, France"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="intervention_radius">Rayon d'intervention (km)</Label>
                <Input
                  id="intervention_radius"
                  type="number"
                  min="0"
                  max="1000"
                  value={formData.intervention_radius}
                  onChange={(e) => handleChange('intervention_radius', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Site web</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleChange('website', e.target.value)}
                  placeholder="https://www.votresite.com"
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Équipe */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Équipe (facultatif)
            </CardTitle>
            <CardDescription>
              Décrivez votre équipe et vos collaborateurs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="team_description">Description de l'équipe</Label>
              <Textarea
                id="team_description"
                value={formData.team_description}
                onChange={(e) => handleChange('team_description', e.target.value)}
                placeholder="Présentez les membres de votre équipe, leurs spécialités..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Bouton de sauvegarde */}
        <div className="flex justify-end gap-4">
          <Button 
            type="submit" 
            disabled={isCreating || isUpdating}
            className="bg-gradient-to-r from-lyrical-600 to-gold-500 hover:from-lyrical-700 hover:to-gold-600"
          >
            {isCreating || isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sauvegarde...
              </>
            ) : (
              profile ? 'Mettre à jour' : 'Créer le profil'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProfessionalProfileForm;
