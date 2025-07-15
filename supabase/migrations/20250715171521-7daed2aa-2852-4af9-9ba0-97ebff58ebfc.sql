-- Ajouter un champ pour indiquer si les résultats du casting sont publiés
ALTER TABLE public.castings 
ADD COLUMN results_published boolean DEFAULT false;