
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  stripe_price_id: string;
  features: string[];
  limitations: Record<string, any>;
  trial_days: number;
  is_active: boolean;
  display_order: number;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  trial_end: string;
  canceled_at: string;
  plan?: SubscriptionPlan;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch subscription plans
  const { data: plans = [], isLoading: plansLoading } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      
      if (error) throw error;
      return data as SubscriptionPlan[];
    }
  });

  // Fetch current user subscription
  const { data: subscription, isLoading: subscriptionLoading } = useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      console.log('Fetching subscription for user:', user.id);
      
      // First, get the latest subscription (active or not)
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (subscriptionError) {
        if (subscriptionError.code === 'PGRST116') {
          // No subscription found
          console.log('No active subscription found');
          return null;
        }
        console.error('Subscription error:', subscriptionError);
        throw subscriptionError;
      }

      // If we have a subscription and plan_id, fetch the plan details
      if (subscriptionData && subscriptionData.plan_id) {
        const { data: planData, error: planError } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('id', subscriptionData.plan_id)
          .single();
        
        if (planError) {
          console.error('Plan error:', planError);
          // Return subscription without plan details if plan fetch fails
          return subscriptionData as Subscription;
        }

        // Combine subscription with plan data
        return {
          ...subscriptionData,
          plan: planData
        } as Subscription;
      }

      return subscriptionData as Subscription;
    },
    enabled: !!user?.id
  });

  // Create Stripe checkout session
  const createCheckoutSession = useMutation({
    mutationFn: async (planId: string) => {
      console.log('=== CREATE CHECKOUT SESSION ===');
      console.log('Plan ID received:', planId);
      console.log('User authenticated:', !!user);
      
      const { data, error } = await supabase.functions.invoke('create-subscription', {
        body: { plan_id: planId }
      });
      
      console.log('Supabase function response:', { data, error });
      
      if (error) {
        console.error('Function invocation error:', error);
        throw error;
      }
      return data;
    },
    onSuccess: (data) => {
      console.log('=== CHECKOUT SUCCESS ===');
      console.log('Response data:', data);
      if (data.url) {
        console.log('Opening checkout URL:', data.url);
        window.open(data.url, '_blank');
      } else {
        console.error('No URL in response data');
      }
    },
    onError: (error) => {
      console.error('=== CHECKOUT ERROR ===');
      console.error('Full error:', error);
      toast.error('Erreur lors de la création de la session de paiement');
    }
  });

  // Manage subscription (Customer Portal)
  const manageSubscription = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.url) {
        window.open(data.url, '_blank');
      }
    },
    onError: (error) => {
      toast.error('Erreur lors de l\'accès au portail client');
      console.error('Portal error:', error);
    }
  });

  // Check subscription status
  const checkSubscriptionStatus = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      toast.success('Statut d\'abonnement mis à jour');
    },
    onError: (error) => {
      toast.error('Erreur lors de la vérification de l\'abonnement');
      console.error('Check subscription error:', error);
    }
  });

  // Helper function to check if user has access to a feature
  const hasAccess = (feature: string): boolean => {
    if (!subscription || !subscription.plan) return false;
    
    const limitations = subscription.plan.limitations;
    
    switch (feature) {
      case 'premium_features':
        return limitations.premium_features === true;
      case 'unlimited_castings':
        return limitations.castings_per_month >= 50;
      case 'advanced_analytics':
        return subscription.plan.name !== 'Gratuit';
      default:
        return true;
    }
  };

  // Get usage limits
  const getLimit = (limitType: string): number => {
    if (!subscription || !subscription.plan) return 0;
    return subscription.plan.limitations[limitType] || 0;
  };

  return {
    plans,
    plansLoading,
    subscription,
    subscriptionLoading,
    createCheckoutSession,
    manageSubscription,
    checkSubscriptionStatus,
    hasAccess,
    getLimit,
    isSubscribed: !!subscription && subscription.status === 'active'
  };
};
