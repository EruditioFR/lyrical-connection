import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Types for the enhanced opera database
export interface AriaWithDetails {
  id: string;
  work_id: string;
  role_id?: string;
  title: string;
  act_number?: number;
  scene_number?: number;
  duration_minutes?: number;
  key_signature?: string;
  tempo_marking?: string;
  tessitura_min?: string;
  tessitura_max?: string;
  difficulty_level: number;
  style_period?: string;
  aria_type?: string;
  vocal_technique_notes?: string;
  dramatic_context?: string;
  first_line?: string;
  created_at: string;
  updated_at: string;
  lyrical_works?: {
    title: string;
    composer: string;
    category: string;
  };
  work_roles?: {
    role_name: string;
    voice_type?: string;
  };
  aria_texts?: AriaText[];
  sheet_music?: SheetMusic[];
  opera_recordings?: OperaRecording[];
}

export interface AriaText {
  id: string;
  aria_id: string;
  language: string;
  full_text: string;
  phonetic_transcription?: string;
  translation?: string;
  verse_structure?: any;
  created_at: string;
}

export interface SheetMusic {
  id: string;
  aria_id: string;
  title: string;
  original_key?: string;
  transposed_key?: string;
  file_path?: string;
  file_size?: number;
  publisher?: string;
  edition?: string;
  arrangement_type?: string;
  is_public_domain: boolean;
  price_cents: number;
  created_at: string;
}

export interface OperaRecording {
  id: string;
  aria_id?: string;
  work_id?: string;
  title: string;
  performer_name?: string;
  conductor?: string;
  orchestra?: string;
  recording_year?: number;
  platform?: string;
  external_url?: string;
  file_path?: string;
  recording_type?: string;
  quality?: string;
  duration_seconds?: number;
  language?: string;
  is_featured: boolean;
  view_count: number;
  created_at: string;
}

export interface OperaProduction {
  id: string;
  work_id: string;
  title: string;
  venue?: string;
  city?: string;
  country?: string;
  production_date?: string;
  director?: string;
  conductor?: string;
  stage_designer?: string;
  costume_designer?: string;
  cast_info?: any;
  production_notes?: string;
  is_notable: boolean;
  images?: any;
  reviews_summary?: string;
  created_at: string;
}

export const useAriaDatabase = (filters?: {
  workId?: string;
  roleId?: string;
  difficulty?: number;
  category?: string;
  language?: string;
  searchTerm?: string;
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch arias with comprehensive details
  const { data: arias, isLoading, error } = useQuery({
    queryKey: ['opera-arias', filters],
    queryFn: async () => {
      let query = supabase
        .from('arias')
        .select(`
          *,
          lyrical_works (title, composer, category),
          work_roles (role_name, voice_type),
          aria_texts (*),
          sheet_music (*),
          opera_recordings (*)
        `);

      if (filters?.workId) {
        query = query.eq('work_id', filters.workId);
      }
      if (filters?.roleId) {
        query = query.eq('role_id', filters.roleId);
      }
      if (filters?.difficulty) {
        query = query.eq('difficulty_level', filters.difficulty);
      }
      if (filters?.searchTerm) {
        query = query.or(`title.ilike.%${filters.searchTerm}%,first_line.ilike.%${filters.searchTerm}%`);
      }

      const { data, error } = await query.order('title');

      if (error) {
        console.error('Error fetching arias:', error);
        throw error;
      }

      return data as AriaWithDetails[];
    },
  });

  // Create aria
  const createAria = useMutation({
    mutationFn: async (ariaData: Omit<AriaWithDetails, 'id' | 'created_at' | 'updated_at' | 'lyrical_works' | 'work_roles' | 'aria_texts' | 'sheet_music' | 'opera_recordings'>) => {
      const { data, error } = await supabase
        .from('arias')
        .insert(ariaData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opera-arias'] });
      toast({
        title: "Air créé",
        description: "L'air a été créé avec succès.",
      });
    },
    onError: (error) => {
      console.error('Error creating aria:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer l'air.",
        variant: "destructive",
      });
    },
  });

  // Update aria
  const updateAria = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<AriaWithDetails> }) => {
      const { data: updatedData, error } = await supabase
        .from('arias')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updatedData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opera-arias'] });
      toast({
        title: "Air modifié",
        description: "L'air a été modifié avec succès.",
      });
    },
    onError: (error) => {
      console.error('Error updating aria:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier l'air.",
        variant: "destructive",
      });
    },
  });

  // Delete aria
  const deleteAria = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('arias')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opera-arias'] });
      toast({
        title: "Air supprimé",
        description: "L'air a été supprimé avec succès.",
      });
    },
    onError: (error) => {
      console.error('Error deleting aria:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'air.",
        variant: "destructive",
      });
    },
  });

  return {
    arias: arias || [],
    isLoading,
    error,
    createAria: createAria.mutate,
    updateAria: updateAria.mutate,
    deleteAria: deleteAria.mutate,
    isCreating: createAria.isPending,
    isUpdating: updateAria.isPending,
    isDeleting: deleteAria.isPending,
  };
};

export const useAriaTexts = (ariaId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: texts, isLoading } = useQuery({
    queryKey: ['aria-texts', ariaId],
    queryFn: async () => {
      if (!ariaId) return [];

      const { data, error } = await supabase
        .from('aria_texts')
        .select('*')
        .eq('aria_id', ariaId)
        .order('language');

      if (error) throw error;
      return data as AriaText[];
    },
    enabled: !!ariaId,
  });

  const addText = useMutation({
    mutationFn: async (textData: Omit<AriaText, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('aria_texts')
        .insert(textData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aria-texts'] });
      toast({ title: "Texte ajouté avec succès" });
    },
  });

  return {
    texts: texts || [],
    isLoading,
    addText: addText.mutate,
    isAdding: addText.isPending,
  };
};

export const useOperaRecordings = (filters?: { ariaId?: string; workId?: string }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: recordings, isLoading } = useQuery({
    queryKey: ['opera-recordings', filters],
    queryFn: async () => {
      let query = supabase.from('opera_recordings').select('*');

      if (filters?.ariaId) {
        query = query.eq('aria_id', filters.ariaId);
      }
      if (filters?.workId) {
        query = query.eq('work_id', filters.workId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data as OperaRecording[];
    },
  });

  const addRecording = useMutation({
    mutationFn: async (recordingData: Omit<OperaRecording, 'id' | 'created_at' | 'view_count'>) => {
      const { data, error } = await supabase
        .from('opera_recordings')
        .insert(recordingData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opera-recordings'] });
      toast({ title: "Enregistrement ajouté avec succès" });
    },
  });

  return {
    recordings: recordings || [],
    isLoading,
    addRecording: addRecording.mutate,
    isAdding: addRecording.isPending,
  };
};