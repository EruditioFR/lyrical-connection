
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  CreditCard, 
  CheckCircle, 
  Clock, 
  XCircle,
  DollarSign,
  TrendingUp,
  Users,
  Calendar
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PaymentRecord {
  id: string;
  user_id: string;
  profile_id: string;
  profile_type: 'artist' | 'professional';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  stripe_payment_id: string;
  created_at: string;
  completed_at?: string;
  user_name?: string;
  profile_name?: string;
}

const PaymentManager = () => {
  const { toast } = useToast();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Récupérer les données de paiement réelles
  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des paiements:', error);
        throw error;
      }

      // Transformer les données pour correspondre à l'interface PaymentRecord
      const transformedPayments: PaymentRecord[] = data?.map(payment => ({
        id: payment.id,
        user_id: payment.user_id,
        profile_id: payment.related_id || '',
        profile_type: payment.payment_type === 'premium_visibility' ? 'artist' : 'professional',
        amount: payment.amount,
        currency: payment.currency.toUpperCase(),
        status: payment.status as any,
        stripe_payment_id: payment.stripe_payment_id || '',
        created_at: payment.created_at,
        completed_at: payment.status === 'completed' ? payment.updated_at : undefined,
        user_name: 'Utilisateur', // TODO: récupérer les données utilisateur si nécessaire
        profile_name: 'Profil' // TODO: récupérer les données de profil si nécessaire
      })) || [];

      return transformedPayments;
    }
  });

  const filteredPayments = payments.filter(payment => 
    selectedStatus === 'all' || payment.status === selectedStatus
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Complété</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />En attente</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Échoué</Badge>;
      case 'refunded':
        return <Badge className="bg-gray-100 text-gray-800">Remboursé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency
    }).format(amount / 100);
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

  // Statistiques des paiements
  const paymentStats = {
    total: payments.length,
    completed: payments.filter(p => p.status === 'completed').length,
    pending: payments.filter(p => p.status === 'pending').length,
    totalRevenue: payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0)
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistiques des paiements */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paiements</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paymentStats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paiements Complétés</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{paymentStats.completed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Attente</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{paymentStats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatAmount(paymentStats.totalRevenue, 'EUR')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et tableau des paiements */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Historique des Paiements</CardTitle>
            <div className="flex items-center gap-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-1 border rounded-md text-sm"
              >
                <option value="all">Tous les statuts</option>
                <option value="completed">Complétés</option>
                <option value="pending">En attente</option>
                <option value="failed">Échoués</option>
                <option value="refunded">Remboursés</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredPayments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Aucun paiement trouvé</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Profil</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div className="font-medium">{payment.user_name}</div>
                      <div className="text-sm text-muted-foreground">
                        ID: {payment.stripe_payment_id.slice(-8)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{payment.profile_name}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={payment.profile_type === 'artist' ? 'default' : 'secondary'}>
                        {payment.profile_type === 'artist' ? 'Artiste' : 'Professionnel'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatAmount(payment.amount, payment.currency)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(payment.status)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(payment.created_at)}
                      {payment.completed_at && (
                        <div className="text-muted-foreground">
                          Complété: {formatDate(payment.completed_at)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          toast({
                            title: "Détails du paiement",
                            description: `Paiement ${payment.stripe_payment_id} - ${formatAmount(payment.amount, payment.currency)}`
                          });
                        }}
                      >
                        Détails
                      </Button>
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

export default PaymentManager;
