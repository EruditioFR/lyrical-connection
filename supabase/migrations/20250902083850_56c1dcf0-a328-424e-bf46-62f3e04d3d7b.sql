-- Create payments table for comprehensive payment management
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_payment_id TEXT UNIQUE,
  amount INTEGER NOT NULL, -- Amount in cents
  currency TEXT NOT NULL DEFAULT 'eur',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled', 'refunded')),
  payment_type TEXT NOT NULL CHECK (payment_type IN ('subscription', 'premium_visibility', 'one_time', 'upgrade_request')),
  metadata JSONB DEFAULT '{}',
  related_id UUID, -- Can reference upgrade_requests, subscriptions, etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own payments" ON public.payments
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all payments" ON public.payments
FOR SELECT
USING (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "System can manage payments" ON public.payments
FOR ALL
USING (true);

-- Create indexes for better performance
CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_payments_stripe_id ON public.payments(stripe_payment_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_payments_created_at ON public.payments(created_at DESC);

-- Create trigger for updating updated_at
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();