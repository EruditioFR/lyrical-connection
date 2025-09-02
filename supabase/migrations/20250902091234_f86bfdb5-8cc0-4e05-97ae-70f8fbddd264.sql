-- Supprimer l'ancienne contrainte d'unicité
ALTER TABLE public.artist_repertoire 
DROP CONSTRAINT IF EXISTS artist_repertoire_artist_profile_id_work_id_role_id_key;

-- Ajouter une nouvelle contrainte d'unicité incluant l'année et le lieu
ALTER TABLE public.artist_repertoire 
ADD CONSTRAINT artist_repertoire_unique_performance 
UNIQUE (artist_profile_id, work_id, role_id, performance_year, venue);