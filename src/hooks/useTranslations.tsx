
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface TranslationKey {
  id: string;
  key_path: string;
  section: string;
  french_text: string;
  context?: string;
  created_at: string;
  updated_at: string;
}

export interface Translation {
  id: string;
  key_id: string;
  language_code: string;
  translated_text: string;
  is_ai_generated: boolean;
  is_reviewed: boolean;
  translated_by?: string;
  created_at: string;
  updated_at: string;
}

export interface TranslationSuggestion {
  id: string;
  key_id: string;
  language_code: string;
  suggested_text: string;
  ai_confidence?: number;
  context_used?: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export const useTranslationKeys = () => {
  return useQuery({
    queryKey: ['translation-keys'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('translation_keys')
        .select('*')
        .order('section', { ascending: true })
        .order('key_path', { ascending: true });

      if (error) throw error;
      return data as TranslationKey[];
    },
  });
};

export const useTranslations = () => {
  return useQuery({
    queryKey: ['translations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('translations')
        .select('*')
        .order('language_code', { ascending: true });

      if (error) throw error;
      return data as Translation[];
    },
  });
};

export const useTranslationSuggestions = () => {
  return useQuery({
    queryKey: ['translation-suggestions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('translation_suggestions')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as TranslationSuggestion[];
    },
  });
};

export const useCreateTranslationKey = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<TranslationKey, 'id' | 'created_at' | 'updated_at'>) => {
      const { data: result, error } = await supabase
        .from('translation_keys')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['translation-keys'] });
      toast({
        title: "Clé de traduction créée",
        description: "La nouvelle clé de traduction a été ajoutée avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de créer la clé de traduction.",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateTranslation = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      keyId, 
      languageCode, 
      translatedText, 
      isReviewed = false 
    }: {
      keyId: string;
      languageCode: string;
      translatedText: string;
      isReviewed?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('translations')
        .upsert({
          key_id: keyId,
          language_code: languageCode,
          translated_text: translatedText,
          is_reviewed: isReviewed,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['translations'] });
      toast({
        title: "Traduction mise à jour",
        description: "La traduction a été sauvegardée avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la traduction.",
        variant: "destructive",
      });
    },
  });
};

export const useAcceptSuggestion = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (suggestionId: string) => {
      // Récupérer la suggestion
      const { data: suggestion, error: suggestionError } = await supabase
        .from('translation_suggestions')
        .select('*')
        .eq('id', suggestionId)
        .single();

      if (suggestionError) throw suggestionError;

      // Créer/mettre à jour la traduction
      const { error: translationError } = await supabase
        .from('translations')
        .upsert({
          key_id: suggestion.key_id,
          language_code: suggestion.language_code,
          translated_text: suggestion.suggested_text,
          is_ai_generated: true,
          is_reviewed: false,
        });

      if (translationError) throw translationError;

      // Marquer la suggestion comme acceptée
      const { error: updateError } = await supabase
        .from('translation_suggestions')
        .update({ status: 'accepted' })
        .eq('id', suggestionId);

      if (updateError) throw updateError;

      return suggestion;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['translations'] });
      queryClient.invalidateQueries({ queryKey: ['translation-suggestions'] });
      toast({
        title: "Suggestion acceptée",
        description: "La traduction suggérée a été acceptée et appliquée.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible d'accepter la suggestion.",
        variant: "destructive",
      });
    },
  });
};
