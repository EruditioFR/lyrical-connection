import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
const sb = supabase as any;
import { useToast } from '@/hooks/use-toast';

export interface ContestEvaluation {
  id: string;
  contest_id: string;
  artist_profile_id: string;
  evaluator_id: string;
  vocal_quality: number | null;
  vocal_technique: number | null;
  stage_presence: number | null;
  language_mastery: number | null;
  pitch_accuracy: number | null;
  average_score: number | null;
  is_rejected: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface EvaluationInput {
  vocal_quality?: number | null;
  vocal_technique?: number | null;
  stage_presence?: number | null;
  language_mastery?: number | null;
  pitch_accuracy?: number | null;
  is_rejected?: boolean;
  notes?: string | null;
}

// Calculate average from scores
const calculateAverage = (scores: EvaluationInput): number | null => {
  const values = [
    scores.vocal_quality,
    scores.vocal_technique,
    scores.stage_presence,
    scores.language_mastery,
    scores.pitch_accuracy
  ].filter((v): v is number => v !== null && v !== undefined);

  if (values.length === 0) return null;
  const sum = values.reduce((a, b) => a + b, 0);
  return Math.round((sum / values.length) * 10) / 10;
};

export const useContestEvaluations = (contestId?: string, evaluatorId?: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch evaluations for a specific contest
  const { data: evaluations, isLoading } = useQuery({
    queryKey: ['contest-evaluations', contestId],
    queryFn: async (): Promise<ContestEvaluation[]> => {
      if (!contestId) return [];

      const { data, error } = await sb
        .from('contest_evaluations')
        .select('*')
        .eq('contest_id', contestId);

      if (error) throw error;
      return data as ContestEvaluation[];
    },
    enabled: !!contestId
  });

  // Get a specific evaluation by artist
  const getEvaluationForArtist = (artistProfileId: string) => {
    return evaluations?.find(
      e => e.artist_profile_id === artistProfileId && e.evaluator_id === evaluatorId
    );
  };

  // Upsert evaluation
  const upsertEvaluation = useMutation({
    mutationFn: async ({
      artistProfileId,
      data
    }: {
      artistProfileId: string;
      data: EvaluationInput;
    }) => {
      if (!contestId || !evaluatorId) {
        throw new Error('Contest ID and Evaluator ID required');
      }

      const average_score = data.is_rejected ? null : calculateAverage(data);

      const { data: result, error } = await sb
        .from('contest_evaluations')
        .upsert({
          contest_id: contestId,
          artist_profile_id: artistProfileId,
          evaluator_id: evaluatorId,
          vocal_quality: data.vocal_quality ?? null,
          vocal_technique: data.vocal_technique ?? null,
          stage_presence: data.stage_presence ?? null,
          language_mastery: data.language_mastery ?? null,
          pitch_accuracy: data.pitch_accuracy ?? null,
          is_rejected: data.is_rejected ?? false,
          notes: data.notes ?? null,
          average_score
        }, {
          onConflict: 'contest_id,artist_profile_id,evaluator_id'
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contest-evaluations', contestId] });
    },
    onError: (error) => {
      console.error('Error saving evaluation:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder l'évaluation.",
        variant: "destructive"
      });
    }
  });

  return {
    evaluations: evaluations || [],
    isLoading,
    getEvaluationForArtist,
    upsertEvaluation,
    calculateAverage
  };
};

// Hook for synthesis view - get all evaluations with artist data
export const useContestSynthesis = (contestId?: string) => {
  const { data, isLoading } = useQuery({
    queryKey: ['contest-synthesis', contestId],
    queryFn: async () => {
      if (!contestId) return [];

      // Fetch all evaluations for this contest with artist profiles
      const { data: evaluations, error: evalError } = await sb
        .from('contest_evaluations')
        .select(`
          *,
          artist_profiles:artist_profile_id (
            id,
            stage_name,
            birth_date,
            nationality,
            spoken_languages,
            voice_type,
            profile_image_url
          ),
          evaluator:evaluator_id (
            id,
            company_name
          )
        `)
        .eq('contest_id', contestId);

      if (evalError) throw evalError;

      // Group by artist and calculate aggregate scores
      const artistMap = new Map<string, {
        artist: any;
        evaluations: any[];
        averageScores: {
          vocal_quality: number;
          vocal_technique: number;
          stage_presence: number;
          language_mastery: number;
          pitch_accuracy: number;
          overall: number;
        };
        isRejected: boolean;
        juryCount: number;
      }>();

      for (const evaluation of evaluations || []) {
        const artistId = evaluation.artist_profile_id;
        
        if (!artistMap.has(artistId)) {
          artistMap.set(artistId, {
            artist: evaluation.artist_profiles,
            evaluations: [],
            averageScores: {
              vocal_quality: 0,
              vocal_technique: 0,
              stage_presence: 0,
              language_mastery: 0,
              pitch_accuracy: 0,
              overall: 0
            },
            isRejected: false,
            juryCount: 0
          });
        }

        const entry = artistMap.get(artistId)!;
        entry.evaluations.push(evaluation);
        if (evaluation.is_rejected) {
          entry.isRejected = true;
        }
      }

      // Calculate averages across all juries
      for (const [, entry] of artistMap) {
        const nonRejectedEvals = entry.evaluations.filter(e => !e.is_rejected);
        entry.juryCount = nonRejectedEvals.length;

        if (nonRejectedEvals.length > 0) {
          const criteria = ['vocal_quality', 'vocal_technique', 'stage_presence', 'language_mastery', 'pitch_accuracy'] as const;
          
          for (const criterion of criteria) {
            const values = nonRejectedEvals
              .map(e => e[criterion])
              .filter((v): v is number => v !== null);
            
            if (values.length > 0) {
              entry.averageScores[criterion] = Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
            }
          }

          // Calculate overall average
          const overallValues = Object.values(entry.averageScores).filter(v => v > 0);
          if (overallValues.length > 0) {
            entry.averageScores.overall = Math.round((overallValues.reduce((a, b) => a + b, 0) / overallValues.length) * 10) / 10;
          }
        }
      }

      return Array.from(artistMap.values());
    },
    enabled: !!contestId
  });

  return {
    synthesis: data || [],
    isLoading
  };
};
