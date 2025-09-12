import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ScoringCriterion {
  id: string;
  criteria_name: string;
  weight: number;
  scoring_method: 'linear' | 'exponential' | 'threshold';
  min_value?: number;
  max_value?: number;
  settings: Record<string, any>;
  is_active: boolean;
}

export const useScoringCriteria = () => {
  const queryClient = useQueryClient();

  const { data: criteria, isLoading } = useQuery({
    queryKey: ['scoring-criteria'],
    queryFn: async (): Promise<ScoringCriterion[]> => {
      const { data, error } = await supabase
        .from('tenant_scoring_criteria')
        .select('*')
        .eq('is_active', true)
        .order('criteria_name');
      
      if (error) throw error;
      return data as ScoringCriterion[];
    }
  });

  const updateCriteria = useMutation({
    mutationFn: async (newCriteria: ScoringCriterion[]) => {
      // Delete existing criteria and insert new ones in a transaction
      const { error: deleteError } = await supabase
        .from('tenant_scoring_criteria')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all existing
      
      if (deleteError) throw deleteError;
      
      const { data, error: insertError } = await supabase
        .from('tenant_scoring_criteria')
        .insert(
          newCriteria.map(criterion => ({
            criteria_name: criterion.criteria_name,
            weight: criterion.weight,
            scoring_method: criterion.scoring_method,
            min_value: criterion.min_value,
            max_value: criterion.max_value,
            settings: criterion.settings || {},
            is_active: true
          }))
        );
      
      if (insertError) throw insertError;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scoring-criteria'] });
    }
  });

  const resetToDefaults = useMutation({
    mutationFn: async () => {
      const defaultCriteria = [
        { criteria_name: 'vocalRange', weight: 0.25, scoring_method: 'linear' as const },
        { criteria_name: 'experience', weight: 0.20, scoring_method: 'exponential' as const },
        { criteria_name: 'availability', weight: 0.20, scoring_method: 'threshold' as const },
        { criteria_name: 'locationProximity', weight: 0.20, scoring_method: 'linear' as const },
        { criteria_name: 'repertoire', weight: 0.15, scoring_method: 'linear' as const }
      ];
      
      // Delete existing and insert defaults
      const { error: deleteError } = await supabase
        .from('tenant_scoring_criteria')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (deleteError) throw deleteError;
      
      const { data, error: insertError } = await supabase
        .from('tenant_scoring_criteria')
        .insert(
          defaultCriteria.map(criterion => ({
            ...criterion,
            settings: {},
            is_active: true
          }))
        );
      
      if (insertError) throw insertError;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scoring-criteria'] });
      toast({
        title: "Critères réinitialisés",
        description: "Les critères ont été remis aux valeurs par défaut"
      });
    }
  });

  return {
    criteria: criteria || [],
    isLoading,
    updateCriteria,
    resetToDefaults
  };
};