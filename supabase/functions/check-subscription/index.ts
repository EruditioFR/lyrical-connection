import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Get Stripe customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length === 0) {
      logStep("No Stripe customer found");
      return new Response(JSON.stringify({ 
        subscribed: false, 
        subscription: null 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Stripe customer found", { customerId });

    // Get active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    let subscriptionData = null;
    if (subscriptions.data.length > 0) {
      const stripeSubscription = subscriptions.data[0];
      logStep("Active subscription found", { subscriptionId: stripeSubscription.id });

      // Get plan details from Stripe price
      const priceId = stripeSubscription.items.data[0].price.id;
      const { data: plan } = await supabaseClient
        .from('subscription_plans')
        .select('*')
        .eq('stripe_price_id', priceId)
        .single();

      // Update or create subscription record
      const subscriptionRecord = {
        user_id: user.id,
        plan_id: plan?.id,
        stripe_customer_id: customerId,
        stripe_subscription_id: stripeSubscription.id,
        status: stripeSubscription.status,
        current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
        trial_end: stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000).toISOString() : null,
        updated_at: new Date().toISOString(),
      };

      const { data: existingSubscription } = await supabaseClient
        .from('subscriptions')
        .select('*')
        .eq('stripe_subscription_id', stripeSubscription.id)
        .single();

      if (existingSubscription) {
        await supabaseClient
          .from('subscriptions')
          .update(subscriptionRecord)
          .eq('id', existingSubscription.id);
      } else {
        await supabaseClient
          .from('subscriptions')
          .insert(subscriptionRecord);
      }

      subscriptionData = {
        ...subscriptionRecord,
        plan
      };
    } else {
      logStep("No active subscription found");
      
      // Update any existing subscription to inactive
      await supabaseClient
        .from('subscriptions')
        .update({ status: 'inactive' })
        .eq('user_id', user.id)
        .eq('status', 'active');
    }

    return new Response(JSON.stringify({
      subscribed: !!subscriptionData,
      subscription: subscriptionData
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});