
-- Créer une table pour les airs des artistes
CREATE TABLE public.artist_airs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_profile_id UUID NOT NULL REFERENCES public.artist_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('audio', 'video', 'url')),
  file_path TEXT, -- Pour les fichiers uploadés
  external_url TEXT, -- Pour les URLs externes
  duration INTEGER, -- Durée en secondes
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer un index pour optimiser les requêtes
CREATE INDEX idx_artist_airs_profile_id ON public.artist_airs(artist_profile_id);
CREATE INDEX idx_artist_airs_display_order ON public.artist_airs(artist_profile_id, display_order);

-- Activer RLS sur la table
ALTER TABLE public.artist_airs ENABLE ROW LEVEL SECURITY;

-- Politique pour que tout le monde puisse voir les airs actifs (profils publics)
CREATE POLICY "Anyone can view active airs" 
  ON public.artist_airs 
  FOR SELECT 
  USING (is_active = true);

-- Politique pour que les propriétaires puissent voir tous leurs airs
CREATE POLICY "Artists can view their own airs" 
  ON public.artist_airs 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.artist_profiles 
      WHERE artist_profiles.id = artist_airs.artist_profile_id 
      AND artist_profiles.user_id = auth.uid()
    )
  );

-- Politique pour que les propriétaires puissent créer leurs airs
CREATE POLICY "Artists can create their own airs" 
  ON public.artist_airs 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.artist_profiles 
      WHERE artist_profiles.id = artist_airs.artist_profile_id 
      AND artist_profiles.user_id = auth.uid()
    )
  );

-- Politique pour que les propriétaires puissent modifier leurs airs
CREATE POLICY "Artists can update their own airs" 
  ON public.artist_airs 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.artist_profiles 
      WHERE artist_profiles.id = artist_airs.artist_profile_id 
      AND artist_profiles.user_id = auth.uid()
    )
  );

-- Politique pour que les propriétaires puissent supprimer leurs airs
CREATE POLICY "Artists can delete their own airs" 
  ON public.artist_airs 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.artist_profiles 
      WHERE artist_profiles.id = artist_airs.artist_profile_id 
      AND artist_profiles.user_id = auth.uid()
    )
  );

-- Créer un bucket de stockage pour les fichiers audio/vidéo
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'artist-airs', 
  'artist-airs', 
  true, 
  52428800, -- 50MB limite
  ARRAY['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'video/mp4', 'video/webm', 'video/ogg']
);

-- Politique de stockage : tout le monde peut voir les fichiers
CREATE POLICY "Anyone can view air files" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'artist-airs');

-- Politique de stockage : les utilisateurs authentifiés peuvent uploader
CREATE POLICY "Authenticated users can upload air files" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'artist-airs' 
    AND auth.role() = 'authenticated'
  );

-- Politique de stockage : les propriétaires peuvent modifier/supprimer leurs fichiers
CREATE POLICY "Users can update their own air files" 
  ON storage.objects 
  FOR UPDATE 
  USING (
    bucket_id = 'artist-airs' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own air files" 
  ON storage.objects 
  FOR DELETE 
  USING (
    bucket_id = 'artist-airs' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
