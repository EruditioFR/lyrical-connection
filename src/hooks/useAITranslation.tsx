
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAITranslation = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      keyId, 
      languageCode, 
      frenchText, 
      context 
    }: {
      keyId: string;
      languageCode: string;
      frenchText: string;
      context?: string;
    }) => {
      console.log('Starting AI translation:', { keyId, languageCode, frenchText });

      const { data, error } = await supabase.functions.invoke('ai-translate', {
        body: {
          keyId,
          languageCode,
          frenchText,
          context
        }
      });

      if (error) {
        console.error('Translation error:', error);
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Translation failed');
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['translation-suggestions'] });
      toast({
        title: "Traduction générée",
        description: `Traduction créée avec un niveau de confiance de ${Math.round(data.confidence * 100)}%`,
      });
    },
    onError: (error: any) => {
      console.error('AI Translation error:', error);
      toast({
        title: "Erreur de traduction",
        description: error.message || "Impossible de générer la traduction automatique",
        variant: "destructive",
      });
    },
  });
};
