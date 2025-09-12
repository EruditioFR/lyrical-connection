import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

interface ScoringCriterion {
  name: string;
  weight: number;
  method: 'linear' | 'exponential' | 'threshold';
  minValue?: number;
  maxValue?: number;
}

export const useScoringCriteria = () => {
  const queryClient = useQueryClient();

  // Mock implementation - would be replaced with real Supabase calls
  const { data: criteria, isLoading } = useQuery({
    queryKey: ['scoring-criteria'],
    queryFn: async () => {
      // Simulate API call
      return [
        { name: 'vocalRange', weight: 0.25, method: 'linear' as const },
        { name: 'experience', weight: 0.20, method: 'exponential' as const },
        { name: 'availability', weight: 0.20, method: 'threshold' as const },
        { name: 'locationProximity', weight: 0.20, method: 'linear' as const },
        { name: 'repertoire', weight: 0.15, method: 'linear' as const }
      ];
    }
  });

  const updateCriteria = useMutation({
    mutationFn: async (newCriteria: ScoringCriterion[]) => {
      // Mock implementation - would save to database
      console.log('Saving criteria:', newCriteria);
      return newCriteria;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scoring-criteria'] });
    }
  });

  const resetToDefaults = useMutation({
    mutationFn: async () => {
      // Mock implementation - would reset to default criteria
      return [
        { name: 'vocalRange', weight: 0.25, method: 'linear' as const },
        { name: 'experience', weight: 0.20, method: 'exponential' as const },
        { name: 'availability', weight: 0.20, method: 'threshold' as const },
        { name: 'locationProximity', weight: 0.20, method: 'linear' as const },
        { name: 'repertoire', weight: 0.15, method: 'linear' as const }
      ];
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