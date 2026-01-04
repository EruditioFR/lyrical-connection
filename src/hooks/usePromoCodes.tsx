import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

interface RedemptionResult {
  success: boolean;
  subscription?: {
    plan: string;
    months: number;
    valid_until: string;
  };
  badges?: string[];
  campaign?: string;
  message?: string;
  error?: string;
}

interface ArtistBadge {
  id: string;
  artist_profile_id: string;
  badge_type: string;
  badge_name: string;
  badge_icon: string;
  awarded_at: string;
  expires_at: string | null;
  awarded_by: string;
  is_active: boolean;
}

export const usePromoCodes = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isRedeeming, setIsRedeeming] = useState(false);

  const redeemCode = async (code: string): Promise<RedemptionResult> => {
    if (!user) {
      return { success: false, error: 'Vous devez être connecté pour utiliser un code promo' };
    }

    setIsRedeeming(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('redeem-promo-code', {
        body: { code: code.trim().toUpperCase() }
      });

      if (error) {
        console.error('Error redeeming code:', error);
        return { 
          success: false, 
          error: error.message || 'Erreur lors de la validation du code' 
        };
      }

      if (!data.success) {
        return { success: false, error: data.error || 'Code invalide' };
      }

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['artistProfile'] });
      queryClient.invalidateQueries({ queryKey: ['artistBadges'] });
      queryClient.invalidateQueries({ queryKey: ['subscription'] });

      toast.success(data.message || 'Code promo activé avec succès !');
      
      return data as RedemptionResult;
    } catch (err) {
      console.error('Unexpected error:', err);
      return { success: false, error: 'Erreur inattendue. Veuillez réessayer.' };
    } finally {
      setIsRedeeming(false);
    }
  };

  return {
    redeemCode,
    isRedeeming
  };
};

export const useArtistBadges = (artistProfileId: string | undefined) => {
  return useQuery({
    queryKey: ['artistBadges', artistProfileId],
    queryFn: async (): Promise<ArtistBadge[]> => {
      if (!artistProfileId) return [];

      const { data, error } = await supabase
        .from('artist_badges')
        .select('*')
        .eq('artist_profile_id', artistProfileId)
        .eq('is_active', true)
        .order('awarded_at', { ascending: false });

      if (error) {
        console.error('Error fetching badges:', error);
        return [];
      }

      return (data || []) as ArtistBadge[];
    },
    enabled: !!artistProfileId
  });
};
