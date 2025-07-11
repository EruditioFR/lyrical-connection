
-- Créer une table pour les médias des profils professionnels
CREATE TABLE public.professional_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_profile_id UUID NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('photo', 'video', 'audio')),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  title TEXT,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (professional_profile_id) REFERENCES public.professional_profiles(id) ON DELETE CASCADE
);

-- Créer les politiques RLS pour la table professional_media
ALTER TABLE public.professional_media ENABLE ROW LEVEL SECURITY;

-- Les professionnels peuvent gérer leurs propres médias
CREATE POLICY "Professionals can manage their own media" 
ON public.professional_media 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM professional_profiles 
    WHERE professional_profiles.id = professional_media.professional_profile_id 
    AND professional_profiles.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM professional_profiles 
    WHERE professional_profiles.id = professional_media.professional_profile_id 
    AND professional_profiles.user_id = auth.uid()
  )
);

-- Tout le monde peut voir les médias des profils professionnels actifs
CREATE POLICY "Anyone can view active professional media" 
ON public.professional_media 
FOR SELECT 
USING (
  is_active = true AND 
  EXISTS (
    SELECT 1 FROM professional_profiles 
    WHERE professional_profiles.id = professional_media.professional_profile_id 
    AND professional_profiles.is_active = true
  )
);

-- Créer un bucket de stockage pour les médias professionnels
INSERT INTO storage.buckets (id, name, public) 
VALUES ('professional-media', 'professional-media', true);

-- Créer des politiques pour le bucket professional-media
CREATE POLICY "Allow public access to professional media" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'professional-media');

CREATE POLICY "Allow authenticated users to upload professional media" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'professional-media' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update professional media" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'professional-media' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete professional media" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'professional-media' AND auth.role() = 'authenticated');

-- Ajouter un trigger pour mettre à jour updated_at
CREATE TRIGGER update_professional_media_updated_at
    BEFORE UPDATE ON public.professional_media
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
