
-- Modifier la fonction create_default_user_role pour assigner le rôle selon le type d'utilisateur
CREATE OR REPLACE FUNCTION public.create_default_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    -- Assigner le rôle selon le type d'utilisateur dans les métadonnées
    IF NEW.raw_user_meta_data ->> 'user_type' = 'professional' THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (NEW.id, 'user'::user_role);
    ELSE
        -- Par défaut, considérer comme artiste si pas de type spécifié ou si type = 'artist'
        INSERT INTO public.user_roles (user_id, role)
        VALUES (NEW.id, 'user'::user_role);
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log l'erreur et continuer l'inscription
        RAISE LOG 'Erreur lors de la création du rôle par défaut pour user_id %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$;

-- S'assurer que le trigger existe et est actif
DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.create_default_user_role();
