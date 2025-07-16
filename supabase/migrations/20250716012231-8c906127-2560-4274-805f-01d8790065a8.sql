-- Supprimer et recréer la politique de vue pour conversations avec la nouvelle logique
DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversations;

CREATE POLICY "Users can view their conversations" 
ON public.conversations 
FOR SELECT 
USING (created_by = auth.uid() OR public.user_can_access_conversation(id, auth.uid()));