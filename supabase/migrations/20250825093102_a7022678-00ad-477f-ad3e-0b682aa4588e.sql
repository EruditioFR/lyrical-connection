-- Ajouter des colonnes pour l'option premium de visibilité publique
ALTER TABLE public.artist_profiles 
ADD COLUMN public_visibility_premium BOOLEAN DEFAULT FALSE,
ADD COLUMN premium_subscription_end TIMESTAMPTZ;

ALTER TABLE public.professional_profiles 
ADD COLUMN public_visibility_premium BOOLEAN DEFAULT FALSE,
ADD COLUMN premium_subscription_end TIMESTAMPTZ;

-- Créer une table pour gérer les abonnements premium de visibilité
CREATE TABLE public.premium_visibility_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_type TEXT NOT NULL CHECK (profile_type IN ('artist', 'professional')),
  profile_id UUID NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'expired')),
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS sur la nouvelle table
ALTER TABLE public.premium_visibility_subscriptions ENABLE ROW LEVEL SECURITY;

-- Politique pour que les utilisateurs puissent voir leurs propres abonnements
CREATE POLICY "Users can view their own premium subscriptions" 
ON public.premium_visibility_subscriptions
FOR SELECT 
USING (user_id = auth.uid());

-- Politique pour que les edge functions puissent gérer les abonnements
CREATE POLICY "Edge functions can manage premium subscriptions" 
ON public.premium_visibility_subscriptions
FOR ALL 
USING (true);

-- Créer un index pour les requêtes fréquentes
CREATE INDEX idx_premium_subscriptions_user_id ON public.premium_visibility_subscriptions(user_id);
CREATE INDEX idx_premium_subscriptions_profile ON public.premium_visibility_subscriptions(profile_type, profile_id);
CREATE INDEX idx_premium_subscriptions_stripe ON public.premium_visibility_subscriptions(stripe_subscription_id);

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_premium_subscriptions_updated_at
  BEFORE UPDATE ON public.premium_visibility_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();