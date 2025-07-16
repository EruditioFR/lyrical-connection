-- Corriger la politique INSERT pour conversation_participants
-- Permettre aux créateurs de conversations d'ajouter des participants
DROP POLICY IF EXISTS "Users can join conversations" ON public.conversation_participants;

CREATE POLICY "Users can join conversations" 
ON public.conversation_participants 
FOR INSERT 
WITH CHECK (
  user_id = auth.uid() 
  OR 
  EXISTS (
    SELECT 1 
    FROM public.conversations 
    WHERE conversations.id = conversation_participants.conversation_id 
      AND conversations.created_by = auth.uid()
  )
);