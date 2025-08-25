import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface PremiumSubscription {
  profile_type: string;
  profile_id: string;
  premium_active: boolean;
  current_period_end: string;
}

export const usePremiumVisibility = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Check premium status
  const { data: subscriptions, isLoading } = useQuery({
    queryKey: ['premium-visibility', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase.functions.invoke('check-premium-visibility');
      
      if (error) {
        console.error('Error checking premium status:', error);
        throw error;
      }
      
      return data.subscriptions as PremiumSubscription[];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Create premium subscription
  const createPremiumMutation = useMutation({
    mutationFn: async ({ profileType, profileId }: { profileType: string; profileId: string }) => {
      const { data, error } = await supabase.functions.invoke('create-premium-visibility', {
        body: { profileType, profileId }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Abonnement premium activé avec succès !');
      queryClient.invalidateQueries({ queryKey: ['premium-visibility'] });
    },
    onError: (error: any) => {
      toast.error(`Erreur lors de l'activation: ${error.message}`);
    }
  });

  // Get premium status for a specific profile
  const isPremiumActive = (profileType: string, profileId: string): boolean => {
    if (!subscriptions) return false;
    
    const subscription = subscriptions.find(
      sub => sub.profile_type === profileType && sub.profile_id === profileId
    );
    
    return subscription?.premium_active || false;
  };

  // Get premium end date for a specific profile
  const getPremiumEndDate = (profileType: string, profileId: string): Date | null => {
    if (!subscriptions) return null;
    
    const subscription = subscriptions.find(
      sub => sub.profile_type === profileType && sub.profile_id === profileId
    );
    
    return subscription?.current_period_end ? new Date(subscription.current_period_end) : null;
  };

  // Refresh premium status
  const refreshPremiumStatus = () => {
    queryClient.invalidateQueries({ queryKey: ['premium-visibility'] });
  };

  return {
    subscriptions,
    isLoading,
    createPremium: createPremiumMutation.mutate,
    isCreatingPremium: createPremiumMutation.isPending,
    isPremiumActive,
    getPremiumEndDate,
    refreshPremiumStatus
  };
};