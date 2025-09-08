
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export interface LyricalWork extends Tables<'lyrical_works'> {
  work_roles?: WorkRole[];
  composers?: Tables<'composers'>;
}

export interface WorkRole extends Tables<'work_roles'> {}

export const useLyricalWorks = (searchTerm?: string) => {
  const { data: works, isLoading, error } = useQuery({
    queryKey: ['lyrical-works', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('lyrical_works')
        .select(`
          *,
          work_roles (*),
          composers (*)
        `)
        .order('title');

      if (searchTerm && searchTerm.length > 1) {
        query = query.or(`title.ilike.%${searchTerm}%,composer.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query.limit(200);

      if (error) {
        console.error('Error fetching lyrical works:', error);
        throw error;
      }

      return data as LyricalWork[];
    },
    enabled: !searchTerm || searchTerm.length > 1,
  });

  return {
    works: works || [],
    isLoading,
    error,
  };
};

export const useWorkRoles = (workId?: string) => {
  const { data: roles, isLoading, error } = useQuery({
    queryKey: ['work-roles', workId],
    queryFn: async () => {
      if (!workId) return [];

      const { data, error } = await supabase
        .from('work_roles')
        .select('*')
        .eq('work_id', workId)
        .order('role_name');

      if (error) {
        console.error('Error fetching work roles:', error);
        throw error;
      }

      return data as WorkRole[];
    },
    enabled: !!workId,
  });

  return {
    roles: roles || [],
    isLoading,
    error,
  };
};
