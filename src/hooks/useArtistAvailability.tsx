import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { isMissingTable } from '@/lib/supabaseErrors';
import type { Tables } from '@/integrations/supabase/types';

export type Unavailability = Tables<'artist_unavailabilities'>;
export type UnavailabilityKind = 'engagement' | 'indisponible';

export const UNAVAILABILITY_LABELS: Record<UnavailabilityKind, string> = {
  engagement: 'Engagement',
  indisponible: 'Indisponible',
};

/** Deux périodes [début, fin] (dates AAAA-MM-JJ incluses) se chevauchent-elles ? */
export const overlaps = (aStart: string, aEnd: string, bStart: string, bEnd: string) =>
  aStart <= bEnd && bStart <= aEnd;

export const formatPeriod = (start: string, end: string) => {
  const f = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  return start === end ? f(start) : `${f(start)} → ${f(end)}`;
};

const today = () => new Date().toISOString().slice(0, 10);

/** Périodes d'un artiste (passées exclues), avec ajout et suppression pour l'artiste lui-même */
export const useArtistUnavailabilities = (artistProfileId?: string) => {
  const queryClient = useQueryClient();
  const queryKey = ['artist-unavailabilities', artistProfileId];

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: async (): Promise<{ periods: Unavailability[]; unavailable: boolean }> => {
      const { data, error } = await supabase
        .from('artist_unavailabilities')
        .select('*')
        .eq('artist_profile_id', artistProfileId as string)
        .gte('end_date', today())
        .order('start_date', { ascending: true });
      if (isMissingTable(error)) return { periods: [], unavailable: true };
      if (error) throw error;
      return { periods: data || [], unavailable: false };
    },
    enabled: !!artistProfileId,
  });

  const onError = (error: Error) => toast({ title: 'Erreur', description: error.message, variant: 'destructive' });

  const addPeriod = useMutation({
    mutationFn: async (period: { start_date: string; end_date: string; kind: UnavailabilityKind; title?: string }) => {
      const { error } = await supabase
        .from('artist_unavailabilities')
        .insert({ artist_profile_id: artistProfileId as string, ...period, title: period.title || null });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({ title: 'Période ajoutée' });
    },
    onError,
  });

  const removePeriod = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('artist_unavailabilities').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    onError,
  });

  return { periods: data?.periods || [], unavailable: data?.unavailable || false, isLoading, addPeriod, removePeriod };
};

/** Identifiants des artistes indisponibles sur au moins un jour de la période demandée */
export const useUnavailableArtistIds = (from?: string, to?: string) => {
  const { data } = useQuery({
    queryKey: ['unavailable-artists', from, to],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('artist_unavailabilities')
        .select('artist_profile_id')
        .lte('start_date', to as string)
        .gte('end_date', from as string);
      if (isMissingTable(error)) return { ids: new Set<string>(), unavailable: true };
      if (error) throw error;
      return { ids: new Set((data || []).map(r => r.artist_profile_id)), unavailable: false };
    },
    enabled: !!from && !!to && from <= to,
  });
  return { unavailableIds: data?.ids, featureUnavailable: data?.unavailable || false };
};

/** Périodes à venir de plusieurs artistes (comparateur) */
export const useUnavailabilitiesFor = (artistProfileIds: string[]) => {
  const { data } = useQuery({
    queryKey: ['unavailabilities-for', artistProfileIds],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('artist_unavailabilities')
        .select('*')
        .in('artist_profile_id', artistProfileIds)
        .gte('end_date', today())
        .order('start_date', { ascending: true });
      if (isMissingTable(error)) return [];
      if (error) throw error;
      return data || [];
    },
    enabled: artistProfileIds.length > 0,
  });
  return data || [];
};
