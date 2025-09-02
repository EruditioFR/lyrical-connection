-- Nettoyer la duplication pour l'utilisateur jbbejot+abaldo@gmail.com

WITH user_info AS (
  SELECT id as user_id FROM auth.users WHERE email = 'jbbejot+abaldo@gmail.com'
),
duplicated_subscription AS (
  -- Identifier les Stripe subscription IDs en doublon
  SELECT 
    s.stripe_subscription_id,
    s.user_id,
    s.id as main_subscription_id,
    pvs.id as premium_subscription_id
  FROM subscriptions s
  JOIN premium_visibility_subscriptions pvs ON s.stripe_subscription_id = pvs.stripe_subscription_id
  JOIN user_info ui ON s.user_id = ui.user_id
  WHERE s.stripe_subscription_id = 'sub_1S2ygoRc375UxOm0YGa4MeW4'
)
-- Supprimer l'enregistrement en doublon dans premium_visibility_subscriptions
DELETE FROM premium_visibility_subscriptions 
WHERE id IN (
  SELECT premium_subscription_id FROM duplicated_subscription
);