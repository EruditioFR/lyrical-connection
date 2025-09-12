import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ApiKey {
  id: string;
  name: string;
  key_hash: string;
  key_prefix: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_used_at: string | null;
  expires_at: string | null;
  tenant_id: string | null;
  user_id: string;
}

export const useCastingApi = () => {
  const queryClient = useQueryClient();

  const { data: apiKeys, isLoading } = useQuery({
    queryKey: ['casting-api-keys'],
    queryFn: async (): Promise<ApiKey[]> => {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ApiKey[];
    }
  });

  const createApiKey = useMutation({
    mutationFn: async ({ name }: { name: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Generate secure API key
      const keyPrefix = 'sk-cast-';
      const randomPart = Math.random().toString(36).substr(2, 32);
      const keyHash = keyPrefix + randomPart;

      const { data, error } = await supabase
        .from('api_keys')
        .insert([{ 
          name,
          key_hash: keyHash,
          key_prefix: keyPrefix,
          user_id: user.id,
          is_active: true
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['casting-api-keys'] });
    }
  });

  const deleteApiKey = useMutation({
    mutationFn: async (keyId: string) => {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', keyId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['casting-api-keys'] });
      toast({
        title: "Clé supprimée",
        description: "La clé API a été supprimée avec succès"
      });
    }
  });

  const toggleApiKey = useMutation({
    mutationFn: async (keyId: string) => {
      const { data: currentKey, error: fetchError } = await supabase
        .from('api_keys')
        .select('is_active')
        .eq('id', keyId)
        .single();
      
      if (fetchError) throw fetchError;
      
      const { error } = await supabase
        .from('api_keys')
        .update({ is_active: !currentKey.is_active })
        .eq('id', keyId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['casting-api-keys'] });
      toast({
        title: "Statut mis à jour",
        description: "Le statut de la clé API a été modifié"
      });
    }
  });

  return {
    apiKeys: apiKeys || [],
    isLoading,
    createApiKey,
    deleteApiKey,
    toggleApiKey
  };
};