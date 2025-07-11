
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  CreditCard, 
  Send, 
  Eye, 
  CheckCircle, 
  Clock, 
  XCircle,
  Mail,
  User,
  Briefcase
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/hooks/useSubscription';

interface UpgradeRequest {
  id: string;
  user_id: string;
  profile_id: string;
  profile_type: 'artist' | 'professional';
  status: 'pending' | 'sent' | 'paid' | 'completed' | 'cancelled';
  payment_link?: string;
  created_at: string;
  updated_at: string;
  user_name?: string;
  profile_name?: string;
  contact_email?: string;
}

const UpgradeRequestManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { createCheckoutSession } = useSubscription();
  const [selectedRequest, setSelectedRequest] = useState<UpgradeRequest | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [customMessage, setCustomMessage] = useState('');

  // Récupérer les demandes d'upgrade
  const { data: upgradeRequests = [], isLoading } = useQuery({
    queryKey: ['upgrade-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('upgrade_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Simulation d'informations utilisateur supplémentaires
      const enrichedData = data.map(request => ({
        ...request,
        user_name: `Utilisateur ${request.user_id.slice(-4)}`,
        profile_name: request.profile_type === 'artist' ? 'Profil Artiste' : 'Profil Professionnel',
        contact_email: `user${request.user_id.slice(-4)}@example.com`
      }));

      return enrichedData as UpgradeRequest[];
    }
  });

  // Créer un lien de paiement Stripe
  const createPaymentLink = useMutation({
    mutationFn: async (request: UpgradeRequest) => {
      // Déterminer le plan basé sur le type de profil
      const planName = request.profile_type === 'artist' ? 'Artistes' : 'Professionnels';
      
      // Récupérer le plan correspondant
      const { data: plans } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('name', planName)
        .single();

      if (!plans) throw new Error('Plan non trouvé');

      // Créer la session de paiement
      return createCheckoutSession.mutateAsync(plans.id);
    },
    onSuccess: async (data, request) => {
      // Mettre à jour la demande avec le lien de paiement
      await supabase
        .from('upgrade_requests')
        .update({ 
          status: 'sent',
          payment_link: data.url,
          updated_at: new Date().toISOString()
        })
        .eq('id', request.id);

      queryClient.invalidateQueries({ queryKey: ['upgrade-requests'] });
      
      toast({
        title: "Lien de paiement créé",
        description: "Un lien de paiement Stripe a été généré et envoyé à l'utilisateur."
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de créer le lien de paiement",
        variant: "destructive"
      });
      console.error('Erreur création paiement:', error);
    }
  });

  // Envoyer un email personnalisé
  const sendCustomEmail = useMutation({
    mutationFn: async ({ request, message }: { request: UpgradeRequest; message: string }) => {
      // Ici, on utiliserait une edge function pour envoyer l'email via Resend
      console.log('Envoi email personnalisé:', { request, message });
      
      // Simulation d'envoi d'email
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Email envoyé",
        description: "L'email personnalisé a été envoyé avec succès."
      });
      setIsDialogOpen(false);
      setCustomMessage('');
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer l'email",
        variant: "destructive"
      });
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />En attente</Badge>;
      case 'sent':
        return <Badge className="bg-blue-100 text-blue-800"><Send className="h-3 w-3 mr-1" />Envoyé</Badge>;
      case 'paid':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Payé</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Complété</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Annulé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Demandes d'Upgrade ({upgradeRequests.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upgradeRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Aucune demande d'upgrade en cours</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Type de Profil</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date de Demande</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upgradeRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{request.user_name}</div>
                          <div className="text-sm text-muted-foreground">{request.contact_email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {request.profile_type === 'artist' ? (
                          <User className="h-4 w-4 text-blue-500" />
                        ) : (
                          <Briefcase className="h-4 w-4 text-green-500" />
                        )}
                        <Badge variant={request.profile_type === 'artist' ? 'default' : 'secondary'}>
                          {request.profile_type === 'artist' ? 'Artiste' : 'Professionnel'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(request.status)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(request.created_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {request.status === 'pending' && (
                          <Button
                            onClick={() => createPaymentLink.mutate(request)}
                            disabled={createPaymentLink.isPending}
                            size="sm"
                            className="gap-1"
                          >
                            <CreditCard className="h-3 w-3" />
                            Créer Paiement
                          </Button>
                        )}
                        
                        {request.payment_link && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(request.payment_link, '_blank')}
                            className="gap-1"
                          >
                            <Eye className="h-3 w-3" />
                            Voir Lien
                          </Button>
                        )}

                        <Dialog open={isDialogOpen && selectedRequest?.id === request.id} onOpenChange={setIsDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedRequest(request)}
                              className="gap-1"
                            >
                              <Mail className="h-3 w-3" />
                              Email
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Envoyer un Email Personnalisé</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="recipient">Destinataire</Label>
                                <Input
                                  id="recipient"
                                  value={request.contact_email}
                                  disabled
                                />
                              </div>
                              <div>
                                <Label htmlFor="message">Message</Label>
                                <Textarea
                                  id="message"
                                  placeholder="Écrivez votre message personnalisé..."
                                  value={customMessage}
                                  onChange={(e) => setCustomMessage(e.target.value)}
                                  rows={5}
                                />
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  onClick={() => setIsDialogOpen(false)}
                                >
                                  Annuler
                                </Button>
                                <Button
                                  onClick={() => sendCustomEmail.mutate({ request, message: customMessage })}
                                  disabled={sendCustomEmail.isPending || !customMessage.trim()}
                                >
                                  <Send className="h-4 w-4 mr-2" />
                                  Envoyer
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UpgradeRequestManager;
