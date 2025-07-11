-- Mettre à jour le plan Premium pour le renommer en "Artistes"
UPDATE subscription_plans 
SET name = 'Artistes'
WHERE name = 'Premium';

-- Mettre à jour le plan Professionnel pour s'assurer qu'il a le bon nom
UPDATE subscription_plans 
SET name = 'Professionnels'
WHERE name = 'Professionnel';