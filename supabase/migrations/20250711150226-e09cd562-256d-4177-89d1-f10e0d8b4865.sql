
-- Créer une fonction pour assigner le rôle par défaut 'user' aux nouveaux utilisateurs
CREATE OR REPLACE FUNCTION public.create_default_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user'::user_role);
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log l'erreur et continuer l'inscription
        RAISE LOG 'Erreur lors de la création du rôle par défaut pour user_id %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$;

-- Créer le trigger pour déclencher la fonction après chaque insertion d'utilisateur
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.create_default_user_role();

-- Corriger les utilisateurs existants qui n'ont pas de rôle en leur assignant 'user'
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'user'::user_role
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE ur.user_id IS NULL;
