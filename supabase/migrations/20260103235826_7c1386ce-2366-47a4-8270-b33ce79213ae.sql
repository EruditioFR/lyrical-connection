-- Table des codes promotionnels
CREATE TABLE public.promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  campaign_name VARCHAR(100) NOT NULL,
  description TEXT,
  discount_type VARCHAR(20) NOT NULL DEFAULT 'free_subscription',
  discount_value DECIMAL(10,2),
  subscription_months INTEGER NOT NULL DEFAULT 6,
  plan_id UUID REFERENCES public.subscription_plans(id),
  max_uses INTEGER, -- NULL = illimité
  current_uses INTEGER NOT NULL DEFAULT 0,
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID
);

-- Table des utilisations de codes promo
CREATE TABLE public.promo_code_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_code_id UUID NOT NULL REFERENCES public.promo_codes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  artist_profile_id UUID REFERENCES public.artist_profiles(id) ON DELETE SET NULL,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  subscription_granted_until TIMESTAMPTZ,
  badges_granted TEXT[],
  UNIQUE(promo_code_id, user_id)
);

-- Table des badges artistes
CREATE TABLE public.artist_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_profile_id UUID NOT NULL REFERENCES public.artist_profiles(id) ON DELETE CASCADE,
  badge_type VARCHAR(50) NOT NULL,
  badge_name VARCHAR(100) NOT NULL,
  badge_icon VARCHAR(50) DEFAULT '⭐',
  awarded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  awarded_by VARCHAR(50) DEFAULT 'promo_code',
  metadata JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(artist_profile_id, badge_type)
);

-- Index pour les performances
CREATE INDEX idx_promo_codes_code ON public.promo_codes(code);
CREATE INDEX idx_promo_codes_active ON public.promo_codes(is_active, expires_at);
CREATE INDEX idx_promo_code_redemptions_user ON public.promo_code_redemptions(user_id);
CREATE INDEX idx_promo_code_redemptions_code ON public.promo_code_redemptions(promo_code_id);
CREATE INDEX idx_artist_badges_profile ON public.artist_badges(artist_profile_id);
CREATE INDEX idx_artist_badges_type ON public.artist_badges(badge_type);

-- Activer RLS
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_code_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_badges ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour promo_codes
CREATE POLICY "Anyone can view active promo codes" 
ON public.promo_codes 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage promo codes" 
ON public.promo_codes 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::user_role))
WITH CHECK (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "System can manage promo codes" 
ON public.promo_codes 
FOR ALL 
USING (true);

-- Politiques RLS pour promo_code_redemptions
CREATE POLICY "Users can view their own redemptions" 
ON public.promo_code_redemptions 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "System can manage redemptions" 
ON public.promo_code_redemptions 
FOR ALL 
USING (true);

CREATE POLICY "Admins can view all redemptions" 
ON public.promo_code_redemptions 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::user_role));

-- Politiques RLS pour artist_badges
CREATE POLICY "Anyone can view active badges" 
ON public.artist_badges 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "System can manage badges" 
ON public.artist_badges 
FOR ALL 
USING (true);

CREATE POLICY "Admins can manage badges" 
ON public.artist_badges 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::user_role))
WITH CHECK (has_role(auth.uid(), 'admin'::user_role));

-- Trigger pour updated_at sur promo_codes
CREATE TRIGGER update_promo_codes_updated_at
BEFORE UPDATE ON public.promo_codes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insérer le code promo Sumi Jo 2026 par défaut
INSERT INTO public.promo_codes (
  code,
  campaign_name,
  description,
  discount_type,
  subscription_months,
  max_uses,
  starts_at,
  expires_at,
  metadata
) VALUES (
  'SUMIJO2026',
  'Concours International Sumi Jo 2026',
  'Code promotionnel pour les candidats du Concours International Sumi Jo 2026. Offre 6 mois d''abonnement Premium gratuit.',
  'free_subscription',
  6,
  NULL, -- Illimité
  now(),
  '2026-12-31 23:59:59+00'::timestamptz,
  '{"badge_type": "sumi_jo_2026", "badge_name": "Candidat Sumi Jo 2026", "badge_icon": "🌟"}'::jsonb
);