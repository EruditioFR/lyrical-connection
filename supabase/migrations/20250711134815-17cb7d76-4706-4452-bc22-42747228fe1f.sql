
-- Créer un enum pour les rôles utilisateur
CREATE TYPE public.user_role AS ENUM ('admin', 'user');

-- Créer une table pour gérer les rôles utilisateur
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role user_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Activer RLS sur la table user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Fonction sécurisée pour vérifier les rôles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Politique RLS pour que les utilisateurs puissent voir leurs propres rôles
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT
  USING (user_id = auth.uid());

-- Politique pour que les admins puissent gérer tous les rôles
CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Ajouter une colonne pour marquer les utilisateurs créés par un admin
ALTER TABLE public.artist_profiles 
ADD COLUMN created_by_admin UUID REFERENCES auth.users(id),
ADD COLUMN is_free_account BOOLEAN DEFAULT FALSE;

ALTER TABLE public.professional_profiles 
ADD COLUMN created_by_admin UUID REFERENCES auth.users(id),
ADD COLUMN is_free_account BOOLEAN DEFAULT FALSE;

-- Créer une table pour les demandes de passage en payant
CREATE TABLE public.upgrade_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  profile_type TEXT NOT NULL CHECK (profile_type IN ('artist', 'professional')),
  profile_id UUID NOT NULL,
  requested_by UUID REFERENCES auth.users(id) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'completed', 'cancelled')),
  payment_link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS pour les demandes d'upgrade
ALTER TABLE public.upgrade_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage upgrade requests" ON public.upgrade_requests
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their upgrade requests" ON public.upgrade_requests
  FOR SELECT
  USING (user_id = auth.uid());

-- Mettre à jour l'email existant (vous devrez faire cela manuellement dans l'interface Supabase Auth)
-- UPDATE auth.users SET email = 'jbbejot+baldo@gmail.com' WHERE email = 'jbbejot@gmail.com';

-- Ajouter un trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON public.user_roles
FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_upgrade_requests_updated_at BEFORE UPDATE ON public.upgrade_requests
FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
