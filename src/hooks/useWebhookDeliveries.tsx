import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

interface WebhookDelivery {
  id: string;
  endpoint_url: string;
  event_type: string;
  status: 'success' | 'failed' | 'pending';
  response_code: number | null;
  attempts: number;
  created_at: string;
  next_retry_at: string | null;
  payload: any;
}

export const useWebhookDeliveries = () => {
  const queryClient = useQueryClient();

  // Mock implementation - would be replaced with real Supabase calls
  const { data: deliveries, isLoading } = useQuery({
    queryKey: ['webhook-deliveries'],
    queryFn: async (): Promise<WebhookDelivery[]> => {
      // Simulate API call
      return [
        {
          id: '1',
          endpoint_url: 'https://api.example.com/webhooks/casting',
          event_type: 'casting.scored',
          status: 'success',
          response_code: 200,
          attempts: 1,
          created_at: '2024-01-15T10:30:00Z',
          next_retry_at: null,
          payload: { casting_id: 'cast_123', total_score: 8.5 }
        },
        {
          id: '2',
          endpoint_url: 'https://staging.company.com/api/webhooks',
          event_type: 'applicant.assigned',
          status: 'failed',
          response_code: 500,
          attempts: 3,
          created_at: '2024-01-15T09:15:00Z',
          next_retry_at: '2024-01-15T11:00:00Z',
          payload: { applicant_id: 'app_456', role_id: 'role_789' }
        }
      ];
    }
  });

  const retryDelivery = useMutation({
    mutationFn: async (deliveryId: string) => {
      // Mock implementation - would trigger webhook retry
      console.log('Retrying delivery:', deliveryId);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhook-deliveries'] });
      toast({
        title: "Webhook relancé",
        description: "La livraison du webhook a été relancée"
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de relancer le webhook",
        variant: "destructive"
      });
    }
  });

  return {
    deliveries: deliveries || [],
    isLoading,
    retryDelivery
  };
};