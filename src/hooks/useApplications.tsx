import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type Application = Tables<'applications'>;
type ApplicationInsert = TablesInsert<'applications'>;
type ApplicationUpdate = TablesUpdate<'applications'>;

// Application avec les données liées incluant le profil artiste complet
type ApplicationWithDetails = Application & {
  castings?: Tables<'castings'>;
  artist_profiles?: {
    id: string;
    stage_name: string;
    voice_type: string | null;
    location: string | null;
    profile_image_url: string | null;
    bio: string | null;
    birth_date: string | null;
    gender: string | null;
    nationality: string | null;
    experience_years: number | null;
    contact_email: string | null;
    phone: string | null;
  };
};

export const useMyApplications = () => {
  const { toast } = useToast();

  const { data: applications = [], isLoading, error } = useQuery({
    queryKey: ['my-applications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          castings (
            id,
            title,
            location,
            application_deadline,
            results_published
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching applications:', error);
        throw error;
      }

      return data as ApplicationWithDetails[];
    },
  });

  return {
    applications,
    isLoading,
    error,
  };
};

export const useCastingApplications = (castingId: string) => {
  const { toast } = useToast();

  const { data: applications = [], isLoading, error } = useQuery({
    queryKey: ['casting-applications', castingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          artist_profiles!inner (
            id,
            stage_name,
            voice_type,
            location,
            profile_image_url,
            bio,
            birth_date,
            gender,
            nationality,
            experience_years,
            contact_email,
            phone
          )
        `)
        .eq('casting_id', castingId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching casting applications:', error);
        throw error;
      }

      return data as ApplicationWithDetails[];
    },
    enabled: !!castingId,
  });

  return {
    applications,
    isLoading,
    error,
  };
};

export const useCreateApplication = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (applicationData: Omit<ApplicationInsert, 'artist_profile_id'>) => {
      // Récupérer le profil artiste de l'utilisateur connecté
      const { data: profile } = await supabase
        .from('artist_profiles')
        .select('id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!profile) {
        throw new Error('Profil artiste requis pour postuler');
      }

      // Vérifier si l'utilisateur a déjà postulé à ce casting
      const { data: existingApplication } = await supabase
        .from('applications')
        .select('id')
        .eq('casting_id', applicationData.casting_id)
        .eq('artist_profile_id', profile.id)
        .single();

      if (existingApplication) {
        throw new Error('Vous avez déjà postulé à ce casting');
      }

      const { data, error } = await supabase
        .from('applications')
        .insert({
          ...applicationData,
          artist_profile_id: profile.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating application:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
      queryClient.invalidateQueries({ queryKey: ['casting-applications'] });
      toast({
        title: "Candidature envoyée",
        description: "Votre candidature a été envoyée avec succès.",
      });
    },
    onError: (error: Error) => {
      console.error('Create application error:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'envoyer la candidature.",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateApplication = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: ApplicationUpdate }) => {
      const { data, error } = await supabase
        .from('applications')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating application:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
      queryClient.invalidateQueries({ queryKey: ['casting-applications'] });
      toast({
        title: "Candidature mise à jour",
        description: "Les modifications ont été sauvegardées.",
      });
    },
    onError: (error) => {
      console.error('Update application error:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la candidature.",
        variant: "destructive",
      });
    },
  });
};

export const useApplicationStats = (castingId: string) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['application-stats', castingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('applications')
        .select('status')
        .eq('casting_id', castingId);

      if (error) throw error;

      const stats = {
        total: data.length,
        pending: data.filter(app => app.status === 'pending').length,
        shortlisted: data.filter(app => app.status === 'shortlisted').length,
        accepted: data.filter(app => app.status === 'accepted').length,
        rejected: data.filter(app => app.status === 'rejected').length,
      };

      return stats;
    },
    enabled: !!castingId,
  });

  return {
    stats,
    isLoading,
  };
};
