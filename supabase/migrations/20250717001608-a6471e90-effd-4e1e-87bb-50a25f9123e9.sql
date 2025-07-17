
-- Accorder les permissions nécessaires pour que le trigger puisse écrire dans user_roles
-- La fonction étant SECURITY DEFINER, elle s'exécute avec les privilèges du propriétaire
GRANT INSERT ON public.user_roles TO postgres;
GRANT SELECT ON public.user_roles TO postgres;

-- Recréer la fonction en s'assurant qu'elle a les bonnes permissions
CREATE OR REPLACE FUNCTION public.create_default_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    RAISE LOG 'Trigger create_default_user_role appelé pour user_id: %', NEW.id;
    
    -- Vérifier si l'utilisateur a déjà un rôle
    IF EXISTS (SELECT 1 FROM user_roles WHERE user_id = NEW.id) THEN
        RAISE LOG 'User_id % a déjà un rôle, ignorer', NEW.id;
        RETURN NEW;
    END IF;
    
    -- Assigner le rôle 'user' par défaut avec permissions explicites
    INSERT INTO user_roles (user_id, role)
    VALUES (NEW.id, 'user'::user_role);
    
    RAISE LOG 'Rôle user assigné avec succès pour user_id: %', NEW.id;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log l'erreur détaillée et continuer l'inscription
        RAISE LOG 'ERREUR dans create_default_user_role pour user_id %: % - SQLSTATE: %', NEW.id, SQLERRM, SQLSTATE;
        RETURN NEW;
END;
$$;

-- Donner les permissions au rôle postgres pour exécuter cette fonction
GRANT EXECUTE ON FUNCTION public.create_default_user_role() TO postgres;

-- Recréer le trigger
DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_default_user_role();
