import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Mock API interface until database tables are created
interface ApiKey {
  id: string;
  name: string;
  key_hash: string;
  is_active: boolean;
  created_at: string;
  last_used_at: string | null;
  tenant_id: string;
}

export const useCastingApi = () => {
  const queryClient = useQueryClient();

  // Mock implementation - will be replaced with real Supabase calls once tables exist
  const { data: apiKeys, isLoading } = useQuery({
    queryKey: ['casting-api-keys'],
    queryFn: async (): Promise<ApiKey[]> => {
      // Simulate API call - would be replaced with real Supabase query
      return [
        {
          id: '1',
          name: 'Production API',
          key_hash: 'sk-cast-prod-************************',
          is_active: true,
          created_at: '2024-01-10T10:00:00Z',
          last_used_at: '2024-01-15T08:30:00Z',
          tenant_id: 'tenant_1'
        },
        {
          id: '2', 
          name: 'Staging API',
          key_hash: 'sk-cast-staging-*********************',
          is_active: false,
          created_at: '2024-01-05T14:30:00Z',
          last_used_at: null,
          tenant_id: 'tenant_1'
        }
      ];
    }
  });

  const createApiKey = useMutation({
    mutationFn: async ({ name }: { name: string }) => {
      // Mock implementation - would call Supabase
      const newKey = {
        id: Date.now().toString(),
        name,
        key_hash: `sk-cast-${Math.random().toString(36).substr(2, 32)}`,
        is_active: true,
        created_at: new Date().toISOString(),
        last_used_at: null,
        tenant_id: 'tenant_1'
      };
      return newKey;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['casting-api-keys'] });
    }
  });

  const deleteApiKey = useMutation({
    mutationFn: async (keyId: string) => {
      // Mock implementation - would call Supabase
      console.log('Deleting API key:', keyId);
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
      // Mock implementation - would call Supabase
      console.log('Toggling API key:', keyId);
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