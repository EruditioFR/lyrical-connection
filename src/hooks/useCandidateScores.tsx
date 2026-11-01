import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { isMissingConflictTarget } from '@/lib/supabaseErrors';
import { useAuth } from '@/hooks/useAuth';

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

export interface ScoreRow {
  application_id: string;
  criteria_id: string;
  score: number;
  comments?: string | null;
  scored_by: string;
}

/** Enregistre (ou remplace) la note d'un juré sur un critère */
export const saveCandidateScore = async (row: ScoreRow) => {
  // Une note par critère et par juré ; sans onConflict, re-noter créait un doublon refusé
  let { data, error } = await supabase
    .from('candidate_scores')
    .upsert(row, { onConflict: 'application_id,criteria_id,scored_by' })
    .select()
    .single();
  if (isMissingConflictTarget(error)) {
    // Base pas encore migrée : contrainte unique (candidature, critère)
    ({ data, error } = await supabase
      .from('candidate_scores')
      .upsert(row, { onConflict: 'application_id,criteria_id' })
      .select()
      .single());
  }
  if (error) throw error;
  return data;
};

export const useCandidateScores = (applicationId?: string) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

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
      
      return saveCandidateScore({
        application_id: applicationId,
        criteria_id: scoreData.criteria_id,
        score: scoreData.score,
        comments: scoreData.comments,
        scored_by: (await supabase.auth.getUser()).data.user?.id as string
      });
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

  // Référence stable : CandidateScoring s'en sert comme dépendance d'effet
  const myScores = useMemo(() => (scores || []).filter(s => s.scored_by === user?.id), [scores, user?.id]);

  return {
    // Toutes les notes visibles (le propriétaire du casting voit celles de chaque juré)
    scores: scores || [],
    // Les notes de l'utilisateur connecté, pour pré-remplir sa grille
    myScores,
    isLoading,
    upsertScore,
    getAverageScore,
    averageScore: getAverageScore(scores || [])
  };
};