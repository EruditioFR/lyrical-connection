
-- Supprimer les politiques existantes qui causent la récursion infinie
DROP POLICY IF EXISTS "Users can view conversations they participate in" ON public.conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can update conversations they participate in" ON public.conversations;
DROP POLICY IF EXISTS "Users can view their conversation participations" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can create conversation participations" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can update their conversation participations" ON public.conversation_participants;

-- Créer des politiques simplifiées pour éviter la récursion
-- Politiques pour la table conversations
CREATE POLICY "Users can view conversations they participate in" 
ON public.conversations FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants cp 
    WHERE cp.conversation_id = conversations.id 
    AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create conversations" 
ON public.conversations FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update conversations they participate in" 
ON public.conversations FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants cp 
    WHERE cp.conversation_id = conversations.id 
    AND cp.user_id = auth.uid()
  )
);

-- Politiques pour la table conversation_participants  
CREATE POLICY "Users can view conversation participants" 
ON public.conversation_participants FOR SELECT 
USING (
  user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.conversation_participants cp2 
    WHERE cp2.conversation_id = conversation_participants.conversation_id 
    AND cp2.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create conversation participants" 
ON public.conversation_participants FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.conversations c 
    WHERE c.id = conversation_id 
    AND c.created_by = auth.uid()
  )
);

CREATE POLICY "Users can update their own participation" 
ON public.conversation_participants FOR UPDATE 
USING (user_id = auth.uid());
