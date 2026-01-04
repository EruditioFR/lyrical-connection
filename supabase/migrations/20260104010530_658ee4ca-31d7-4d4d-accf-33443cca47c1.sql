-- Drop existing foreign key and recreate with professional_events
ALTER TABLE contest_evaluations DROP CONSTRAINT IF EXISTS contest_evaluations_contest_id_fkey;

-- Rename column for clarity (contest_id refers to professional_events.id now)
-- Add new foreign key constraint
ALTER TABLE contest_evaluations 
ADD CONSTRAINT contest_evaluations_contest_id_fkey 
FOREIGN KEY (contest_id) REFERENCES professional_events(id) ON DELETE CASCADE;

-- Drop old RLS policies
DROP POLICY IF EXISTS "Jurys can create evaluations for their contests" ON contest_evaluations;
DROP POLICY IF EXISTS "Jurys can view their own evaluations" ON contest_evaluations;
DROP POLICY IF EXISTS "Jurys can update their own evaluations" ON contest_evaluations;
DROP POLICY IF EXISTS "Jurys can delete their own evaluations" ON contest_evaluations;
DROP POLICY IF EXISTS "Organizers can view all evaluations for their contests" ON contest_evaluations;

-- Create new RLS policies for professional_events
CREATE POLICY "Jurys can create evaluations for their contests"
ON contest_evaluations FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM professional_profiles pp
    JOIN professional_events pe ON pe.professional_profile_id = pp.id
    WHERE pp.user_id = auth.uid() 
    AND pe.id = contest_evaluations.contest_id
    AND pe.event_type = 'concours'
  )
);

CREATE POLICY "Jurys can view their own evaluations"
ON contest_evaluations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM professional_profiles pp
    WHERE pp.user_id = auth.uid() AND pp.id = contest_evaluations.evaluator_id
  )
);

CREATE POLICY "Jurys can update their own evaluations"
ON contest_evaluations FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM professional_profiles pp
    WHERE pp.user_id = auth.uid() AND pp.id = contest_evaluations.evaluator_id
  )
);

CREATE POLICY "Jurys can delete their own evaluations"
ON contest_evaluations FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM professional_profiles pp
    WHERE pp.user_id = auth.uid() AND pp.id = contest_evaluations.evaluator_id
  )
);

CREATE POLICY "Organizers can view all evaluations for their contests"
ON contest_evaluations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM professional_profiles pp
    JOIN professional_events pe ON pe.professional_profile_id = pp.id
    WHERE pp.user_id = auth.uid() AND pe.id = contest_evaluations.contest_id
  )
);