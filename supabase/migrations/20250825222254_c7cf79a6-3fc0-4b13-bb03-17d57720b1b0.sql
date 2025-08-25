-- Ajouter l'option premium visibilité à 29€
INSERT INTO subscription_plans (
  name,
  description,
  price_monthly,
  stripe_price_id,
  features,
  limitations,
  trial_days,
  is_active,
  display_order
) VALUES (
  'Premium Visibilité',
  'Option complémentaire pour une visibilité maximale de votre profil',
  29.00,
  NULL,
  '["Profil affiché en premier dans les recherches", "Badge Premium visible sur votre profil", "Mise en avant sur toutes les pages", "Notifications prioritaires aux professionnels", "Analytics détaillées de visibilité"]'::jsonb,
  '{"premium_visibility": true, "priority_ranking": 1, "featured_placement": true}'::jsonb,
  0,
  true,
  5
) ON CONFLICT DO NOTHING;