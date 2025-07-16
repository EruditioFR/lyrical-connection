-- Étape 1: Supprimer toutes les politiques RLS existantes pour conversations, conversation_participants et messages
DROP POLICY IF EXISTS "Users can view conversations they participate in" ON public.conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Participants can update conversations" ON public.conversations;

DROP POLICY IF EXISTS "Users can view participants of their conversations" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can join conversations" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can update their own participation" ON public.conversation_participants;

DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages to their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;

-- Étape 2: Créer une fonction helper sécurisée pour éviter la récursion
CREATE OR REPLACE FUNCTION public.user_can_access_conversation(conversation_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.conversation_participants 
    WHERE conversation_participants.conversation_id = $1 
      AND conversation_participants.user_id = $2 
      AND conversation_participants.left_at IS NULL
  );
$$;

-- Étape 3: Créer des politiques RLS non-récursives pour conversations
CREATE POLICY "Users can view their conversations" 
ON public.conversations 
FOR SELECT 
USING (created_by = auth.uid() OR public.user_can_access_conversation(id, auth.uid()));

CREATE POLICY "Users can create conversations" 
ON public.conversations 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins can update conversations" 
ON public.conversations 
FOR UPDATE 
USING (public.user_can_access_conversation(id, auth.uid()));

-- Étape 4: Créer des politiques RLS pour conversation_participants
CREATE POLICY "Users can view conversation participants" 
ON public.conversation_participants 
FOR SELECT 
USING (user_id = auth.uid() OR public.user_can_access_conversation(conversation_id, auth.uid()));

CREATE POLICY "Users can join conversations" 
ON public.conversation_participants 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their participation" 
ON public.conversation_participants 
FOR UPDATE 
USING (user_id = auth.uid());

-- Étape 5: Créer des politiques RLS pour messages
CREATE POLICY "Users can view messages in their conversations" 
ON public.messages 
FOR SELECT 
USING (public.user_can_access_conversation(conversation_id, auth.uid()));

CREATE POLICY "Users can send messages" 
ON public.messages 
FOR INSERT 
WITH CHECK (sender_id = auth.uid() AND public.user_can_access_conversation(conversation_id, auth.uid()));

CREATE POLICY "Users can update their messages" 
ON public.messages 
FOR UPDATE 
USING (sender_id = auth.uid());