import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface CustomCriterion {
  id: string;
  professional_profile_id: string;
  name: string;
  description?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useCustomCriteria = (professionalProfileId?: string) => {
  const queryClient = useQueryClient();

  const { data: criteria, isLoading } = useQuery({
    queryKey: ['custom-criteria', professionalProfileId],
    queryFn: async (): Promise<CustomCriterion[]> => {
      if (!professionalProfileId) return [];
      
      const { data, error } = await supabase
        .from('custom_criteria')
        .select('*')
        .eq('professional_profile_id', professionalProfileId)
        .eq('is_active', true)
        .order('display_order');
      
      if (error) throw error;
      return data as CustomCriterion[];
    },
    enabled: !!professionalProfileId
  });

  const addCriterion = useMutation({
    mutationFn: async (criterion: { name: string; description?: string }) => {
      if (!professionalProfileId) throw new Error('Professional profile ID required');
      
      const { data, error } = await supabase
        .from('custom_criteria')
        .insert({
          professional_profile_id: professionalProfileId,
          name: criterion.name,
          description: criterion.description,
          display_order: (criteria?.length || 0) + 1
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-criteria', professionalProfileId] });
      toast({
        title: "Critère ajouté",
        description: "Le nouveau critère a été créé avec succès"
      });
    }
  });

  const updateCriterion = useMutation({
    mutationFn: async (criterion: { id: string; name: string; description?: string }) => {
      const { data, error } = await supabase
        .from('custom_criteria')
        .update({
          name: criterion.name,
          description: criterion.description
        })
        .eq('id', criterion.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-criteria', professionalProfileId] });
      toast({
        title: "Critère mis à jour",
        description: "Le critère a été modifié avec succès"
      });
    }
  });

  const deleteCriterion = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('custom_criteria')
        .update({ is_active: false })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-criteria', professionalProfileId] });
      toast({
        title: "Critère supprimé",
        description: "Le critère a été supprimé avec succès"
      });
    }
  });

  return {
    criteria: criteria || [],
    isLoading,
    addCriterion,
    updateCriterion,
    deleteCriterion
  };
};