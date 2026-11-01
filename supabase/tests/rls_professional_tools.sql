-- RLS behaviour of the new migrations, with simulated users.
\set ON_ERROR_STOP off
\o /dev/null
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated;

-- Users: owner (pro A), juror (pro B), outsider (pro C), artist
INSERT INTO professional_profiles (id, user_id, company_name) VALUES
 ('a0000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'Opéra A'),
 ('a0000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000002', 'Festival B'),
 ('a0000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000003', 'Agence C');
INSERT INTO artist_profiles (id, user_id, stage_name, voice_type) VALUES
 ('b0000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'Soprano Test', 'Soprano');
INSERT INTO artist_photos (artist_profile_id, file_path, is_profile_photo) VALUES ('b0000000-0000-4000-8000-000000000001', 'x/photo.jpg', true);
INSERT INTO castings (id, professional_profile_id, title, is_active) VALUES ('c0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'Carmen', false);
INSERT INTO applications (id, casting_id, artist_profile_id) VALUES ('d0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001');
INSERT INTO custom_criteria (id, professional_profile_id, name) VALUES ('e0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'Voix');
INSERT INTO professional_artist_lists (id, professional_profile_id, name) VALUES ('f0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'Carmen 2027');
INSERT INTO professional_artist_list_items (list_id, artist_profile_id, role_name) VALUES ('f0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', 'Micaëla');
INSERT INTO professional_artist_notes (professional_profile_id, artist_profile_id, note) VALUES ('a0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', 'secret');

CREATE FUNCTION pg_temp.as_user(uid text) RETURNS void LANGUAGE sql AS $$ SELECT set_config('request.jwt.claim.sub', uid, false) $$;
CREATE TEMP TABLE results (test text, got text, expected text);
GRANT ALL ON results TO authenticated, anon;

-- === Lists & notes (migration 1) ===
SET ROLE authenticated;
SELECT pg_temp.as_user('10000000-0000-4000-8000-000000000003');
INSERT INTO results SELECT 'C ne voit pas les listes de A', count(*)::text, '0' FROM professional_artist_lists;
INSERT INTO results SELECT 'C ne voit pas les notes de A', count(*)::text, '0' FROM professional_artist_notes;
SELECT pg_temp.as_user('10000000-0000-4000-8000-000000000001');
INSERT INTO results SELECT 'A voit sa liste', count(*)::text, '1' FROM professional_artist_lists;
INSERT INTO results SELECT 'A voit sa note', count(*)::text, '1' FROM professional_artist_notes;
RESET ROLE;

-- === Availability ===
SET ROLE authenticated;
SELECT pg_temp.as_user('20000000-0000-4000-8000-000000000001');
INSERT INTO artist_unavailabilities (artist_profile_id, start_date, end_date, kind, title) VALUES ('b0000000-0000-4000-8000-000000000001', '2027-03-01', '2027-03-20', 'engagement', 'Carmen, Lyon');
INSERT INTO results SELECT 'Artiste ajoute une indisponibilité', count(*)::text, '1' FROM artist_unavailabilities;
SELECT pg_temp.as_user('10000000-0000-4000-8000-000000000003');
INSERT INTO results SELECT 'Pro connecté lit les disponibilités', count(*)::text, '1' FROM artist_unavailabilities;
DO $$ BEGIN
  INSERT INTO artist_unavailabilities (artist_profile_id, start_date, end_date) VALUES ('b0000000-0000-4000-8000-000000000001', '2027-01-01', '2027-01-02');
  INSERT INTO results VALUES ('Pro ne peut pas écrire l''agenda d''un artiste', 'autorisé', 'refusé');
EXCEPTION WHEN others THEN INSERT INTO results VALUES ('Pro ne peut pas écrire l''agenda d''un artiste', 'refusé', 'refusé'); END $$;
RESET ROLE;
SET ROLE anon;
SELECT pg_temp.as_user('');
INSERT INTO results SELECT 'Anonyme ne lit pas les disponibilités', count(*)::text, '0' FROM artist_unavailabilities;
RESET ROLE;
DO $$ BEGIN
  INSERT INTO artist_unavailabilities (artist_profile_id, start_date, end_date) VALUES ('b0000000-0000-4000-8000-000000000001', '2027-05-10', '2027-05-01');
  INSERT INTO results VALUES ('Fin avant début refusée', 'acceptée', 'refusée');
EXCEPTION WHEN check_violation THEN INSERT INTO results VALUES ('Fin avant début refusée', 'refusée', 'refusée'); END $$;

-- === Sharing ===
UPDATE professional_artist_lists SET share_token = '99999999-0000-4000-8000-000000000001';
SET ROLE anon;
INSERT INTO results SELECT 'Lien partagé : nom', get_shared_artist_list('99999999-0000-4000-8000-000000000001') ->> 'name', 'Carmen 2027';
INSERT INTO results SELECT 'Lien partagé : artiste et rôle', (get_shared_artist_list('99999999-0000-4000-8000-000000000001') -> 'items' -> 0 ->> 'stage_name') || ' / ' || (get_shared_artist_list('99999999-0000-4000-8000-000000000001') -> 'items' -> 0 ->> 'role_name'), 'Soprano Test / Micaëla';
INSERT INTO results SELECT 'Lien partagé : pas de notes privées', (get_shared_artist_list('99999999-0000-4000-8000-000000000001')::text LIKE '%secret%')::text, 'false';
INSERT INTO results SELECT 'Mauvais jeton : rien', coalesce(get_shared_artist_list('99999999-0000-4000-8000-000000000999')::text, 'null'), 'null';
INSERT INTO results SELECT 'Jeton nul : rien', coalesce(get_shared_artist_list(NULL)::text, 'null'), 'null';
RESET ROLE;

-- === Jury ===
SET ROLE authenticated;
SELECT pg_temp.as_user('10000000-0000-4000-8000-000000000002');
INSERT INTO results SELECT 'B (pas encore juré) ne voit pas le casting', count(*)::text, '0' FROM castings;
INSERT INTO results SELECT 'B ne voit pas les candidatures', count(*)::text, '0' FROM applications;
DO $$ BEGIN
  INSERT INTO casting_jury_members (casting_id, professional_profile_id) VALUES ('c0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000002');
  INSERT INTO results VALUES ('B ne peut pas s''ajouter lui-même au jury', 'autorisé', 'refusé');
EXCEPTION WHEN others THEN INSERT INTO results VALUES ('B ne peut pas s''ajouter lui-même au jury', 'refusé', 'refusé'); END $$;
SELECT pg_temp.as_user('10000000-0000-4000-8000-000000000001');
INSERT INTO casting_jury_members (casting_id, professional_profile_id) VALUES ('c0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000002');
INSERT INTO results SELECT 'A invite B', count(*)::text, '1' FROM casting_jury_members;
INSERT INTO candidate_scores (application_id, criteria_id, score, scored_by) VALUES ('d0000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000001', 15, '10000000-0000-4000-8000-000000000001');
-- Re-noter (upsert) le même critère : doit mettre à jour, pas échouer
INSERT INTO candidate_scores (application_id, criteria_id, score, scored_by) VALUES ('d0000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000001', 16, '10000000-0000-4000-8000-000000000001')
  ON CONFLICT (application_id, criteria_id, scored_by) DO UPDATE SET score = EXCLUDED.score;
INSERT INTO results SELECT 'A re-note (upsert)', string_agg(score::text, ','), '16' FROM candidate_scores;
SELECT pg_temp.as_user('10000000-0000-4000-8000-000000000002');
INSERT INTO results SELECT 'Juré B voit le casting', count(*)::text, '1' FROM castings;
INSERT INTO results SELECT 'Juré B voit la candidature', count(*)::text, '1' FROM applications;
INSERT INTO results SELECT 'Juré B voit les critères de A', count(*)::text, '1' FROM custom_criteria;
INSERT INTO candidate_scores (application_id, criteria_id, score, scored_by) VALUES ('d0000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000001', 12, '10000000-0000-4000-8000-000000000002');
INSERT INTO results SELECT 'Juré B note (en plus de A)', count(*)::text, '1' FROM candidate_scores WHERE scored_by = auth.uid();
INSERT INTO results SELECT 'Juré B ne voit pas la note de A', count(*)::text, '1' FROM candidate_scores;
DO $$ BEGIN
  INSERT INTO candidate_scores (application_id, criteria_id, score, scored_by) VALUES ('d0000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000001', 20, '10000000-0000-4000-8000-000000000001');
  INSERT INTO results VALUES ('B ne peut pas noter au nom de A', 'autorisé', 'refusé');
EXCEPTION WHEN others THEN INSERT INTO results VALUES ('B ne peut pas noter au nom de A', 'refusé', 'refusé'); END $$;
DO $$ BEGIN
  INSERT INTO custom_criteria (professional_profile_id, name) VALUES ('a0000000-0000-4000-8000-000000000001', 'Pirate');
  INSERT INTO results VALUES ('B ne peut pas modifier les critères de A', 'autorisé', 'refusé');
EXCEPTION WHEN others THEN INSERT INTO results VALUES ('B ne peut pas modifier les critères de A', 'refusé', 'refusé'); END $$;
SELECT pg_temp.as_user('10000000-0000-4000-8000-000000000001');
INSERT INTO results SELECT 'A voit les notes de tous les jurés', string_agg(score::text, ',' ORDER BY score), '12,16' FROM candidate_scores;
SELECT pg_temp.as_user('10000000-0000-4000-8000-000000000003');
INSERT INTO results SELECT 'C (non juré) ne voit aucune note', count(*)::text, '0' FROM candidate_scores;
INSERT INTO results SELECT 'C ne voit pas le jury', count(*)::text, '0' FROM casting_jury_members;
SELECT pg_temp.as_user('10000000-0000-4000-8000-000000000002');
DELETE FROM casting_jury_members WHERE professional_profile_id = 'a0000000-0000-4000-8000-000000000002';
INSERT INTO results SELECT 'B quitte le jury puis ne voit plus le casting', count(*)::text, '0' FROM castings;
RESET ROLE;

\o
SELECT CASE WHEN got IS NOT DISTINCT FROM expected THEN 'OK  ' ELSE 'FAIL' END AS r, test, got, expected FROM results;
