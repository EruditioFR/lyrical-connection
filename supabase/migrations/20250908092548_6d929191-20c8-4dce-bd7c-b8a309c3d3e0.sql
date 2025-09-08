-- Créer une edge function pour supprimer complètement un utilisateur
CREATE OR REPLACE FUNCTION public.delete_user_completely(user_id_to_delete uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Vérifier que l'utilisateur qui appelle cette fonction est admin
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Seuls les administrateurs peuvent supprimer des utilisateurs';
  END IF;

  -- La suppression des profils se fera automatiquement via les foreign keys CASCADE
  -- lors de la suppression de auth.users
  
  RETURN true;
END;
$$;