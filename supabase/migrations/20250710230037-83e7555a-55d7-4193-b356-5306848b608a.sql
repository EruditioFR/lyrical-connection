-- Créer le bucket pour les images d'artistes
INSERT INTO storage.buckets (id, name, public) 
VALUES ('artist-images', 'artist-images', true);

-- Créer des politiques permissives pour le bucket
CREATE POLICY "Allow public access to artist images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'artist-images');

CREATE POLICY "Allow authenticated users to upload artist images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'artist-images' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update artist images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'artist-images' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete artist images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'artist-images' AND auth.role() = 'authenticated');