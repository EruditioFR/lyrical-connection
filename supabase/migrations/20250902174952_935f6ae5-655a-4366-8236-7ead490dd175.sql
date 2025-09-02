-- Create premium_visibility_subscriptions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.premium_visibility_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_type TEXT NOT NULL CHECK (profile_type IN ('artist', 'professional')),
  profile_id UUID NOT NULL,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.premium_visibility_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for the premium_visibility_subscriptions table
CREATE POLICY "Users can view their own premium subscriptions" 
ON public.premium_visibility_subscriptions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Edge functions can manage premium subscriptions" 
ON public.premium_visibility_subscriptions 
FOR ALL 
USING (true);

-- Add premium visibility fields to artist_profiles if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'artist_profiles' 
                 AND column_name = 'public_visibility_premium') THEN
    ALTER TABLE public.artist_profiles 
    ADD COLUMN public_visibility_premium BOOLEAN DEFAULT FALSE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'artist_profiles' 
                 AND column_name = 'premium_subscription_end') THEN
    ALTER TABLE public.artist_profiles 
    ADD COLUMN premium_subscription_end TIMESTAMPTZ;
  END IF;
END
$$;

-- Add premium visibility fields to professional_profiles if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'professional_profiles' 
                 AND column_name = 'public_visibility_premium') THEN
    ALTER TABLE public.professional_profiles 
    ADD COLUMN public_visibility_premium BOOLEAN DEFAULT FALSE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'professional_profiles' 
                 AND column_name = 'premium_subscription_end') THEN
    ALTER TABLE public.professional_profiles 
    ADD COLUMN premium_subscription_end TIMESTAMPTZ;
  END IF;
END
$$;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_premium_subscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_premium_subscription_updated_at_trigger ON public.premium_visibility_subscriptions;
CREATE TRIGGER update_premium_subscription_updated_at_trigger
    BEFORE UPDATE ON public.premium_visibility_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_premium_subscription_updated_at();