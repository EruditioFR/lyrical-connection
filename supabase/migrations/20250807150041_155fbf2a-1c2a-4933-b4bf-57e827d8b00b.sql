-- Create composers table
CREATE TABLE public.composers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  openopus_id TEXT UNIQUE,
  name TEXT NOT NULL,
  complete_name TEXT,
  birth_year INTEGER,
  death_year INTEGER,
  epoch TEXT,
  portrait_url TEXT,
  biography TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add OpenOpus integration fields to lyrical_works
ALTER TABLE public.lyrical_works 
ADD COLUMN openopus_id TEXT UNIQUE,
ADD COLUMN openopus_work_id TEXT,
ADD COLUMN composer_id UUID REFERENCES public.composers(id),
ADD COLUMN genre TEXT,
ADD COLUMN catalogue_number TEXT,
ADD COLUMN recommended_recording TEXT,
ADD COLUMN external_urls JSONB DEFAULT '{}';

-- Enable RLS on composers table
ALTER TABLE public.composers ENABLE ROW LEVEL SECURITY;

-- Create policies for composers table
CREATE POLICY "Anyone can view composers" 
ON public.composers 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage composers" 
ON public.composers 
FOR ALL 
WITH CHECK (auth.uid() IS NOT NULL);

-- Create trigger for composers updated_at
CREATE TRIGGER update_composers_updated_at
BEFORE UPDATE ON public.composers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_composers_openopus_id ON public.composers(openopus_id);
CREATE INDEX idx_lyrical_works_openopus_id ON public.lyrical_works(openopus_id);
CREATE INDEX idx_lyrical_works_composer_id ON public.lyrical_works(composer_id);