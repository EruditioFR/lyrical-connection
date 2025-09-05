
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { voiceTypes } from '@/constants/voiceTypes';
import { countries } from '@/constants/countries';
import type { Database } from '@/integrations/supabase/types';

type ProfessionalRole = Database['public']['Enums']['professional_role'];

interface Account {
  id: string;
  user_id: string;
  stage_name?: string;
  company_name?: string;
  contact_email: string;
  created_at: string;
  type: 'artist' | 'professional';
  bio?: string;
  voice_type?: string;
  location?: string;
  phone?: string;
  website?: string;
  nationality?: string;
  experience_years?: number;
  professional_role?: ProfessionalRole;
  team_description?: string;
  public_visibility_premium?: boolean;
  premium_subscription_end?: string;
}

interface EditFreeAccountDialogProps {
  account: Account;
  onAccountUpdated: () => void;
}

const EditFreeAccountDialog = ({ account, onAccountUpdated }: EditFreeAccountDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [accessLevel, setAccessLevel] = useState<'standard' | 'premium'>('standard');
  const { toast } = useToast();

  // Artist form state
  const [artistData, setArtistData] = useState({
    stage_name: '',
    bio: '',
    voice_type: '',
    contact_email: '',
    location: '',
    phone: '',
    website: '',
    nationality: '',
    experience_years: 0,
  });

  // Professional form state
  const [professionalData, setProfessionalData] = useState({
    company_name: '',
    bio: '',
    contact_email: '',
    location: '',
    phone: '',
    website: '',
    professional_role: 'vocal_coach' as ProfessionalRole,
    team_description: '',
  });

  useEffect(() => {
    // Déterminer le niveau d'accès actuel
    const isPremium = account.public_visibility_premium && 
                      account.premium_subscription_end && 
                      new Date(account.premium_subscription_end) > new Date();
    setAccessLevel(isPremium ? 'premium' : 'standard');
    
    if (account.type === 'artist') {
      setArtistData({
        stage_name: account.stage_name || '',
        bio: account.bio || '',
        voice_type: account.voice_type || '',
        contact_email: account.contact_email || '',
        location: account.location || '',
        phone: account.phone || '',
        website: account.website || '',
        nationality: account.nationality || '',
        experience_years: account.experience_years || 0,
      });
    } else {
      setProfessionalData({
        company_name: account.company_name || '',
        bio: account.bio || '',
        contact_email: account.contact_email || '',
        location: account.location || '',
        phone: account.phone || '',
        website: account.website || '',
        professional_role: account.professional_role || 'vocal_coach',
        team_description: account.team_description || '',
      });
    }
  }, [account, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const isPremiumVisibility = accessLevel === 'premium';
      
      if (account.type === 'artist') {
        const updateData = {
          ...artistData,
          experience_years: artistData.experience_years || null,
          public_visibility_premium: isPremiumVisibility,
          premium_subscription_end: isPremiumVisibility ? 
            new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() : null,
        };

        const { error } = await supabase
          .from('artist_profiles')
          .update(updateData)
          .eq('id', account.id);

        if (error) throw error;
      } else {
        const updateData = {
          ...professionalData,
          public_visibility_premium: isPremiumVisibility,
          premium_subscription_end: isPremiumVisibility ? 
            new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() : null,
        };
        
        const { error } = await supabase
          .from('professional_profiles')
          .update(updateData)
          .eq('id', account.id);

        if (error) throw error;
      }

      toast({
        title: "Compte modifié",
        description: `Le compte ${account.type === 'artist' ? 'artiste' : 'professionnel'} a été modifié avec succès.`,
      });

      setOpen(false);
      onAccountUpdated();
    } catch (error) {
      console.error('Error updating account:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le compte.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1">
          <Edit className="h-3 w-3" />
          Modifier
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Modifier le compte {account.type === 'artist' ? 'artiste' : 'professionnel'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="access_level">Niveau d'accès *</Label>
            <Select value={accessLevel} onValueChange={(value: 'standard' | 'premium') => setAccessLevel(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard (accès complet)</SelectItem>
                <SelectItem value="premium">Premium Visibilité (accès complet + visibilité premium)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {account.type === 'artist' ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="stage_name">Nom de scène *</Label>
                <Input
                  id="stage_name"
                  value={artistData.stage_name}
                  onChange={(e) => setArtistData({ ...artistData, stage_name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Biographie</Label>
                <Textarea
                  id="bio"
                  value={artistData.bio}
                  onChange={(e) => setArtistData({ ...artistData, bio: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="voice_type">Type de voix</Label>
                <Select
                  value={artistData.voice_type}
                  onValueChange={(value) => setArtistData({ ...artistData, voice_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un type de voix" />
                  </SelectTrigger>
                  <SelectContent>
                    {voiceTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nationality">Nationalité</Label>
                <Select
                  value={artistData.nationality}
                  onValueChange={(value) => setArtistData({ ...artistData, nationality: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une nationalité" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience_years">Années d'expérience</Label>
                <Input
                  id="experience_years"
                  type="number"
                  min="0"
                  value={artistData.experience_years}
                  onChange={(e) => setArtistData({ ...artistData, experience_years: parseInt(e.target.value) || 0 })}
                />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="company_name">Nom de société *</Label>
                <Input
                  id="company_name"
                  value={professionalData.company_name}
                  onChange={(e) => setProfessionalData({ ...professionalData, company_name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="professional_role">Rôle professionnel *</Label>
                <Select
                  value={professionalData.professional_role}
                  onValueChange={(value: ProfessionalRole) => 
                    setProfessionalData({ ...professionalData, professional_role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vocal_coach">Coach vocal</SelectItem>
                    <SelectItem value="opera_house_manager">Directeur d'opéra</SelectItem>
                    <SelectItem value="conductor">Chef d'orchestre</SelectItem>
                    <SelectItem value="casting_director">Directeur de casting</SelectItem>
                    <SelectItem value="artistic_agent">Agent</SelectItem>
                    <SelectItem value="voice_teacher">Accompagnateur</SelectItem>
                    <SelectItem value="producer">Producteur</SelectItem>
                    <SelectItem value="competition_director">Gestionnaire de salle</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Biographie</Label>
                <Textarea
                  id="bio"
                  value={professionalData.bio}
                  onChange={(e) => setProfessionalData({ ...professionalData, bio: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="team_description">Description de l'équipe</Label>
                <Textarea
                  id="team_description"
                  value={professionalData.team_description}
                  onChange={(e) => setProfessionalData({ ...professionalData, team_description: e.target.value })}
                  rows={2}
                />
              </div>
            </>
          )}

          {/* Common fields */}
          <div className="space-y-2">
            <Label htmlFor="contact_email">Email de contact *</Label>
            <Input
              id="contact_email"
              type="email"
              value={account.type === 'artist' ? artistData.contact_email : professionalData.contact_email}
              onChange={(e) => {
                if (account.type === 'artist') {
                  setArtistData({ ...artistData, contact_email: e.target.value });
                } else {
                  setProfessionalData({ ...professionalData, contact_email: e.target.value });
                }
              }}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Localisation</Label>
            <Input
              id="location"
              value={account.type === 'artist' ? artistData.location : professionalData.location}
              onChange={(e) => {
                if (account.type === 'artist') {
                  setArtistData({ ...artistData, location: e.target.value });
                } else {
                  setProfessionalData({ ...professionalData, location: e.target.value });
                }
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              value={account.type === 'artist' ? artistData.phone : professionalData.phone}
              onChange={(e) => {
                if (account.type === 'artist') {
                  setArtistData({ ...artistData, phone: e.target.value });
                } else {
                  setProfessionalData({ ...professionalData, phone: e.target.value });
                }
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Site web</Label>
            <Input
              id="website"
              type="url"
              value={account.type === 'artist' ? artistData.website : professionalData.website}
              onChange={(e) => {
                if (account.type === 'artist') {
                  setArtistData({ ...artistData, website: e.target.value });
                } else {
                  setProfessionalData({ ...professionalData, website: e.target.value });
                }
              }}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Modification...' : 'Modifier le compte'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditFreeAccountDialog;
