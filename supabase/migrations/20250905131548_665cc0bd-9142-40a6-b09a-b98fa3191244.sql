-- Créer la table des invitations de comptes
CREATE TABLE public.account_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL,
  profile_type TEXT NOT NULL CHECK (profile_type IN ('artist', 'professional')),
  real_email TEXT NOT NULL,
  invitation_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_used BOOLEAN NOT NULL DEFAULT false,
  used_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.account_invitations ENABLE ROW LEVEL SECURITY;

-- Politique pour que les admins puissent gérer les invitations
CREATE POLICY "Admins can manage account invitations" 
ON public.account_invitations 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::user_role))
WITH CHECK (has_role(auth.uid(), 'admin'::user_role));

-- Politique pour que tout le monde puisse consulter les invitations par token (pour la validation)
CREATE POLICY "Anyone can view invitations by token" 
ON public.account_invitations 
FOR SELECT 
USING (true);

-- Créer un index sur le token pour les performances
CREATE INDEX idx_account_invitations_token ON public.account_invitations(invitation_token);

-- Créer un index sur expires_at pour nettoyer les invitations expirées
CREATE INDEX idx_account_invitations_expires_at ON public.account_invitations(expires_at);