-- Messagerie interne : intégrité, données propres à chaque participant, pièces jointes privées,
-- reprise des prises de contact qui n'arrivaient jamais chez les artistes.

------------------------------------------------------------------------------
-- 1. Favori et suppression définitive propres à chaque participant
------------------------------------------------------------------------------
ALTER TABLE public.mail_messages
  ADD COLUMN is_starred_by_sender BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN is_starred_by_recipient BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN is_purged_by_sender BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN is_purged_by_recipient BOOLEAN NOT NULL DEFAULT false;

-- L'ancien favori était commun : on ne sait pas qui l'a posé, on le conserve des deux côtés
UPDATE public.mail_messages SET is_starred_by_sender = is_starred, is_starred_by_recipient = is_starred WHERE is_starred;

-- Supprimer un message auquel on a répondu ne doit plus être bloqué par la réponse
DO $$
DECLARE c RECORD;
BEGIN
  FOR c IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'public.mail_messages'::regclass AND contype = 'f'
      AND confrelid = 'public.mail_messages'::regclass
  LOOP
    EXECUTE format('ALTER TABLE public.mail_messages DROP CONSTRAINT %I', c.conname);
  END LOOP;
END $$;
ALTER TABLE public.mail_messages
  ADD CONSTRAINT mail_messages_reply_to_id_fkey
  FOREIGN KEY (reply_to_id) REFERENCES public.mail_messages(id) ON DELETE SET NULL;

------------------------------------------------------------------------------
-- 2. Intégrité : un message envoyé ne change plus ; chacun ne modifie que ses indicateurs
------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.guard_mail_message_insert()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  -- Les requêtes sans utilisateur (maintenance, service) ne sont pas concernées
  IF auth.uid() IS NULL THEN RETURN NEW; END IF;
  IF char_length(NEW.subject) > 300 OR char_length(NEW.content) > 20000 THEN
    RAISE EXCEPTION 'Message trop long' USING ERRCODE = '22001';
  END IF;
  -- L'expéditeur ne décide pas de l'état du message chez le destinataire
  NEW.is_read := false;
  NEW.read_at := NULL;
  NEW.is_deleted_by_recipient := false;
  NEW.is_starred_by_recipient := false;
  NEW.is_purged_by_recipient := false;
  NEW.is_deleted_by_sender := false;
  NEW.is_purged_by_sender := false;
  NEW.created_at := now();
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.guard_mail_message_update()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE uid UUID := auth.uid();
BEGIN
  IF uid IS NULL THEN RETURN NEW; END IF;

  IF NEW.sender_id IS DISTINCT FROM OLD.sender_id
     OR NEW.recipient_id IS DISTINCT FROM OLD.recipient_id
     OR NEW.subject IS DISTINCT FROM OLD.subject
     OR NEW.content IS DISTINCT FROM OLD.content
     OR NEW.attachment_urls IS DISTINCT FROM OLD.attachment_urls
     OR NEW.created_at IS DISTINCT FROM OLD.created_at
     -- seule la mise à NULL automatique (message d'origine supprimé) est permise
     OR (NEW.reply_to_id IS DISTINCT FROM OLD.reply_to_id AND NEW.reply_to_id IS NOT NULL) THEN
    RAISE EXCEPTION 'Un message envoyé ne peut pas être modifié' USING ERRCODE = '42501';
  END IF;

  IF uid IS DISTINCT FROM OLD.recipient_id AND (
       NEW.is_read IS DISTINCT FROM OLD.is_read
    OR NEW.read_at IS DISTINCT FROM OLD.read_at
    OR NEW.is_deleted_by_recipient IS DISTINCT FROM OLD.is_deleted_by_recipient
    OR NEW.is_starred_by_recipient IS DISTINCT FROM OLD.is_starred_by_recipient
    OR NEW.is_purged_by_recipient IS DISTINCT FROM OLD.is_purged_by_recipient) THEN
    RAISE EXCEPTION 'Seul le destinataire peut modifier ces informations' USING ERRCODE = '42501';
  END IF;

  IF uid IS DISTINCT FROM OLD.sender_id AND (
       NEW.is_deleted_by_sender IS DISTINCT FROM OLD.is_deleted_by_sender
    OR NEW.is_starred_by_sender IS DISTINCT FROM OLD.is_starred_by_sender
    OR NEW.is_purged_by_sender IS DISTINCT FROM OLD.is_purged_by_sender) THEN
    RAISE EXCEPTION 'Seul l''expéditeur peut modifier ces informations' USING ERRCODE = '42501';
  END IF;

  -- On ne supprime définitivement que depuis sa corbeille, et on ne revient pas en arrière
  IF (NEW.is_purged_by_sender AND NOT NEW.is_deleted_by_sender)
     OR (NEW.is_purged_by_recipient AND NOT NEW.is_deleted_by_recipient)
     OR (OLD.is_purged_by_sender AND NOT NEW.is_purged_by_sender)
     OR (OLD.is_purged_by_recipient AND NOT NEW.is_purged_by_recipient) THEN
    RAISE EXCEPTION 'Suppression définitive invalide' USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END $$;

-- Le message n'est effacé de la base que lorsque les deux participants l'ont supprimé définitivement
CREATE OR REPLACE FUNCTION public.delete_fully_purged_mail_message()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.is_purged_by_sender AND NEW.is_purged_by_recipient THEN
    DELETE FROM public.mail_messages WHERE id = NEW.id;
  END IF;
  RETURN NULL;
END $$;

DROP TRIGGER IF EXISTS guard_mail_message_insert ON public.mail_messages;
CREATE TRIGGER guard_mail_message_insert
BEFORE INSERT ON public.mail_messages
FOR EACH ROW EXECUTE FUNCTION public.guard_mail_message_insert();

DROP TRIGGER IF EXISTS guard_mail_message_update ON public.mail_messages;
CREATE TRIGGER guard_mail_message_update
BEFORE UPDATE ON public.mail_messages
FOR EACH ROW EXECUTE FUNCTION public.guard_mail_message_update();

DROP TRIGGER IF EXISTS delete_fully_purged_mail_message ON public.mail_messages;
CREATE TRIGGER delete_fully_purged_mail_message
AFTER UPDATE OF is_purged_by_sender, is_purged_by_recipient ON public.mail_messages
FOR EACH ROW EXECUTE FUNCTION public.delete_fully_purged_mail_message();

-- Plus de suppression directe : elle effaçait le message chez l'autre participant
DROP POLICY IF EXISTS "Users can permanently delete their trashed messages" ON public.mail_messages;

-- Suppression définitive de SA copie, depuis sa corbeille. Fonction dédiée : une mise à jour directe
-- serait refusée, car la ligne deviendrait invisible pour son auteur (politique de lecture ci-dessous).
CREATE OR REPLACE FUNCTION public.purge_mail_messages(p_ids UUID[])
RETURNS INTEGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid UUID := auth.uid();
  n INTEGER;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Utilisateur non connecté' USING ERRCODE = '42501'; END IF;
  UPDATE mail_messages SET
    is_purged_by_sender = is_purged_by_sender OR (sender_id = uid AND is_deleted_by_sender),
    is_purged_by_recipient = is_purged_by_recipient OR (recipient_id = uid AND is_deleted_by_recipient)
  WHERE id = ANY(p_ids)
    AND ((sender_id = uid AND is_deleted_by_sender) OR (recipient_id = uid AND is_deleted_by_recipient));
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END $$;

REVOKE ALL ON FUNCTION public.purge_mail_messages(UUID[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.purge_mail_messages(UUID[]) TO authenticated;

-- Un message supprimé définitivement n'est plus visible de celui qui l'a supprimé
DROP POLICY IF EXISTS "Users can view own messages (inbox, sent, trash)" ON public.mail_messages;
CREATE POLICY "Users can view their own copy of messages"
ON public.mail_messages
FOR SELECT
USING (
  (sender_id = auth.uid() AND NOT is_purged_by_sender)
  OR (recipient_id = auth.uid() AND NOT is_purged_by_recipient)
);

------------------------------------------------------------------------------
-- 3. Pièces jointes privées
------------------------------------------------------------------------------
UPDATE storage.buckets SET public = false WHERE id = 'message-attachments';

DROP POLICY IF EXISTS "Anyone can download message attachments" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload message attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own message attachments" ON storage.objects;

-- Dépôt uniquement dans son propre dossier : <id utilisateur>/<fichier>
CREATE POLICY "Users upload message attachments to their own folder"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'message-attachments' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Lecture : l'auteur du fichier, ou un participant d'un message qui le cite
-- (les anciens messages citent l'URL publique complète, les nouveaux le chemin)
CREATE POLICY "Message participants can read attachments"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'message-attachments' AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR owner = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.mail_messages m, unnest(m.attachment_urls) AS a(ref)
      WHERE (m.sender_id = auth.uid() OR m.recipient_id = auth.uid())
        AND (a.ref = storage.objects.name OR a.ref LIKE '%/message-attachments/' || storage.objects.name)
    )
  )
);

CREATE POLICY "Users delete their own message attachments"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'message-attachments'
  AND ((storage.foldername(name))[1] = auth.uid()::text OR owner = auth.uid())
);

------------------------------------------------------------------------------
-- 4. Prises de contact restées dans professional_contacts : livrées dans la messagerie
------------------------------------------------------------------------------
INSERT INTO public.mail_messages (sender_id, recipient_id, subject, content, is_read, read_at, created_at, updated_at)
SELECT pp.user_id, ap.user_id, pc.subject, pc.message, pc.viewed_at IS NOT NULL, pc.viewed_at, pc.created_at, pc.created_at
FROM public.professional_contacts pc
JOIN public.professional_profiles pp ON pp.id = pc.professional_profile_id
JOIN public.artist_profiles ap ON ap.id = pc.artist_profile_id
WHERE pp.user_id IS NOT NULL
  AND ap.user_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.mail_messages m
    WHERE m.sender_id = pp.user_id AND m.recipient_id = ap.user_id
      AND m.subject = pc.subject AND m.content = pc.message
  );
