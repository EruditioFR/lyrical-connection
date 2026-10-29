-- Messagerie après 20261029100000_secure_messaging.sql : intégrité, copies propres à chaque participant,
-- pièces jointes privées, reprise des anciennes prises de contact.
\set ON_ERROR_STOP off
\o /dev/null
CREATE TEMP TABLE results (test text, got text, expected text);
GRANT ALL ON results TO authenticated, anon;
CREATE FUNCTION pg_temp.as_user(uid text) RETURNS void LANGUAGE sql AS $$ SELECT set_config('request.jwt.claim.sub', uid, false) $$;
-- A = professionnel, B = artiste, C = tiers
\set A '''aaaaaaaa-0000-4000-8000-000000000001'''
\set B '''bbbbbbbb-0000-4000-8000-000000000002'''
\set C '''cccccccc-0000-4000-8000-000000000003'''

-- Données reprises par la migration
INSERT INTO results SELECT 'Ancienne prise de contact livrée dans la messagerie de l''artiste', count(*)::text, '1'
  FROM mail_messages WHERE subject = 'Audition Carmen' AND recipient_id = 'bbbbbbbb-0000-4000-8000-000000000002';
INSERT INTO results SELECT 'Contact vers un compte sans utilisateur ignoré', count(*)::text, '0' FROM mail_messages WHERE subject = 'Perdu';
INSERT INTO results SELECT 'Ancien favori commun conservé des deux côtés', (is_starred_by_sender AND is_starred_by_recipient)::text, 'true'
  FROM mail_messages WHERE id = '00000000-0000-4000-8000-0000000000aa';
INSERT INTO results SELECT 'Espace des pièces jointes devenu privé', (NOT public)::text, 'true' FROM storage.buckets WHERE id = 'message-attachments';

SET ROLE authenticated;
SELECT pg_temp.as_user(:A);
-- L'expéditeur tente d'envoyer un message « déjà lu » et antidaté
INSERT INTO mail_messages (id, sender_id, recipient_id, subject, content, is_read, created_at, attachment_urls)
VALUES ('11111111-0000-4000-8000-000000000001', :A, :B, 'Contrat', 'Cachet : 2000 €', true, '2020-01-01',
        ARRAY['aaaaaaaa-0000-4000-8000-000000000001/1730000000000-contrat.pdf']);
INSERT INTO results SELECT 'Envoi : « lu » et date imposés par l''expéditeur ignorés', (NOT is_read AND created_at > '2025-01-01')::text, 'true'
  FROM mail_messages WHERE id = '11111111-0000-4000-8000-000000000001';

DO $$ BEGIN
  UPDATE mail_messages SET content = 'Cachet : 500 €' WHERE id = '11111111-0000-4000-8000-000000000001';
  INSERT INTO results VALUES ('Expéditeur réécrit le message après envoi', 'autorisé', 'refusé');
EXCEPTION WHEN insufficient_privilege THEN INSERT INTO results VALUES ('Expéditeur réécrit le message après envoi', 'refusé', 'refusé'); END $$;
DO $$ BEGIN
  UPDATE mail_messages SET is_read = true WHERE id = '11111111-0000-4000-8000-000000000001';
  INSERT INTO results VALUES ('Expéditeur marque « lu » à la place du destinataire', 'autorisé', 'refusé');
EXCEPTION WHEN insufficient_privilege THEN INSERT INTO results VALUES ('Expéditeur marque « lu » à la place du destinataire', 'refusé', 'refusé'); END $$;

SELECT pg_temp.as_user(:B);
DO $$ BEGIN
  UPDATE mail_messages SET sender_id = 'cccccccc-0000-4000-8000-000000000003' WHERE id = '11111111-0000-4000-8000-000000000001';
  INSERT INTO results VALUES ('Destinataire change l''expéditeur', 'autorisé', 'refusé');
EXCEPTION WHEN insufficient_privilege THEN INSERT INTO results VALUES ('Destinataire change l''expéditeur', 'refusé', 'refusé'); END $$;
DO $$ BEGIN
  UPDATE mail_messages SET content = 'falsifié' WHERE id = '11111111-0000-4000-8000-000000000001';
  INSERT INTO results VALUES ('Destinataire réécrit le texte', 'autorisé', 'refusé');
EXCEPTION WHEN insufficient_privilege THEN INSERT INTO results VALUES ('Destinataire réécrit le texte', 'refusé', 'refusé'); END $$;
UPDATE mail_messages SET is_read = true, read_at = now(), is_starred_by_recipient = true WHERE id = '11111111-0000-4000-8000-000000000001';
INSERT INTO results SELECT 'Destinataire marque lu et met en favori', (is_read AND is_starred_by_recipient)::text, 'true'
  FROM mail_messages WHERE id = '11111111-0000-4000-8000-000000000001';

-- Pièces jointes : le destinataire lit, un tiers non
RESET ROLE;
INSERT INTO storage.objects (bucket_id, name, owner) VALUES
  ('message-attachments', 'aaaaaaaa-0000-4000-8000-000000000001/1730000000000-contrat.pdf', 'aaaaaaaa-0000-4000-8000-000000000001'),
  ('message-attachments', '1600000000000-ancien.pdf', 'aaaaaaaa-0000-4000-8000-000000000001');
INSERT INTO mail_messages (sender_id, recipient_id, subject, content, attachment_urls) VALUES
  ('aaaaaaaa-0000-4000-8000-000000000001', 'bbbbbbbb-0000-4000-8000-000000000002', 'Ancien envoi', 'Pièce jointe à l''ancienne',
   ARRAY['https://x.supabase.co/storage/v1/object/public/message-attachments/1600000000000-ancien.pdf']);
SET ROLE authenticated;
SELECT pg_temp.as_user(:B);
INSERT INTO results SELECT 'Destinataire lit les pièces jointes (nouvelle et ancienne)', count(*)::text, '2' FROM storage.objects;
SELECT pg_temp.as_user(:C);
INSERT INTO results SELECT 'Un tiers ne lit aucune pièce jointe', count(*)::text, '0' FROM storage.objects;
DO $$ BEGIN
  INSERT INTO storage.objects (bucket_id, name) VALUES ('message-attachments', 'aaaaaaaa-0000-4000-8000-000000000001/intrus.pdf');
  INSERT INTO results VALUES ('Dépôt dans le dossier d''un autre', 'autorisé', 'refusé');
EXCEPTION WHEN insufficient_privilege THEN INSERT INTO results VALUES ('Dépôt dans le dossier d''un autre', 'refusé', 'refusé'); END $$;
INSERT INTO storage.objects (bucket_id, name) VALUES ('message-attachments', 'cccccccc-0000-4000-8000-000000000003/cv.pdf');
INSERT INTO results SELECT 'Dépôt dans son propre dossier', count(*)::text, '1' FROM storage.objects WHERE name LIKE 'cccccccc%';

-- Favori propre à chacun
SELECT pg_temp.as_user(:A);
INSERT INTO results SELECT 'Le favori du destinataire n''apparaît pas chez l''expéditeur', is_starred_by_sender::text, 'false'
  FROM mail_messages WHERE id = '11111111-0000-4000-8000-000000000001';

-- Réponse, puis suppressions définitives indépendantes
SELECT pg_temp.as_user(:B);
INSERT INTO mail_messages (id, sender_id, recipient_id, subject, content, reply_to_id)
VALUES ('22222222-0000-4000-8000-000000000002', :B, :A, 'Re: Contrat', 'D''accord', '11111111-0000-4000-8000-000000000001');
DO $$ BEGIN
  INSERT INTO results SELECT 'Suppression définitive sans passer par la corbeille', CASE WHEN purge_mail_messages(ARRAY['11111111-0000-4000-8000-000000000001']::uuid[]) = 0 THEN 'sans effet' ELSE 'effectuée' END, 'sans effet';
END $$;
UPDATE mail_messages SET is_deleted_by_recipient = true WHERE id = '11111111-0000-4000-8000-000000000001';
SELECT purge_mail_messages(ARRAY['11111111-0000-4000-8000-000000000001']::uuid[]);
INSERT INTO results SELECT 'Le destinataire ne voit plus le message supprimé définitivement', count(*)::text, '0'
  FROM mail_messages WHERE id = '11111111-0000-4000-8000-000000000001';
DO $$ BEGIN
  DELETE FROM mail_messages WHERE id = '22222222-0000-4000-8000-000000000002';
  INSERT INTO results SELECT 'Suppression directe d''une ligne', CASE WHEN EXISTS (SELECT 1 FROM mail_messages WHERE id = '22222222-0000-4000-8000-000000000002') THEN 'sans effet' ELSE 'effectuée' END, 'sans effet';
END $$;
SELECT pg_temp.as_user(:A);
INSERT INTO results SELECT 'L''expéditeur garde son message dans « Envoyés »', count(*)::text, '1'
  FROM mail_messages WHERE id = '11111111-0000-4000-8000-000000000001';
UPDATE mail_messages SET is_deleted_by_sender = true WHERE id = '11111111-0000-4000-8000-000000000001';
SELECT purge_mail_messages(ARRAY['11111111-0000-4000-8000-000000000001']::uuid[]);
RESET ROLE;
INSERT INTO results SELECT 'Supprimé des deux côtés : effacé de la base', count(*)::text, '0'
  FROM mail_messages WHERE id = '11111111-0000-4000-8000-000000000001';
INSERT INTO results SELECT 'La réponse survit, sans lien vers l''original', coalesce(reply_to_id::text, 'null'), 'null'
  FROM mail_messages WHERE id = '22222222-0000-4000-8000-000000000002';

SET ROLE authenticated;
SELECT pg_temp.as_user(:C);
INSERT INTO results SELECT 'Un tiers ne lit aucun message', count(*)::text, '0' FROM mail_messages;
RESET ROLE;

\o
SELECT CASE WHEN got IS NOT DISTINCT FROM expected THEN 'OK  ' ELSE 'FAIL' END AS r, test, got, expected FROM results;
