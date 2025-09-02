
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PaymentRecord {
  id: string;
  user_id: string;
  profile_id: string;
  profile_type: 'artist' | 'professional';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  stripe_payment_id: string;
  stripe_session_id?: string;
  created_at: string;
  completed_at?: string;
  metadata?: Record<string, any>;
}

export interface UpgradeRequest {
  id: string;
  user_id: string;
  profile_id: string;
  profile_type: 'artist' | 'professional';
  status: 'pending' | 'sent' | 'paid' | 'completed' | 'cancelled';
  payment_link?: string;
  stripe_session_id?: string;
  created_at: string;
  updated_at: string;
  requested_by: string;
}

export const usePaymentManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Récupérer les paiements réels
  const { data: payments = [], isLoading: paymentsLoading } = useQuery({
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
        metadata: payment.metadata as Record<string, any>
      })) || [];

      return transformedPayments;
    }
  });

  // Récupérer les demandes d'upgrade
  const { data: upgradeRequests = [], isLoading: upgradeRequestsLoading } = useQuery({
    queryKey: ['upgrade-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('upgrade_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as UpgradeRequest[];
    }
  });

  // Créer un lien de paiement
  const createPaymentLink = useMutation({
    mutationFn: async ({ 
      upgradeRequestId, 
      planId 
    }: { 
      upgradeRequestId: string; 
      planId: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('create-subscription', {
        body: { plan_id: planId }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: async (data, variables) => {
      // Mettre à jour la demande d'upgrade avec le lien de paiement
      await supabase
        .from('upgrade_requests')
        .update({ 
          status: 'sent',
          payment_link: data.url,
          updated_at: new Date().toISOString()
        })
        .eq('id', variables.upgradeRequestId);

      queryClient.invalidateQueries({ queryKey: ['upgrade-requests'] });
      
      toast({
        title: "Lien de paiement créé",
        description: "Le lien de paiement a été généré avec succès."
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

  // Envoyer un email de rappel d'upgrade
  const sendUpgradeReminder = useMutation({
    mutationFn: async ({ 
      upgradeRequestId, 
      customMessage 
    }: { 
      upgradeRequestId: string; 
      customMessage?: string;
    }) => {
      // Cette fonction devrait utiliser une edge function pour envoyer l'email
      const { data, error } = await supabase.functions.invoke('send-upgrade-reminder', {
        body: { 
          upgrade_request_id: upgradeRequestId,
          custom_message: customMessage
        }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Rappel envoyé",
        description: "Le rappel d'upgrade a été envoyé avec succès."
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le rappel",
        variant: "destructive"
      });
      console.error('Erreur envoi rappel:', error);
    }
  });

  // Marquer un paiement comme complété
  const markPaymentCompleted = useMutation({
    mutationFn: async (paymentId: string) => {
      // Cette fonction devrait vérifier le statut du paiement via Stripe
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: { payment_id: paymentId }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
      queryClient.invalidateQueries({ queryKey: ['upgrade-requests'] });
      
      toast({
        title: "Paiement vérifié",
        description: "Le statut du paiement a été mis à jour."
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de vérifier le paiement",
        variant: "destructive"
      });
      console.error('Erreur vérification paiement:', error);
    }
  });

  // Statistiques des paiements
  const paymentStats = {
    total: payments.length,
    completed: payments.filter(p => p.status === 'completed').length,
    pending: payments.filter(p => p.status === 'pending').length,
    failed: payments.filter(p => p.status === 'failed').length,
    totalRevenue: payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0),
    conversionRate: payments.length > 0 
      ? (payments.filter(p => p.status === 'completed').length / payments.length) * 100 
      : 0
  };

  return {
    // Données
    payments,
    upgradeRequests,
    paymentStats,
    
    // États de chargement
    paymentsLoading,
    upgradeRequestsLoading,
    
    // Mutations
    createPaymentLink,
    sendUpgradeReminder,
    markPaymentCompleted,
    
    // États des mutations
    isCreatingPaymentLink: createPaymentLink.isPending,
    isSendingReminder: sendUpgradeReminder.isPending,
    isMarkingCompleted: markPaymentCompleted.isPending
  };
};
