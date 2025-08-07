-- Sync existing composer names with the composers table
-- Update composer_id in lyrical_works based on composer name matches

UPDATE lyrical_works 
SET composer_id = composers.id
FROM composers
WHERE lyrical_works.composer = composers.name
  AND lyrical_works.composer_id IS NULL;

-- Create an index on composer name for better performance
CREATE INDEX IF NOT EXISTS idx_composers_name ON composers(name);

-- Create an index on lyrical_works composer for better performance  
CREATE INDEX IF NOT EXISTS idx_lyrical_works_composer ON lyrical_works(composer);

-- Add a trigger to automatically sync composer_id when a lyrical work is inserted or updated
CREATE OR REPLACE FUNCTION sync_composer_id()
RETURNS TRIGGER AS $$
BEGIN
    -- Try to find matching composer by name
    SELECT id INTO NEW.composer_id
    FROM composers
    WHERE name = NEW.composer
    LIMIT 1;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic sync
DROP TRIGGER IF EXISTS trigger_sync_composer_id ON lyrical_works;
CREATE TRIGGER trigger_sync_composer_id
    BEFORE INSERT OR UPDATE ON lyrical_works
    FOR EACH ROW
    EXECUTE FUNCTION sync_composer_id();