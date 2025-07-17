
-- Vérifier d'abord si le trigger existe et fonctionne correctement
-- Corriger les utilisateurs existants qui n'ont pas de rôle en leur assignant 'user'
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'user'::user_role
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE ur.user_id IS NULL;

-- Recréer la fonction avec une meilleure gestion d'erreurs et logs plus détaillés
CREATE OR REPLACE FUNCTION public.create_default_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RAISE LOG 'Trigger create_default_user_role appelé pour user_id: %', NEW.id;
    
    -- Vérifier si l'utilisateur a déjà un rôle
    IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = NEW.id) THEN
        RAISE LOG 'User_id % a déjà un rôle, ignorer', NEW.id;
        RETURN NEW;
    END IF;
    
    -- Assigner le rôle 'user' par défaut
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user'::user_role);
    
    RAISE LOG 'Rôle user assigné avec succès pour user_id: %', NEW.id;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log l'erreur détaillée et continuer l'inscription
        RAISE LOG 'Erreur lors de la création du rôle par défaut pour user_id %: % - %', NEW.id, SQLERRM, SQLSTATE;
        RETURN NEW;
END;
$$;

-- Supprimer et recréer le trigger pour s'assurer qu'il fonctionne
DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.create_default_user_role();

-- Vérifier que le trigger est bien créé
SELECT * FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created_role';
