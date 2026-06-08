import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
const sb = supabase as any;
import { useToast } from '@/hooks/use-toast';

interface ArtistSynthesis {
  artist: {
    id: string;
    stage_name: string;
    contact_email?: string;
  } | null;
  averageScores: {
    overall: number;
  };
  isRejected: boolean;
}

interface TieBreakInfo {
  hasTie: boolean;
  tiedCandidates: ArtistSynthesis[];
  cutoffScore: number;
}

export const useContestShortlist = (contestId?: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Analyze data to find top 24 and detect ties
  const analyzeTop24 = (synthesis: ArtistSynthesis[]): {
    top24: ArtistSynthesis[];
    rejected: ArtistSynthesis[];
    tieBreak: TieBreakInfo;
  } => {
    // Filter out rejected candidates and sort by score
    const eligibleCandidates = synthesis
      .filter(s => !s.isRejected && s.averageScores.overall > 0)
      .sort((a, b) => b.averageScores.overall - a.averageScores.overall);

    if (eligibleCandidates.length <= 24) {
      return {
        top24: eligibleCandidates,
        rejected: synthesis.filter(s => s.isRejected || s.averageScores.overall <= 0),
        tieBreak: { hasTie: false, tiedCandidates: [], cutoffScore: 0 }
      };
    }

    // Get the score at position 24 (cutoff)
    const cutoffScore = eligibleCandidates[23].averageScores.overall;
    
    // Count how many candidates have exactly the cutoff score
    const atCutoff = eligibleCandidates.filter(c => c.averageScores.overall === cutoffScore);
    const aboveCutoff = eligibleCandidates.filter(c => c.averageScores.overall > cutoffScore);
    
    // Check if there's a tie at the cutoff
    const slotsRemaining = 24 - aboveCutoff.length;
    const hasTie = atCutoff.length > slotsRemaining;

    if (hasTie) {
      return {
        top24: aboveCutoff, // Only those above cutoff for now
        rejected: eligibleCandidates.filter(c => c.averageScores.overall < cutoffScore),
        tieBreak: {
          hasTie: true,
          tiedCandidates: atCutoff,
          cutoffScore
        }
      };
    }

    // No tie - take top 24
    return {
      top24: eligibleCandidates.slice(0, 24),
      rejected: eligibleCandidates.slice(24),
      tieBreak: { hasTie: false, tiedCandidates: [], cutoffScore }
    };
  };

  // Update statuses in database
  const updateStatuses = useMutation({
    mutationFn: async ({ 
      shortlistedIds, 
      rejectedIds 
    }: { 
      shortlistedIds: string[]; 
      rejectedIds: string[];
    }) => {
      if (!contestId) throw new Error('Contest ID required');

      // Update shortlisted candidates
      if (shortlistedIds.length > 0) {
        const { error: shortlistError } = await sb
          .from('contest_evaluations')
          .update({ contest_status: 'shortlisted' })
          .eq('contest_id', contestId)
          .in('artist_profile_id', shortlistedIds);

        if (shortlistError) throw shortlistError;
      }

      // Update rejected candidates
      if (rejectedIds.length > 0) {
        const { error: rejectError } = await sb
          .from('contest_evaluations')
          .update({ contest_status: 'rejected' })
          .eq('contest_id', contestId)
          .in('artist_profile_id', rejectedIds);

        if (rejectError) throw rejectError;
      }

      return { shortlistedIds, rejectedIds };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contest-synthesis', contestId] });
      queryClient.invalidateQueries({ queryKey: ['contest-evaluations', contestId] });
      toast({
        title: "Shortlist générée",
        description: "Les statuts des candidats ont été mis à jour.",
      });
    },
    onError: (error) => {
      console.error('Error updating statuses:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour les statuts.",
        variant: "destructive"
      });
    }
  });

  // Send emails to candidates
  const sendEmails = useMutation({
    mutationFn: async ({ 
      contestName, 
      recipientType, 
      artistIds 
    }: { 
      contestName: string;
      recipientType: 'shortlisted' | 'rejected';
      artistIds: string[];
    }) => {
      if (!contestId) throw new Error('Contest ID required');

      const { data, error } = await supabase.functions.invoke('send-contest-results', {
        body: {
          contestId,
          contestName,
          recipientType,
          artistIds
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      const typeLabel = variables.recipientType === 'shortlisted' ? 'félicitations' : 'rejet';
      toast({
        title: "Emails envoyés",
        description: `${data.sent} email(s) de ${typeLabel} envoyé(s).${data.failed > 0 ? ` ${data.failed} échec(s).` : ''}`,
      });
    },
    onError: (error) => {
      console.error('Error sending emails:', error);
      toast({
        title: "Erreur d'envoi",
        description: "Impossible d'envoyer les emails.",
        variant: "destructive"
      });
    }
  });

  // Manually add/remove from shortlist
  const toggleShortlistStatus = useMutation({
    mutationFn: async ({ 
      artistId, 
      newStatus 
    }: { 
      artistId: string; 
      newStatus: 'pending' | 'shortlisted' | 'rejected';
    }) => {
      if (!contestId) throw new Error('Contest ID required');

      const { error } = await sb
        .from('contest_evaluations')
        .update({ contest_status: newStatus })
        .eq('contest_id', contestId)
        .eq('artist_profile_id', artistId);

      if (error) throw error;
      return { artistId, newStatus };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contest-synthesis', contestId] });
      queryClient.invalidateQueries({ queryKey: ['contest-evaluations', contestId] });
    },
    onError: (error) => {
      console.error('Error updating status:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut.",
        variant: "destructive"
      });
    }
  });

  return {
    analyzeTop24,
    updateStatuses,
    sendEmails,
    toggleShortlistStatus
  };
};
