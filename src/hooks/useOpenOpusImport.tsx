import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ImportOptions {
  searchQuery?: string;
  importMode: 'composers' | 'works' | 'all';
}

interface ImportResult {
  success: boolean;
  imported: number;
  errors: string[];
  message: string;
}

export const useOpenOpusImport = () => {
  const { toast } = useToast();

  const importMutation = useMutation({
    mutationFn: async (options: ImportOptions): Promise<ImportResult> => {
      console.log('Starting OpenOpus import with options:', options);
      
      try {
        const { data, error } = await supabase.functions.invoke('import-openopus-data', {
          body: options,
        });

        console.log('Supabase function response:', { data, error });

        if (error) {
          console.error('Supabase function error:', error);
          throw new Error(error.message);
        }

        console.log('Import successful, result:', data);
        return data;
      } catch (err) {
        console.error('Import mutation error:', err);
        throw err;
      }
    },
    onSuccess: (result) => {
      toast({
        title: "Import OpenOpus terminé",
        description: result.message,
      });
    },
    onError: (error) => {
      console.error('Import error:', error);
      toast({
        title: "Erreur d'import",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    importData: importMutation.mutate,
    isImporting: importMutation.isPending,
    importResult: importMutation.data,
    importError: importMutation.error,
  };
};