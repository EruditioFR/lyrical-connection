-- Corriger la fonction handle_new_professional_user pour éviter les erreurs
CREATE OR REPLACE FUNCTION public.handle_new_professional_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Vérifier si l'utilisateur s'est inscrit comme professionnel
  IF NEW.raw_user_meta_data ->> 'user_type' = 'professional' THEN
    INSERT INTO public.professional_profiles (
      user_id, 
      professional_role, 
      company_name,
      contact_email
    )
    VALUES (
      NEW.id,
      COALESCE(
        (NEW.raw_user_meta_data ->> 'professional_role')::professional_role,
        'vocal_coach'::professional_role
      ),
      COALESCE(NEW.raw_user_meta_data ->> 'company_name', 'Ma Société'),
      COALESCE(NEW.email, '')
    );
  END IF;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log l'erreur et continuer l'inscription
    RAISE LOG 'Erreur lors de la création du profil professionnel pour user_id %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;