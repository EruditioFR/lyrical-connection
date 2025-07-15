-- Supprimer la politique restrictive et créer une politique plus permissive pour les notifications
DROP POLICY IF EXISTS "Allow notification creation" ON public.notifications;

-- Créer une politique qui permet au système de créer des notifications en utilisant le service role
CREATE POLICY "System can create notifications via service role" 
ON public.notifications 
FOR INSERT 
WITH CHECK (true);