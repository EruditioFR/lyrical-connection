
-- Permettre aux admins de supprimer les profils d'artistes
CREATE POLICY "Admins can delete artist profiles" 
  ON public.artist_profiles 
  FOR DELETE 
  USING (has_role(auth.uid(), 'admin'::user_role));

-- Permettre aux admins de supprimer les profils professionnels
CREATE POLICY "Admins can delete professional profiles" 
  ON public.professional_profiles 
  FOR DELETE 
  USING (has_role(auth.uid(), 'admin'::user_role));

-- Permettre aux admins de supprimer les données liées aux artistes (photos, airs, répertoire)
CREATE POLICY "Admins can delete artist photos" 
  ON public.artist_photos 
  FOR DELETE 
  USING (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Admins can delete artist airs" 
  ON public.artist_airs 
  FOR DELETE 
  USING (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Admins can delete artist repertoire" 
  ON public.artist_repertoire 
  FOR DELETE 
  USING (has_role(auth.uid(), 'admin'::user_role));

-- Permettre aux admins de supprimer les données liées aux professionnels
CREATE POLICY "Admins can delete professional media" 
  ON public.professional_media 
  FOR DELETE 
  USING (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Admins can delete professional availability" 
  ON public.professional_availability 
  FOR DELETE 
  USING (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Admins can delete professional target profiles" 
  ON public.professional_target_profiles 
  FOR DELETE 
  USING (has_role(auth.uid(), 'admin'::user_role));
