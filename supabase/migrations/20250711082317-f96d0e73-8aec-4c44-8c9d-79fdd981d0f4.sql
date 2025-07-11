-- Mettre à jour les fonctionnalités du plan Professionnels pour supprimer "API access" et "Gestion equipe"
UPDATE subscription_plans 
SET features = ARRAY['Toutes les fonctionnalités', 'Analytics avancées', 'Support prioritaire', 'Visibilité améliorée', 'Support dedie', 'Branding personnalise']
WHERE name = 'Professionnels';