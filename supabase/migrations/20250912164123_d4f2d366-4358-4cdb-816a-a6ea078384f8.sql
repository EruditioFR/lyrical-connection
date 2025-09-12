-- Remove old scoring system tables
DROP TABLE IF EXISTS tenant_scoring_criteria CASCADE;
DROP TABLE IF EXISTS application_scores CASCADE;
DROP TABLE IF EXISTS casting_scoring_criteria CASCADE;

-- Create custom criteria table for professionals
CREATE TABLE public.custom_criteria (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    professional_profile_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create candidate scores table
CREATE TABLE public.candidate_scores (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    application_id UUID NOT NULL,
    criteria_id UUID NOT NULL,
    score INTEGER NOT NULL CHECK (score >= 1 AND score <= 20),
    comments TEXT,
    scored_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(application_id, criteria_id)
);

-- Enable RLS
ALTER TABLE public.custom_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_scores ENABLE ROW LEVEL SECURITY;

-- RLS policies for custom_criteria
CREATE POLICY "Professionals can manage their own criteria"
ON public.custom_criteria
FOR ALL
USING (EXISTS (
    SELECT 1 FROM professional_profiles 
    WHERE id = custom_criteria.professional_profile_id 
    AND user_id = auth.uid()
))
WITH CHECK (EXISTS (
    SELECT 1 FROM professional_profiles 
    WHERE id = custom_criteria.professional_profile_id 
    AND user_id = auth.uid()
));

-- RLS policies for candidate_scores
CREATE POLICY "Professionals can score applications to their castings"
ON public.candidate_scores
FOR ALL
USING (EXISTS (
    SELECT 1 FROM applications a
    JOIN castings c ON c.id = a.casting_id
    JOIN professional_profiles pp ON pp.id = c.professional_profile_id
    WHERE a.id = candidate_scores.application_id
    AND pp.user_id = auth.uid()
))
WITH CHECK (EXISTS (
    SELECT 1 FROM applications a
    JOIN castings c ON c.id = a.casting_id
    JOIN professional_profiles pp ON pp.id = c.professional_profile_id
    WHERE a.id = candidate_scores.application_id
    AND pp.user_id = auth.uid()
    AND candidate_scores.scored_by = auth.uid()
));

-- Add foreign key constraints
ALTER TABLE public.custom_criteria
ADD CONSTRAINT fk_custom_criteria_professional_profile
FOREIGN KEY (professional_profile_id) REFERENCES professional_profiles(id) ON DELETE CASCADE;

ALTER TABLE public.candidate_scores
ADD CONSTRAINT fk_candidate_scores_application
FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE;

ALTER TABLE public.candidate_scores
ADD CONSTRAINT fk_candidate_scores_criteria
FOREIGN KEY (criteria_id) REFERENCES custom_criteria(id) ON DELETE CASCADE;

-- Add indexes for performance
CREATE INDEX idx_custom_criteria_professional_profile ON custom_criteria(professional_profile_id);
CREATE INDEX idx_candidate_scores_application ON candidate_scores(application_id);
CREATE INDEX idx_candidate_scores_criteria ON candidate_scores(criteria_id);

-- Add trigger for updated_at
CREATE TRIGGER update_custom_criteria_updated_at
    BEFORE UPDATE ON public.custom_criteria
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_candidate_scores_updated_at
    BEFORE UPDATE ON public.candidate_scores
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();