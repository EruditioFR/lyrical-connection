import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PREMIUM-VISIBILITY] ${step}${detailsStr}`);
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

    const { profileType, profileId } = await req.json();
    if (!profileType || !profileId) {
      throw new Error("Profile type and profile ID are required");
    }

    if (!['artist', 'professional'].includes(profileType)) {
      throw new Error("Invalid profile type");
    }

    logStep("Request data", { profileType, profileId });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Check if customer exists or create one
    let customerId;
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id,
          profile_type: profileType,
          profile_id: profileId
        }
      });
      customerId = customer.id;
      logStep("Created new customer", { customerId });
    }

    // Check if user already has an active subscription (standard plan)
    const existingSubscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1
    });

    let subscriptionToModify = null;
    if (existingSubscriptions.data.length > 0) {
      subscriptionToModify = existingSubscriptions.data[0];
      logStep("Found existing subscription to modify", { subscriptionId: subscriptionToModify.id });
    }

    let subscription;

    if (subscriptionToModify) {
      // Create a price for the premium visibility add-on
      const premiumPrice = await stripe.prices.create({
        currency: 'eur',
        product_data: {
          name: 'Visibilité Premium Add-on',
          description: 'Option premium pour apparaître en page publique'
        },
        unit_amount: 2900, // 29.00 EUR in cents
        recurring: {
          interval: 'month'
        }
      });

      // Add premium visibility as an additional line item to existing subscription
      subscription = await stripe.subscriptions.update(subscriptionToModify.id, {
        items: [
          ...subscriptionToModify.items.data.map(item => ({ id: item.id })),
          {
            price: premiumPrice.id
          }
        ],
        metadata: {
          ...subscriptionToModify.metadata,
          has_premium_visibility: 'true',
          premium_profile_type: profileType,
          premium_profile_id: profileId
        }
      });
      logStep("Updated existing subscription with premium visibility", { subscriptionId: subscription.id });
    } else {
      // Create new subscription for premium visibility only
      subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Visibilité Premium',
              description: 'Apparaître en page publique et booster votre visibilité'
            },
            unit_amount: 2900, // 29.00 EUR in cents
            recurring: {
              interval: 'month'
            }
          }
        }],
        metadata: {
          user_id: user.id,
          profile_type: profileType,
          profile_id: profileId,
          feature: 'premium_visibility',
          standalone: 'true'
        }
      });
      logStep("Created new standalone premium subscription", { subscriptionId: subscription.id });
    }

    logStep("Created subscription", { subscriptionId: subscription.id });

    // Update profile with premium status
    const tableName = profileType === 'artist' ? 'artist_profiles' : 'professional_profiles';
    const { error: updateError } = await supabaseClient
      .from(tableName)
      .update({
        public_visibility_premium: true,
        premium_subscription_end: new Date(subscription.current_period_end * 1000).toISOString()
      })
      .eq('id', profileId)
      .eq('user_id', user.id);

    if (updateError) {
      logStep("ERROR updating profile", updateError);
      throw new Error(`Failed to update profile: ${updateError.message}`);
    }

    // Create subscription record
    const { error: subError } = await supabaseClient
      .from('premium_visibility_subscriptions')
      .insert({
        user_id: user.id,
        profile_type: profileType,
        profile_id: profileId,
        stripe_subscription_id: subscription.id,
        status: 'active',
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
      });

    if (subError) {
      logStep("ERROR creating subscription record", subError);
      throw new Error(`Failed to create subscription record: ${subError.message}`);
    }

    logStep("Successfully activated premium visibility");

    return new Response(JSON.stringify({
      success: true,
      subscription_id: subscription.id,
      current_period_end: subscription.current_period_end
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-premium-visibility", { message: errorMessage });
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});