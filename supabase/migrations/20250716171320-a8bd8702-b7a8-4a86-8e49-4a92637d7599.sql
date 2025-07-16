-- Corriger les politiques RLS pour mail_messages
-- Supprimer les politiques existantes qui posent problème
DROP POLICY IF EXISTS "Users can update their received messages" ON mail_messages;

-- Créer des politiques plus spécifiques pour chaque type d'opération
CREATE POLICY "Recipients can update message status" ON mail_messages
FOR UPDATE 
USING (recipient_id = auth.uid())
WITH CHECK (recipient_id = auth.uid());

CREATE POLICY "Senders can update message status" ON mail_messages
FOR UPDATE 
USING (sender_id = auth.uid())
WITH CHECK (sender_id = auth.uid());