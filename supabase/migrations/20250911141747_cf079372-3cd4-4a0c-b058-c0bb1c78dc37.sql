-- Fix RLS to allow viewing and deleting trashed messages
-- 1) Broaden SELECT to include trashed messages for the current user
DROP POLICY IF EXISTS "Users can view messages they sent or received" ON public.mail_messages;

CREATE POLICY "Users can view own messages (inbox, sent, trash)"
ON public.mail_messages
FOR SELECT
USING (
  sender_id = auth.uid() OR recipient_id = auth.uid()
);

-- 2) Allow permanent deletion of messages that are in the user's trash
CREATE POLICY "Users can permanently delete their trashed messages"
ON public.mail_messages
FOR DELETE
USING (
  (sender_id = auth.uid() AND is_deleted_by_sender = true)
  OR
  (recipient_id = auth.uid() AND is_deleted_by_recipient = true)
);