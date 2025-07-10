import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface VerificationRequest {
  id: string;
  user_id: string;
  profile_id: string;
  profile_type: string;
  status: string | null;
  documents: Record<string, any> | null;
  notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export const useVerificationRequests = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['verification-requests', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('verification_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as VerificationRequest[];
    },
    enabled: !!user
  });
};

export const useCreateVerificationRequest = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      profileId,
      profileType,
      documents,
      notes
    }: {
      profileId: string;
      profileType: string;
      documents?: Record<string, any>;
      notes?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('verification_requests')
        .insert({
          user_id: user.id,
          profile_id: profileId,
          profile_type: profileType,
          documents: documents || {},
          notes,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verification-requests'] });
      toast({
        title: "Demande de vérification envoyée",
        description: "Votre demande de vérification a été soumise avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de soumettre la demande de vérification",
        variant: "destructive",
      });
    }
  });
};

// Admin hooks for managing verification requests
export const useAllVerificationRequests = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['all-verification-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('verification_requests')
        .select(`
          *,
          user_profiles:artist_profiles!verification_requests_profile_id_fkey(stage_name, contact_email),
          professional_profiles!verification_requests_profile_id_fkey(company_name, contact_email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as VerificationRequest[];
    },
    enabled: !!user // TODO: Add admin role check
  });
};

export const useUpdateVerificationRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      requestId,
      status,
      notes,
      reviewedBy
    }: {
      requestId: string;
      status: 'approved' | 'rejected' | 'pending';
      notes?: string;
      reviewedBy: string;
    }) => {
      const { data, error } = await supabase
        .from('verification_requests')
        .update({
          status,
          notes,
          reviewed_by: reviewedBy,
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .select()
        .single();

      if (error) throw error;

      // If approved, update the profile verification status
      if (status === 'approved') {
        const request = data as VerificationRequest;
        
        if (request.profile_type === 'professional') {
          await supabase
            .from('professional_profiles')
            .update({ is_verified: true })
            .eq('id', request.profile_id);
        }
        // Add artist verification if needed in the future
      }

      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['all-verification-requests'] });
      queryClient.invalidateQueries({ queryKey: ['verification-requests'] });
      
      toast({
        title: "Demande mise à jour",
        description: variables.status === 'approved' 
          ? "La demande a été approuvée" 
          : variables.status === 'rejected'
          ? "La demande a été rejetée"
          : "La demande a été mise à jour",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la demande",
        variant: "destructive",
      });
    }
  });
};