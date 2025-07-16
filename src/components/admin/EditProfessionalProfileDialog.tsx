
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type ProfessionalRole = Database['public']['Enums']['professional_role'];

interface Account {
  id: string;
  user_id: string;
  company_name?: string;
  contact_email: string;
  created_at: string;
  type: 'professional';
  bio?: string;
  location?: string;
  phone?: string;
  website?: string;
  professional_role?: ProfessionalRole;
  team_description?: string;
}

interface EditProfessionalProfileDialogProps {
  account: Account;
  onAccountUpdated: () => void;
}

const EditProfessionalProfileDialog = ({ account, onAccountUpdated }: EditProfessionalProfileDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
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
    if (open) {
      console.log('Loading professional profile data:', account);
      setFormData({
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
      console.log('Submitting professional form data:', formData);
      console.log('Account ID:', account.id);

      const updateData = {
        company_name: formData.company_name,
        bio: formData.bio || null,
        contact_email: formData.contact_email,
        location: formData.location || null,
        phone: formData.phone || null,
        website: formData.website || null,
        professional_role: formData.professional_role,
        team_description: formData.team_description || null,
      };

      console.log('Prepared professional update data:', updateData);

      const { data, error } = await supabase
        .from('professional_profiles')
        .update(updateData)
        .eq('id', account.id)
        .select();

      if (error) {
        console.error('Supabase error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      console.log('Professional update successful:', data);

      toast({
        title: "Profil modifié",
        description: "Le profil professionnel a été modifié avec succès.",
      });

      setOpen(false);
      onAccountUpdated();
    } catch (error: any) {
      console.error('Error updating professional profile:', error);
      
      let errorMessage = "Impossible de modifier le profil professionnel.";
      
      if (error.code === '42501') {
        errorMessage = "Permissions insuffisantes pour modifier ce profil.";
      } else if (error.code === 'PGRST301') {
        errorMessage = "Profil non trouvé ou accès refusé.";
      } else if (error.message) {
        errorMessage = `Erreur: ${error.message}`;
      }

      toast({
        title: "Erreur",
        description: errorMessage,
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier le profil professionnel</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Informations de base</TabsTrigger>
              <TabsTrigger value="professional">Professionnel</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Nom de société *</Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_email">Email de contact *</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Biographie</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                />
              </div>
            </TabsContent>

            <TabsContent value="professional" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="professional_role">Rôle professionnel *</Label>
                <Select
                  value={formData.professional_role}
                  onValueChange={(value: ProfessionalRole) => 
                    setFormData({ ...formData, professional_role: value })
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
                <Label htmlFor="team_description">Description de l'équipe</Label>
                <Textarea
                  id="team_description"
                  value={formData.team_description}
                  onChange={(e) => setFormData({ ...formData, team_description: e.target.value })}
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="contact" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Localisation</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Site web</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Modification...' : 'Modifier le profil'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfessionalProfileDialog;
