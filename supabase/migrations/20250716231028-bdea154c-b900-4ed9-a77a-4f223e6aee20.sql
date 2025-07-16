
-- Ajouter une politique RLS pour permettre aux admins de modifier tous les profils artistes
CREATE POLICY "Admins can update all artist profiles" ON public.artist_profiles
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::user_role))
WITH CHECK (has_role(auth.uid(), 'admin'::user_role));
