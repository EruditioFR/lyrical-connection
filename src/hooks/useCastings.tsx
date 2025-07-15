
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type Casting = Tables<'castings'>;
type CastingInsert = TablesInsert<'castings'>;
type CastingUpdate = TablesUpdate<'castings'>;

interface CastingFilters {
  location?: string;
  production_type?: string;
  voice_types?: string[];
  experience_level?: string[];
  compensation_type?: string;
  search?: string;
}

export const useCastings = (filters?: CastingFilters) => {
  const [castings, setCastings] = useState<Casting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const { data, isLoading: queryLoading, error } = useQuery({
    queryKey: ['castings', filters],
    queryFn: async () => {
      let query = supabase
        .from('castings')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (filters?.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }

      if (filters?.production_type) {
        query = query.eq('production_type', filters.production_type);
      }

      if (filters?.voice_types && filters.voice_types.length > 0) {
        query = query.overlaps('required_voice_types', filters.voice_types);
      }

      if (filters?.experience_level && filters.experience_level.length > 0) {
        query = query.overlaps('required_experience_level', filters.experience_level);
      }

      if (filters?.compensation_type) {
        query = query.eq('compensation_type', filters.compensation_type);
      }

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching castings:', error);
        throw error;
      }

      return data || [];
    },
  });

  useEffect(() => {
    if (data) {
      setCastings(data);
    }
    setIsLoading(queryLoading);
  }, [data, queryLoading]);

  if (error) {
    console.error('Castings query error:', error);
  }

  return {
    castings,
    isLoading,
    error,
  };
};

export const useCasting = (id: string) => {
  const { toast } = useToast();

  const { data: casting, isLoading, error } = useQuery({
    queryKey: ['casting', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('castings')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching casting:', error);
        throw error;
      }

      // Incrémenter le compteur de vues
      await supabase.rpc('increment_casting_views', { casting_id: id });

      return data;
    },
    enabled: !!id,
  });

  return {
    casting,
    isLoading,
    error,
  };
};

export const useCreateCasting = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (castingData: Omit<CastingInsert, 'professional_profile_id'>) => {
      // Récupérer le profil professionnel de l'utilisateur connecté
      const { data: profile } = await supabase
        .from('professional_profiles')
        .select('id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!profile) {
        throw new Error('Profil professionnel requis');
      }

      const { data, error } = await supabase
        .from('castings')
        .insert({
          ...castingData,
          professional_profile_id: profile.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating casting:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['castings'] });
      queryClient.invalidateQueries({ queryKey: ['my-castings'] });
      queryClient.invalidateQueries({ queryKey: ['casting'] });
      toast({
        title: "Casting créé",
        description: "Votre casting a été publié avec succès.",
      });
    },
    onError: (error) => {
      console.error('Create casting error:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le casting. Veuillez réessayer.",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateCasting = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: CastingUpdate }) => {
      const { data, error } = await supabase
        .from('castings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating casting:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['castings'] });
      queryClient.invalidateQueries({ queryKey: ['casting'] });
      queryClient.invalidateQueries({ queryKey: ['my-castings'] });
      toast({
        title: "Casting mis à jour",
        description: "Les modifications ont été sauvegardées.",
      });
    },
    onError: (error) => {
      console.error('Update casting error:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le casting.",
        variant: "destructive",
      });
    },
  });
};

// Hook pour récupérer uniquement les castings du professionnel connecté
export const useMyCastings = () => {
  const { toast } = useToast();

  const { data: castings = [], isLoading, error } = useQuery({
    queryKey: ['my-castings'],
    queryFn: async () => {
      // Récupérer le profil professionnel de l'utilisateur connecté
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      const { data: profile } = await supabase
        .from('professional_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) {
        throw new Error('Profil professionnel requis');
      }

      const { data, error } = await supabase
        .from('castings')
        .select('*')
        .eq('professional_profile_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching my castings:', error);
        throw error;
      }

      return data || [];
    },
  });

  return {
    castings,
    isLoading,
    error,
  };
};

// Hook pour publier les résultats d'un casting
export const usePublishCastingResults = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (castingId: string) => {
      const { data, error } = await supabase
        .from('castings')
        .update({ results_published: true })
        .eq('id', castingId)
        .select()
        .single();

      if (error) {
        console.error('Error publishing casting results:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['castings'] });
      queryClient.invalidateQueries({ queryKey: ['my-castings'] });
      queryClient.invalidateQueries({ queryKey: ['casting'] });
      queryClient.invalidateQueries({ queryKey: ['casting-applications'] });
      toast({
        title: "Résultats publiés",
        description: "Les candidats peuvent maintenant consulter les résultats.",
      });
    },
    onError: (error) => {
      console.error('Publish results error:', error);
      toast({
        title: "Erreur",
        description: "Impossible de publier les résultats.",
        variant: "destructive",
      });
    },
  });
};
