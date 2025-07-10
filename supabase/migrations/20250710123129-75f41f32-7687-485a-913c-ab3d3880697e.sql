-- Create subscription plans table
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  price_monthly DECIMAL(10,2) NOT NULL,
  stripe_price_id TEXT UNIQUE,
  features JSONB DEFAULT '[]'::jsonb,
  limitations JSONB DEFAULT '{}'::jsonb,
  trial_days INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  plan_id UUID REFERENCES public.subscription_plans(id),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'inactive',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS policies for subscription_plans
CREATE POLICY "Anyone can view active plans" 
ON public.subscription_plans 
FOR SELECT 
USING (is_active = true);

-- RLS policies for subscriptions
CREATE POLICY "Users can view their own subscription" 
ON public.subscriptions 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own subscription" 
ON public.subscriptions 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "System can manage subscriptions" 
ON public.subscriptions 
FOR ALL 
USING (true);

-- Insert subscription plans
INSERT INTO public.subscription_plans (name, description, price_monthly, features, limitations, trial_days, display_order) VALUES
('Gratuit', 'Accès de base pour les utilisateurs sélectionnés', 0.00, 
 '["Profil artiste/professionnel", "Navigation basique", "Contact limité"]'::jsonb,
 '{"castings_per_month": 2, "messages_per_day": 5, "profile_views": 50}'::jsonb,
 0, 1),

('Early Bird', 'Tarif privilégié pour les premiers utilisateurs', 5.00,
 '["Profil complet", "Recherche avancée", "Messages illimités", "Analytics basiques"]'::jsonb,
 '{"castings_per_month": 10, "premium_features": false}'::jsonb,
 0, 2),

('Premium', 'Accès complet pour artistes et professionnels', 9.00,
 '["Toutes les fonctionnalités", "Analytics avancées", "Support prioritaire", "Visibilité améliorée"]'::jsonb,
 '{"castings_per_month": 50, "premium_features": true}'::jsonb,
 15, 3),

('Professionnel', 'Solution complète pour les professionnels', 49.00,
 '["Fonctionnalités Premium", "Gestion d\'équipe", "API access", "Support dédié", "Branding personnalisé"]'::jsonb,
 '{"castings_per_month": 9999, "team_members": 10, "api_calls": 10000}'::jsonb,
 15, 4);

-- Add trigger for updated_at
CREATE TRIGGER update_subscription_plans_updated_at
BEFORE UPDATE ON public.subscription_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for performance
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON public.subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);