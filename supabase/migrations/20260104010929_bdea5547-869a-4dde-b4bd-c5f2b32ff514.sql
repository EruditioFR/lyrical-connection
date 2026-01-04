-- Add contest_status field to contest_evaluations
ALTER TABLE public.contest_evaluations 
ADD COLUMN IF NOT EXISTS contest_status text NOT NULL DEFAULT 'pending';

-- Add comment explaining the statuses
COMMENT ON COLUMN public.contest_evaluations.contest_status IS 'Candidate status: pending, shortlisted (Top 24), rejected';

-- Create index for faster status queries
CREATE INDEX IF NOT EXISTS idx_contest_evaluations_status ON public.contest_evaluations(contest_id, contest_status);