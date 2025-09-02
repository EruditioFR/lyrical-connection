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

    // Check if we're in test mode (detect both test customer ID patterns and environment)
    const isTestMode = customerId.startsWith('cus_test_') || stripeKey.includes('sk_test_');
    logStep("Mode detected", { isTestMode, customerId, stripeKeyPrefix: stripeKey.substring(0, 8) });

    // Get subscriptions - for test mode, get all subscriptions regardless of status
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 10, // Get more subscriptions to find any test ones
    });

    logStep("Found subscriptions", { count: subscriptions.data.length, subscriptions: subscriptions.data.map(s => ({ id: s.id, status: s.status })) });

    let subscriptionData = null;
    if (subscriptions.data.length > 0) {
      const stripeSubscription = subscriptions.data[0];
      
      // For test mode, consider any subscription (including test ones) as valid
      const isValidSubscription = isTestMode || stripeSubscription.status === 'active';
      
      if (isValidSubscription) {
        logStep("Valid subscription found", { 
          subscriptionId: stripeSubscription.id, 
          status: stripeSubscription.status,
          isTestMode 
        });

        // Get plan details from Stripe price
        const priceId = stripeSubscription.items.data[0].price.id;
        let plan = null;
        let planError = null;
        
        // Try to get plan by stripe_price_id
        const { data: planData, error: planErr } = await supabaseClient
          .from('subscription_plans')
          .select('*')
          .eq('stripe_price_id', priceId)
          .single();
        
        if (planErr && planErr.code !== 'PGRST116') {
          planError = planErr;
        } else if (planData) {
          plan = planData;
        }
        
        // If no plan found by stripe_price_id and we're in test mode, use a default plan
        if (!plan && isTestMode) {
          // Try to get the plan by matching the product name or metadata
          try {
            const priceObject = await stripe.prices.retrieve(priceId, { expand: ['product'] });
            if (priceObject.product && typeof priceObject.product === 'object') {
              const productName = priceObject.product.name;
              logStep("Product name from Stripe", { productName, priceId });
              
              // Try to find plan by name matching
              let planByName = null;
              if (productName.includes('Premium') || productName.includes('Visibilité')) {
                const { data: premiumPlan } = await supabaseClient
                  .from('subscription_plans')
                  .select('*')
                  .eq('name', 'Premium Visibilité')
                  .single();
                planByName = premiumPlan;
              } else {
                const { data: defaultPlan } = await supabaseClient
                  .from('subscription_plans')
                  .select('*')
                  .eq('name', 'Artistes')
                  .single();
                planByName = defaultPlan;
              }
              
              if (planByName) {
                plan = planByName;
                logStep("Found plan by product name match", { planId: plan.id, planName: plan.name });
              }
            }
          } catch (stripeError) {
            logStep("Error retrieving price details from Stripe", { error: stripeError.message });
          }
          
          // Final fallback to default plan
          if (!plan) {
            const { data: defaultPlan } = await supabaseClient
              .from('subscription_plans')
              .select('*')
              .eq('name', 'Artistes')
              .single();
            
            if (defaultPlan) {
              plan = defaultPlan;
              logStep("Using default plan for test mode", { planId: plan.id, planName: plan.name });
            }
          }
        }

        logStep("Plan lookup", { priceId, plan: plan?.name, planError, isTestMode });

        // Update or create subscription record - treat test subscriptions as active
        const subscriptionRecord = {
          user_id: user.id,
          plan_id: plan?.id || null,
          stripe_customer_id: customerId,
          stripe_subscription_id: stripeSubscription.id,
          status: 'active', // Force active for both test and live mode
          current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
          trial_end: stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000).toISOString() : null,
          updated_at: new Date().toISOString(),
        };

        logStep("Subscription record to upsert", subscriptionRecord);

        // Check if subscription already exists for this user
        const { data: existingSubscription, error: checkError } = await supabaseClient
          .from('subscriptions')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          logStep("Error checking existing subscription", { error: checkError });
        }

        if (existingSubscription) {
          // Update existing subscription
          const { data: updateResult, error: updateError } = await supabaseClient
            .from('subscriptions')
            .update(subscriptionRecord)
            .eq('user_id', user.id)
            .select()
            .single();

          if (updateError) {
            logStep("Update error", { error: updateError });
          } else {
            logStep("Subscription updated successfully", updateResult);
            
            // Check if this is a Premium Visibilité subscription and create premium visibility record
            if (plan && plan.name === 'Premium Visibilité') {
              logStep("Detected Premium Visibilité subscription, creating premium record");
              
              // Get user's profile to determine profile type and ID
              let profileType = 'artist';
              let profileId = null;
              
              // Try to find artist profile first
              const { data: artistProfile } = await supabaseClient
                .from('artist_profiles')
                .select('id')
                .eq('user_id', user.id)
                .maybeSingle();
              
              if (artistProfile) {
                profileType = 'artist';
                profileId = artistProfile.id;
              } else {
                // Try professional profile
                const { data: professionalProfile } = await supabaseClient
                  .from('professional_profiles')
                  .select('id')
                  .eq('user_id', user.id)
                  .maybeSingle();
                
                if (professionalProfile) {
                  profileType = 'professional';
                  profileId = professionalProfile.id;
                }
              }
              
              if (profileId) {
                // Create or update premium visibility subscription record
                const premiumRecord = {
                  user_id: user.id,
                  profile_type: profileType,
                  profile_id: profileId,
                  stripe_subscription_id: stripeSubscription.id,
                  status: stripeSubscription.status === 'trialing' || isTestMode ? 'active' : stripeSubscription.status,
                  current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
                  current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString()
                };
                
                const { error: premiumError } = await supabaseClient
                  .from('premium_visibility_subscriptions')
                  .upsert(premiumRecord, { 
                    onConflict: 'stripe_subscription_id',
                    ignoreDuplicates: false 
                  });
                
                if (premiumError) {
                  logStep("ERROR creating premium visibility record", premiumError);
                } else {
                  logStep("Premium visibility record created successfully");
                  
                  // Update profile with premium status
                  const tableName = profileType === 'artist' ? 'artist_profiles' : 'professional_profiles';
                  const { error: profileError } = await supabaseClient
                    .from(tableName)
                    .update({
                      public_visibility_premium: true,
                      premium_subscription_end: new Date(stripeSubscription.current_period_end * 1000).toISOString()
                    })
                    .eq('id', profileId);
                  
                  if (profileError) {
                    logStep("ERROR updating profile premium status", profileError);
                  } else {
                    logStep("Profile premium status updated successfully");
                  }
                }
              }
            }
          }
        } else {
          // Insert new subscription
          const { data: insertResult, error: insertError } = await supabaseClient
            .from('subscriptions')
            .insert(subscriptionRecord)
            .select()
            .single();

          if (insertError) {
            logStep("Insert error", { error: insertError });
          } else {
            logStep("Subscription inserted successfully", insertResult);
            
            // Check if this is a Premium Visibilité subscription and create premium visibility record
            if (plan && plan.name === 'Premium Visibilité') {
              logStep("Detected Premium Visibilité subscription, creating premium record");
              
              // Get user's profile to determine profile type and ID
              let profileType = 'artist';
              let profileId = null;
              
              // Try to find artist profile first
              const { data: artistProfile } = await supabaseClient
                .from('artist_profiles')
                .select('id')
                .eq('user_id', user.id)
                .maybeSingle();
              
              if (artistProfile) {
                profileType = 'artist';
                profileId = artistProfile.id;
              } else {
                // Try professional profile
                const { data: professionalProfile } = await supabaseClient
                  .from('professional_profiles')
                  .select('id')
                  .eq('user_id', user.id)
                  .maybeSingle();
                
                if (professionalProfile) {
                  profileType = 'professional';
                  profileId = professionalProfile.id;
                }
              }
              
              if (profileId) {
                // Create or update premium visibility subscription record
                const premiumRecord = {
                  user_id: user.id,
                  profile_type: profileType,
                  profile_id: profileId,
                  stripe_subscription_id: stripeSubscription.id,
                  status: stripeSubscription.status === 'trialing' || isTestMode ? 'active' : stripeSubscription.status,
                  current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
                  current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString()
                };
                
                const { error: premiumError } = await supabaseClient
                  .from('premium_visibility_subscriptions')
                  .upsert(premiumRecord, { 
                    onConflict: 'stripe_subscription_id',
                    ignoreDuplicates: false 
                  });
                
                if (premiumError) {
                  logStep("ERROR creating premium visibility record", premiumError);
                } else {
                  logStep("Premium visibility record created successfully");
                  
                  // Update profile with premium status
                  const tableName = profileType === 'artist' ? 'artist_profiles' : 'professional_profiles';
                  const { error: profileError } = await supabaseClient
                    .from(tableName)
                    .update({
                      public_visibility_premium: true,
                      premium_subscription_end: new Date(stripeSubscription.current_period_end * 1000).toISOString()
                    })
                    .eq('id', profileId);
                  
                  if (profileError) {
                    logStep("ERROR updating profile premium status", profileError);
                  } else {
                    logStep("Profile premium status updated successfully");
                  }
                }
              }
            }
          }
        }

        subscriptionData = {
          ...subscriptionRecord,
          plan
        };
      }
    } else {
      logStep("No subscription found");
      
      // Update any existing subscription to inactive
      const { error: updateError } = await supabaseClient
        .from('subscriptions')
        .update({ status: 'inactive', updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (updateError) {
        logStep("Error updating inactive subscription", { error: updateError });
      }
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