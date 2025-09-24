import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ArtistEvaluation {
  id: string;
  professional_profile_id: string;
  artist_profile_id: string;
  vocal_quality?: number;
  vocal_technique?: number;
  stage_presence?: number;
  language_mastery?: number;
  pitch_accuracy?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface EvaluationCriteria {
  vocal_quality?: number;
  vocal_technique?: number;
  stage_presence?: number;
  language_mastery?: number;
  pitch_accuracy?: number;
  notes?: string;
}

export const useArtistEvaluations = (professionalProfileId?: string) => {
  const queryClient = useQueryClient();

  const { data: evaluations, isLoading } = useQuery({
    queryKey: ['artist-evaluations', professionalProfileId],
    queryFn: async (): Promise<ArtistEvaluation[]> => {
      if (!professionalProfileId) return [];
      
      const { data, error } = await supabase
        .from('artist_evaluations')
        .select('*')
        .eq('professional_profile_id', professionalProfileId);
      
      if (error) throw error;
      return data as ArtistEvaluation[];
    },
    enabled: !!professionalProfileId
  });

  const getEvaluation = (artistProfileId: string) => {
    return evaluations?.find(e => e.artist_profile_id === artistProfileId);
  };

  const upsertEvaluation = useMutation({
    mutationFn: async (data: {
      artistProfileId: string;
      criteria: EvaluationCriteria;
    }) => {
      if (!professionalProfileId) throw new Error('Professional profile ID required');
      
      const { data: result, error } = await supabase
        .from('artist_evaluations')
        .upsert({
          professional_profile_id: professionalProfileId,
          artist_profile_id: data.artistProfileId,
          ...data.criteria
        })
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artist-evaluations', professionalProfileId] });
      toast({
        title: "Évaluation sauvegardée",
        description: "L'évaluation de l'artiste a été mise à jour avec succès"
      });
    }
  });

  const deleteEvaluation = useMutation({
    mutationFn: async (artistProfileId: string) => {
      const { error } = await supabase
        .from('artist_evaluations')
        .delete()
        .eq('professional_profile_id', professionalProfileId)
        .eq('artist_profile_id', artistProfileId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artist-evaluations', professionalProfileId] });
      toast({
        title: "Évaluation supprimée",
        description: "L'évaluation a été supprimée avec succès"
      });
    }
  });

  return {
    evaluations: evaluations || [],
    isLoading,
    getEvaluation,
    upsertEvaluation,
    deleteEvaluation
  };
};