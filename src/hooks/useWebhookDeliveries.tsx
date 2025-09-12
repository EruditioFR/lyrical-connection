import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface WebhookDelivery {
  id: string;
  endpoint_id: string;
  event_type: string;
  status: 'success' | 'failed' | 'pending';
  response_code: number | null;
  attempts: number;
  created_at: string;
  delivered_at: string | null;
  next_retry_at: string | null;
  payload: any;
  error_message: string | null;
  webhook_endpoint?: {
    url: string;
  };
}

export const useWebhookDeliveries = () => {
  const queryClient = useQueryClient();

  const { data: deliveries, isLoading } = useQuery({
    queryKey: ['webhook-deliveries'],
    queryFn: async (): Promise<WebhookDelivery[]> => {
      const { data, error } = await supabase
        .from('webhook_deliveries')
        .select(`
          *,
          webhook_endpoint:webhook_endpoints(url)
        `)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as WebhookDelivery[];
    }
  });

  const retryDelivery = useMutation({
    mutationFn: async (deliveryId: string) => {
      // Reset the delivery status and schedule for retry
      const { data, error } = await supabase
        .from('webhook_deliveries')
        .update({ 
          status: 'pending',
          next_retry_at: new Date().toISOString(),
          attempts: 0
        })
        .eq('id', deliveryId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
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