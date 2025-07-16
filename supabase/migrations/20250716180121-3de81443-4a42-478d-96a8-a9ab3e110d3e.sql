
-- Créer un bucket pour les pièces jointes des messages
INSERT INTO storage.buckets (id, name, public)
VALUES ('message-attachments', 'message-attachments', true);

-- Créer une politique pour permettre aux utilisateurs authentifiés d'uploader des fichiers
CREATE POLICY "Authenticated users can upload message attachments"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'message-attachments' AND auth.uid() IS NOT NULL);

-- Créer une politique pour permettre à tous de télécharger les pièces jointes (car elles sont dans des messages)
CREATE POLICY "Anyone can download message attachments"
ON storage.objects FOR SELECT
USING (bucket_id = 'message-attachments');

-- Créer une politique pour permettre aux utilisateurs de supprimer leurs propres fichiers
CREATE POLICY "Users can delete their own message attachments"
ON storage.objects FOR DELETE
USING (bucket_id = 'message-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);
