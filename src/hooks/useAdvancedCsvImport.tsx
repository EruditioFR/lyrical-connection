import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ImportOptions {
  csvData: string;
  importType: 'works' | 'composers' | 'roles' | 'arias' | 'complete';
  skipDuplicates?: boolean;
}

interface ImportResult {
  success: boolean;
  imported: {
    composers: number;
    works: number;
    roles: number;
    arias: number;
  };
  errors: string[];
  message: string;
}

export const useAdvancedCsvImport = () => {
  const { toast } = useToast();

  const importMutation = useMutation({
    mutationFn: async (options: ImportOptions): Promise<ImportResult> => {
      console.log('Starting advanced CSV import with options:', options);
      
      try {
        const { data, error } = await supabase.functions.invoke('import-csv-complete', {
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
      console.log('Import result details:', result);
      const totalImported = Object.values(result.imported).reduce((sum, count) => sum + count, 0);
      
      toast({
        title: "Import CSV terminé",
        description: `${result.message} - ${totalImported} éléments importés au total`,
        duration: 5000,
      });
    },
    onError: (error) => {
      console.error('Import error:', error);
      toast({
        title: "Erreur d'import",
        description: error.message,
        variant: "destructive",
        duration: 7000,
      });
    },
  });

  return {
    importData: importMutation.mutate,
    isImporting: importMutation.isPending,
    importResult: importMutation.data,
    importError: importMutation.error,
    reset: importMutation.reset,
  };
};