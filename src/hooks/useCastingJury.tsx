import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { isMissingTable } from '@/lib/supabaseErrors';

export interface JuryMember {
  id: string;
  professional_profile_id: string;
  professional_profiles: { company_name: string; user_id: string } | null;
}

const onError = (error: Error) => toast({ title: 'Erreur', description: error.message, variant: 'destructive' });

/** Jury d'un casting : membres invités par le propriétaire */
export const useCastingJury = (castingId?: string) => {
  const queryClient = useQueryClient();
  const queryKey = ['casting-jury', castingId];

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: async (): Promise<{ members: JuryMember[]; unavailable: boolean }> => {
      const { data, error } = await supabase
        .from('casting_jury_members')
        .select('id, professional_profile_id, professional_profiles(company_name, user_id)')
        .eq('casting_id', castingId as string)
        .order('created_at', { ascending: true });
      if (isMissingTable(error)) return { members: [], unavailable: true };
      if (error) throw error;
      return { members: (data || []) as JuryMember[], unavailable: false };
    },
    enabled: !!castingId,
  });

  const invite = useMutation({
    mutationFn: async (professionalProfileId: string) => {
      const { error } = await supabase
        .from('casting_jury_members')
        .insert({ casting_id: castingId as string, professional_profile_id: professionalProfileId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({ title: 'Juré ajouté', description: 'Il retrouve ce casting dans « Mes jurys » de son tableau de bord.' });
    },
    onError,
  });

  const remove = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase.from('casting_jury_members').delete().eq('id', memberId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    onError,
  });

  return { members: data?.members || [], unavailable: data?.unavailable || false, isLoading, invite, remove };
};

/** Recherche de professionnels à inviter, par nom de structure */
export const useProfessionalSearch = (term: string, excludeIds: string[]) => {
  const { data } = useQuery({
    queryKey: ['professional-search', term],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('professional_profiles')
        .select('id, company_name, location, professional_role')
        .ilike('company_name', `%${term.replace(/[%_]/g, '')}%`)
        .eq('is_active', true)
        .limit(8);
      if (error) throw error;
      return data || [];
    },
    enabled: term.trim().length >= 2,
  });
  return (data || []).filter(p => !excludeIds.includes(p.id));
};

/** Castings où le professionnel connecté siège au jury */
export const useMyJuries = (professionalProfileId?: string) => {
  const { data } = useQuery({
    queryKey: ['my-juries', professionalProfileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('casting_jury_members')
        .select('id, castings(id, title, audition_date)')
        .eq('professional_profile_id', professionalProfileId as string);
      if (isMissingTable(error)) return [];
      if (error) throw error;
      return (data || []).filter(m => m.castings);
    },
    enabled: !!professionalProfileId,
  });
  return data || [];
};
