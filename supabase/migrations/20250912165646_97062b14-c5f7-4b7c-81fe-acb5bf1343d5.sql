-- Mettre à jour les politiques RLS pour les castings
DROP POLICY IF EXISTS "Anyone can view active castings" ON castings;

-- Nouvelle politique : seuls les castings correspondant aux critères sont visibles aux artistes
CREATE POLICY "Artists can only see castings matching their profile" 
ON castings 
FOR SELECT 
USING (
  is_active = true 
  AND (
    -- Si l'utilisateur n'est pas connecté, il peut voir tous les castings (pour les visiteurs)
    auth.uid() IS NULL 
    -- Si c'est un professionnel, il peut voir tous ses castings
    OR EXISTS (SELECT 1 FROM professional_profiles WHERE user_id = auth.uid() AND id = castings.professional_profile_id)
    -- Si l'utilisateur n'est pas un artiste, il peut voir tous les castings
    OR NOT EXISTS (SELECT 1 FROM artist_profiles WHERE user_id = auth.uid())
    -- Si c'est un artiste, vérifier les critères
    OR artist_matches_casting_criteria(castings.id, (SELECT id FROM artist_profiles WHERE user_id = auth.uid()))
  )
);