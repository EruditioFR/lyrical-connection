-- Nettoyage final et définitif pour éviter les doublons Premium Visibilité

-- Supprimer TOUS les doublons où le même stripe_subscription_id existe dans les deux tables
WITH duplicates AS (
  SELECT DISTINCT s.stripe_subscription_id
  FROM subscriptions s
  JOIN premium_visibility_subscriptions pvs ON s.stripe_subscription_id = pvs.stripe_subscription_id
  JOIN subscription_plans sp ON s.plan_id = sp.id
  WHERE sp.name = 'Premium Visibilité'
)
DELETE FROM premium_visibility_subscriptions 
WHERE stripe_subscription_id IN (SELECT stripe_subscription_id FROM duplicates);

-- Ajouter un index unique pour empêcher définitivement les doublons de stripe_subscription_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_stripe_subscription_global 
ON premium_visibility_subscriptions (stripe_subscription_id);

-- Créer une fonction pour empêcher les doublons entre les tables
CREATE OR REPLACE FUNCTION prevent_subscription_duplication()
RETURNS trigger AS $$
BEGIN
  -- Si on essaie d'insérer dans premium_visibility_subscriptions
  -- vérifier qu'il n'y a pas déjà un plan "Premium Visibilité" dans subscriptions
  IF TG_TABLE_NAME = 'premium_visibility_subscriptions' THEN
    IF EXISTS (
      SELECT 1 FROM subscriptions s
      JOIN subscription_plans sp ON s.plan_id = sp.id
      WHERE s.stripe_subscription_id = NEW.stripe_subscription_id
      AND sp.name = 'Premium Visibilité'
    ) THEN
      RAISE EXCEPTION 'Cet abonnement Stripe existe déjà comme plan Premium Visibilité complet';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Créer le trigger
DROP TRIGGER IF EXISTS trigger_prevent_subscription_duplication ON premium_visibility_subscriptions;
CREATE TRIGGER trigger_prevent_subscription_duplication
  BEFORE INSERT ON premium_visibility_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION prevent_subscription_duplication();