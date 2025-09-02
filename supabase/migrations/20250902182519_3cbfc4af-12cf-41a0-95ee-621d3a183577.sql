-- Ajouter les contraintes et triggers de vérification

-- Étape 1: Créer une fonction pour vérifier la cohérence des souscriptions
CREATE OR REPLACE FUNCTION check_subscription_consistency()
RETURNS trigger AS $$
BEGIN
  -- Vérifier qu'on n'ajoute pas une deuxième souscription active pour le même plan
  IF NEW.status IN ('active', 'trialing') THEN
    IF EXISTS (
      SELECT 1 FROM subscriptions 
      WHERE user_id = NEW.user_id 
      AND plan_id = NEW.plan_id 
      AND status IN ('active', 'trialing')
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    ) THEN
      RAISE EXCEPTION 'L''utilisateur a déjà une souscription active pour ce plan';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Étape 2: Créer le trigger pour vérifier la cohérence des souscriptions
DROP TRIGGER IF EXISTS trigger_check_subscription_consistency ON subscriptions;
CREATE TRIGGER trigger_check_subscription_consistency
  BEFORE INSERT OR UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION check_subscription_consistency();

-- Étape 3: Fonction similaire pour premium_visibility_subscriptions
CREATE OR REPLACE FUNCTION check_premium_subscription_consistency()
RETURNS trigger AS $$
BEGIN
  IF NEW.status = 'active' THEN
    IF EXISTS (
      SELECT 1 FROM premium_visibility_subscriptions 
      WHERE user_id = NEW.user_id 
      AND profile_id = NEW.profile_id 
      AND profile_type = NEW.profile_type
      AND status = 'active'
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    ) THEN
      RAISE EXCEPTION 'L''utilisateur a déjà une souscription premium active pour ce profil';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Étape 4: Créer le trigger pour les souscriptions premium
DROP TRIGGER IF EXISTS trigger_check_premium_subscription_consistency ON premium_visibility_subscriptions;
CREATE TRIGGER trigger_check_premium_subscription_consistency
  BEFORE INSERT OR UPDATE ON premium_visibility_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION check_premium_subscription_consistency();

-- Étape 5: Nettoyer les profils professionnels orphelins
UPDATE professional_profiles 
SET public_visibility_premium = false, 
    premium_subscription_end = NULL
WHERE public_visibility_premium = true 
AND id NOT IN (
  SELECT profile_id 
  FROM premium_visibility_subscriptions 
  WHERE profile_type = 'professional' 
  AND status = 'active' 
  AND current_period_end > NOW()
);