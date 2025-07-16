-- Vérifier et corriger les politiques RLS pour mail_messages
-- D'abord supprimer toutes les politiques UPDATE existantes
DROP POLICY IF EXISTS "Recipients can update message status" ON mail_messages;
DROP POLICY IF EXISTS "Senders can update message status" ON mail_messages;
DROP POLICY IF EXISTS "Users can update their received messages" ON mail_messages;
DROP POLICY IF EXISTS "Users can update their sent messages" ON mail_messages;

-- Créer une seule politique UPDATE globale plus permissive
CREATE POLICY "Users can update message status" ON mail_messages
FOR UPDATE 
USING ((sender_id = auth.uid()) OR (recipient_id = auth.uid()))
WITH CHECK ((sender_id = auth.uid()) OR (recipient_id = auth.uid()));