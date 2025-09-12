import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface CandidateScore {
  id: string;
  application_id: string;
  criteria_id: string;
  score: number;
  comments?: string;
  scored_by: string;
  created_at: string;
  updated_at: string;
}

export const useCandidateScores = (applicationId?: string) => {
  const queryClient = useQueryClient();

  const { data: scores, isLoading } = useQuery({
    queryKey: ['candidate-scores', applicationId],
    queryFn: async (): Promise<CandidateScore[]> => {
      if (!applicationId) return [];
      
      const { data, error } = await supabase
        .from('candidate_scores')
        .select('*')
        .eq('application_id', applicationId);
      
      if (error) throw error;
      return data as CandidateScore[];
    },
    enabled: !!applicationId
  });

  const upsertScore = useMutation({
    mutationFn: async (scoreData: {
      criteria_id: string;
      score: number;
      comments?: string;
    }) => {
      if (!applicationId) throw new Error('Application ID required');
      
      const { data, error } = await supabase
        .from('candidate_scores')
        .upsert({
          application_id: applicationId,
          criteria_id: scoreData.criteria_id,
          score: scoreData.score,
          comments: scoreData.comments,
          scored_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidate-scores', applicationId] });
    }
  });

  const getAverageScore = (scores: CandidateScore[]): number => {
    if (!scores || scores.length === 0) return 0;
    const total = scores.reduce((sum, score) => sum + score.score, 0);
    return Math.round((total / scores.length) * 10) / 10;
  };

  return {
    scores: scores || [],
    isLoading,
    upsertScore,
    getAverageScore,
    averageScore: getAverageScore(scores || [])
  };
};