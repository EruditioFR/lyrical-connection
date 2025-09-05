import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface Invoice {
  id: string;
  user_id: string;
  stripe_invoice_id: string;
  stripe_customer_id: string;
  amount_paid: number;
  amount_due: number;
  currency: string;
  status: string;
  invoice_pdf?: string;
  hosted_invoice_url?: string;
  invoice_number?: string;
  description?: string;
  period_start?: string;
  period_end?: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
}

export const useInvoices = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch invoices from database
  const { data: invoices, isLoading, error } = useQuery({
    queryKey: ['invoices', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching invoices:', error);
        throw error;
      }
      
      return data as Invoice[];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Sync invoices from Stripe
  const syncInvoicesMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('sync-invoices');
      
      if (error) {
        console.error('Error syncing invoices:', error);
        throw error;
      }
      
      return data.invoices;
    },
    onSuccess: () => {
      toast.success('Factures synchronisées avec succès');
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
    onError: (error: any) => {
      console.error('Sync invoices error:', error);
      toast.error(`Erreur lors de la synchronisation: ${error.message}`);
    }
  });

  // Helper functions
  const formatAmount = (amount: number, currency: string = 'eur') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(dateString));
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'paid':
        return 'default';
      case 'open':
        return 'secondary';
      case 'draft':
        return 'outline';
      case 'void':
      case 'uncollectible':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Payée';
      case 'open':
        return 'En attente';
      case 'draft':
        return 'Brouillon';
      case 'void':
        return 'Annulée';
      case 'uncollectible':
        return 'Irrécupérable';
      default:
        return status;
    }
  };

  const refreshInvoices = () => {
    queryClient.invalidateQueries({ queryKey: ['invoices'] });
  };

  return {
    invoices: invoices || [],
    isLoading,
    error,
    syncInvoices: syncInvoicesMutation.mutate,
    isSyncing: syncInvoicesMutation.isPending,
    formatAmount,
    formatDate,
    getStatusBadgeVariant,
    getStatusText,
    refreshInvoices,
    // Statistics
    totalPaid: invoices?.reduce((sum, inv) => inv.status === 'paid' ? sum + inv.amount_paid : sum, 0) || 0,
    totalDue: invoices?.reduce((sum, inv) => inv.status === 'open' ? sum + inv.amount_due : sum, 0) || 0,
    invoiceCount: invoices?.length || 0,
  };
};