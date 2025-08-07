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
      const { data, error } = await supabase.functions.invoke('import-openopus-data', {
        body: options,
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
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