import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-PREMIUM-VISIBILITY] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    // Use service role key for database operations
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Get all premium visibility subscriptions for this user
    const { data: subscriptions, error: subError } = await supabaseClient
      .from('premium_visibility_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active');

    if (subError) {
      logStep("ERROR fetching subscriptions", subError);
      throw new Error(`Failed to fetch subscriptions: ${subError.message}`);
    }

    logStep("Found subscriptions", { count: subscriptions?.length || 0 });

    const updatedSubscriptions = [];

    // Check each subscription status with Stripe
    for (const sub of subscriptions || []) {
      try {
        const stripeSubscription = await stripe.subscriptions.retrieve(sub.stripe_subscription_id);
        logStep("Checked Stripe subscription", { 
          id: stripeSubscription.id, 
          status: stripeSubscription.status 
        });

        const isActive = stripeSubscription.status === 'active';
        const currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000);

        // Update subscription record if needed
        if (sub.status !== stripeSubscription.status || 
            new Date(sub.current_period_end).getTime() !== currentPeriodEnd.getTime()) {
          
          const { error: updateError } = await supabaseClient
            .from('premium_visibility_subscriptions')
            .update({
              status: stripeSubscription.status,
              current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
              current_period_end: currentPeriodEnd.toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', sub.id);

          if (updateError) {
            logStep("ERROR updating subscription", updateError);
          } else {
            logStep("Updated subscription record");
          }
        }

        // Update profile premium status
        const tableName = sub.profile_type === 'artist' ? 'artist_profiles' : 'professional_profiles';
        const { error: profileError } = await supabaseClient
          .from(tableName)
          .update({
            public_visibility_premium: isActive,
            premium_subscription_end: isActive ? currentPeriodEnd.toISOString() : null
          })
          .eq('id', sub.profile_id);

        if (profileError) {
          logStep("ERROR updating profile", profileError);
        } else {
          logStep("Updated profile premium status", { 
            profileType: sub.profile_type, 
            profileId: sub.profile_id, 
            premium: isActive 
          });
        }

        updatedSubscriptions.push({
          profile_type: sub.profile_type,
          profile_id: sub.profile_id,
          premium_active: isActive,
          current_period_end: currentPeriodEnd.toISOString()
        });

      } catch (stripeError) {
        logStep("ERROR with Stripe subscription", { 
          subscriptionId: sub.stripe_subscription_id, 
          error: stripeError.message 
        });
        
        // If subscription not found in Stripe, mark as expired
        await supabaseClient
          .from('premium_visibility_subscriptions')
          .update({ status: 'expired' })
          .eq('id', sub.id);

        const tableName = sub.profile_type === 'artist' ? 'artist_profiles' : 'professional_profiles';
        await supabaseClient
          .from(tableName)
          .update({
            public_visibility_premium: false,
            premium_subscription_end: null
          })
          .eq('id', sub.profile_id);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      subscriptions: updatedSubscriptions
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-premium-visibility", { message: errorMessage });
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});