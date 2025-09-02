-- Nettoyer les souscriptions en doublon et ajouter des contraintes uniques

-- Étape 1: Supprimer les doublons dans premium_visibility_subscriptions
-- Garder seulement la plus récente pour chaque utilisateur/profil
DELETE FROM premium_visibility_subscriptions 
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id, profile_id, profile_type) id
  FROM premium_visibility_subscriptions 
  WHERE status = 'active'
  ORDER BY user_id, profile_id, profile_type, current_period_end DESC
);

-- Étape 2: Supprimer les souscriptions inactives/expirées dans subscriptions
DELETE FROM subscriptions 
WHERE status NOT IN ('active', 'trialing') 
AND current_period_end < NOW();

-- Étape 3: Pour les souscriptions actives en doublon, garder la plus récente
DELETE FROM subscriptions 
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id, plan_id) id
  FROM subscriptions 
  WHERE status IN ('active', 'trialing')
  ORDER BY user_id, plan_id, current_period_end DESC
);

-- Étape 4: Ajouter une contrainte unique pour éviter les doublons futurs dans subscriptions
-- Un utilisateur ne peut avoir qu'une seule souscription active par plan
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_unique_active_user_plan 
ON subscriptions (user_id, plan_id) 
WHERE status IN ('active', 'trialing');

-- Étape 5: Ajouter une contrainte unique pour premium_visibility_subscriptions
-- Un utilisateur ne peut avoir qu'une seule souscription premium active par profil
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_unique_active_premium_visibility 
ON premium_visibility_subscriptions (user_id, profile_id, profile_type) 
WHERE status = 'active';

-- Étape 6: Mettre à jour les profils pour supprimer les flags premium orphelins
-- Vérifier si les profils artistes ont vraiment une souscription active
UPDATE artist_profiles 
SET public_visibility_premium = false, 
    premium_subscription_end = NULL
WHERE public_visibility_premium = true 
AND id NOT IN (
  SELECT profile_id 
  FROM premium_visibility_subscriptions 
  WHERE profile_type = 'artist' 
  AND status = 'active' 
  AND current_period_end > NOW()
);

-- Vérifier si les profils professionnels ont vraiment une souscription active
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

-- Étape 7: Créer une fonction pour vérifier la cohérence des données
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
$$ LANGUAGE plpgsql;

-- Créer le trigger pour vérifier la cohérence
DROP TRIGGER IF EXISTS trigger_check_subscription_consistency ON subscriptions;
CREATE TRIGGER trigger_check_subscription_consistency
  BEFORE INSERT OR UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION check_subscription_consistency();

-- Étape 8: Fonction similaire pour premium_visibility_subscriptions
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
$$ LANGUAGE plpgsql;

-- Créer le trigger pour les souscriptions premium
DROP TRIGGER IF EXISTS trigger_check_premium_subscription_consistency ON premium_visibility_subscriptions;
CREATE TRIGGER trigger_check_premium_subscription_consistency
  BEFORE INSERT OR UPDATE ON premium_visibility_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION check_premium_subscription_consistency();