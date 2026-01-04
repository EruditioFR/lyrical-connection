import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  Plus, 
  Ticket, 
  Users, 
  Calendar, 
  Loader2, 
  Copy, 
  Check,
  Trash2,
  Edit,
  Download
} from 'lucide-react';

interface PromoCode {
  id: string;
  code: string;
  campaign_name: string;
  description: string | null;
  discount_type: string;
  subscription_months: number;
  max_uses: number | null;
  current_uses: number;
  starts_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
}

interface Redemption {
  id: string;
  redeemed_at: string;
  subscription_granted_until: string;
  badges_granted: string[];
  user_id: string;
  artist_profile: {
    id: string;
    stage_name: string;
  } | null;
}

const PromoCodeManager = () => {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedCode, setSelectedCode] = useState<PromoCode | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Form state for new promo code
  const [formData, setFormData] = useState({
    code: '',
    campaign_name: '',
    description: '',
    subscription_months: 6,
    max_uses: '',
    expires_at: '',
    badge_type: '',
    badge_name: '',
    badge_icon: '⭐'
  });

  // Fetch promo codes
  const { data: promoCodes = [], isLoading } = useQuery({
    queryKey: ['adminPromoCodes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PromoCode[];
    }
  });

  // Fetch redemptions for selected code
  const { data: redemptions = [], isLoading: redemptionsLoading } = useQuery({
    queryKey: ['promoRedemptions', selectedCode?.id],
    queryFn: async () => {
      if (!selectedCode) return [];
      
      const { data, error } = await supabase
        .from('promo_code_redemptions')
        .select(`
          id,
          redeemed_at,
          subscription_granted_until,
          badges_granted,
          user_id,
          artist_profile:artist_profiles(id, stage_name)
        `)
        .eq('promo_code_id', selectedCode.id)
        .order('redeemed_at', { ascending: false });

      if (error) throw error;
      return data as Redemption[];
    },
    enabled: !!selectedCode
  });

  // Create promo code mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const metadata: Record<string, string> = {};
      if (data.badge_type) metadata.badge_type = data.badge_type;
      if (data.badge_name) metadata.badge_name = data.badge_name;
      if (data.badge_icon) metadata.badge_icon = data.badge_icon;

      const { error } = await supabase
        .from('promo_codes')
        .insert({
          code: data.code.toUpperCase().trim(),
          campaign_name: data.campaign_name,
          description: data.description || null,
          subscription_months: data.subscription_months,
          max_uses: data.max_uses ? parseInt(data.max_uses) : null,
          expires_at: data.expires_at || null,
          starts_at: new Date().toISOString(),
          metadata
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPromoCodes'] });
      toast.success('Code promo créé avec succès');
      setIsCreateOpen(false);
      resetForm();
    },
    onError: (error) => {
      console.error('Error creating promo code:', error);
      toast.error('Erreur lors de la création du code promo');
    }
  });

  // Toggle active mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('promo_codes')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPromoCodes'] });
      toast.success('Statut mis à jour');
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('promo_codes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPromoCodes'] });
      toast.success('Code promo supprimé');
      setSelectedCode(null);
    }
  });

  const resetForm = () => {
    setFormData({
      code: '',
      campaign_name: '',
      description: '',
      subscription_months: 6,
      max_uses: '',
      expires_at: '',
      badge_type: '',
      badge_name: '',
      badge_icon: '⭐'
    });
  };

  const handleCopy = async (code: string, id: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success('Code copié !');
  };

  const handleExportCSV = () => {
    if (!selectedCode || redemptions.length === 0) return;

    const headers = ['Artiste', 'Date d\'utilisation', 'Abonnement jusqu\'au', 'Badges'];
    const rows = redemptions.map(r => [
      r.artist_profile?.stage_name || 'N/A',
      new Date(r.redeemed_at).toLocaleDateString('fr-FR'),
      new Date(r.subscription_granted_until).toLocaleDateString('fr-FR'),
      r.badges_granted?.join(', ') || ''
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${selectedCode.campaign_name.replace(/\s+/g, '_')}_participants.csv`;
    link.click();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Codes Promotionnels</h2>
          <p className="text-muted-foreground">
            Gérez les codes promo et suivez leur utilisation
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau code
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Créer un code promo</DialogTitle>
              <DialogDescription>
                Configurez un nouveau code promotionnel
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(formData); }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Code *</Label>
                  <Input
                    id="code"
                    placeholder="SUMIJO2026"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="font-mono uppercase"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="months">Mois Premium *</Label>
                  <Input
                    id="months"
                    type="number"
                    min={1}
                    max={24}
                    value={formData.subscription_months}
                    onChange={(e) => setFormData({ ...formData, subscription_months: parseInt(e.target.value) || 6 })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="campaign">Nom de la campagne *</Label>
                <Input
                  id="campaign"
                  placeholder="Concours International Sumi Jo 2026"
                  value={formData.campaign_name}
                  onChange={(e) => setFormData({ ...formData, campaign_name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Description du code promo..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max_uses">Limite d'utilisation</Label>
                  <Input
                    id="max_uses"
                    type="number"
                    min={1}
                    placeholder="Illimité"
                    value={formData.max_uses}
                    onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expires">Expire le</Label>
                  <Input
                    id="expires"
                    type="date"
                    value={formData.expires_at}
                    onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Badge attribué (optionnel)</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="badge_icon">Icône</Label>
                    <Input
                      id="badge_icon"
                      placeholder="⭐"
                      value={formData.badge_icon}
                      onChange={(e) => setFormData({ ...formData, badge_icon: e.target.value })}
                      className="text-center"
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="badge_name">Nom du badge</Label>
                    <Input
                      id="badge_name"
                      placeholder="Candidat Sumi Jo 2026"
                      value={formData.badge_name}
                      onChange={(e) => setFormData({ ...formData, badge_name: e.target.value })}
                    />
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  <Label htmlFor="badge_type">Type technique</Label>
                  <Input
                    id="badge_type"
                    placeholder="sumi_jo_2026"
                    value={formData.badge_type}
                    onChange={(e) => setFormData({ ...formData, badge_type: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                    className="font-mono text-sm"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Créer le code
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Codes List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="w-5 h-5" />
              Codes actifs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {promoCodes.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Aucun code promo créé
              </p>
            ) : (
              <div className="space-y-3">
                {promoCodes.map((promo) => (
                  <div
                    key={promo.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedCode?.id === promo.id 
                        ? 'border-primary bg-primary/5' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedCode(promo)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <code className="font-mono font-bold text-lg">{promo.code}</code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => { e.stopPropagation(); handleCopy(promo.code, promo.id); }}
                        >
                          {copiedId === promo.id ? (
                            <Check className="w-3 h-3 text-green-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                      <Switch
                        checked={promo.is_active}
                        onCheckedChange={(checked) => {
                          toggleActiveMutation.mutate({ id: promo.id, isActive: checked });
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{promo.campaign_name}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {promo.current_uses}{promo.max_uses ? `/${promo.max_uses}` : ''} utilisations
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {promo.subscription_months} mois
                      </Badge>
                      {promo.expires_at && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(promo.expires_at).toLocaleDateString('fr-FR')}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Details & Redemptions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                {selectedCode ? `Participants - ${selectedCode.code}` : 'Sélectionnez un code'}
              </CardTitle>
              {selectedCode && redemptions.length > 0 && (
                <Button variant="outline" size="sm" onClick={handleExportCSV}>
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              )}
            </div>
            {selectedCode && (
              <CardDescription>
                {selectedCode.campaign_name} • {redemptions.length} participant{redemptions.length > 1 ? 's' : ''}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {!selectedCode ? (
              <p className="text-center text-muted-foreground py-8">
                Cliquez sur un code pour voir les détails
              </p>
            ) : redemptionsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : redemptions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Aucune utilisation pour ce code
              </p>
            ) : (
              <div className="max-h-[400px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Artiste</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Jusqu'au</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {redemptions.map((redemption) => (
                      <TableRow key={redemption.id}>
                        <TableCell className="font-medium">
                          {redemption.artist_profile?.stage_name || 'N/A'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(redemption.redeemed_at).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(redemption.subscription_granted_until).toLocaleDateString('fr-FR')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {selectedCode && (
              <div className="mt-4 pt-4 border-t flex justify-end">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (confirm('Supprimer ce code promo ?')) {
                      deleteMutation.mutate(selectedCode.id);
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PromoCodeManager;
