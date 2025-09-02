import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Initialiser Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const { payment_intent_id, upgrade_request_id } = await req.json();

    console.log('Verifying payment:', { payment_intent_id, upgrade_request_id });

    let paymentStatus = 'unknown';
    let stripePayment = null;

    // Vérifier le statut du paiement via Stripe
    if (payment_intent_id) {
      try {
        stripePayment = await stripe.paymentIntents.retrieve(payment_intent_id);
        paymentStatus = stripePayment.status;
        console.log('Stripe payment status:', paymentStatus);
      } catch (stripeError) {
        console.error('Error retrieving payment from Stripe:', stripeError);
        throw new Error('Impossible de vérifier le paiement auprès de Stripe');
      }
    } else if (upgrade_request_id) {
      // Si on a seulement l'ID de la demande, récupérer les détails et vérifier via les Payment Links
      const { data: upgradeRequest, error: fetchError } = await supabaseClient
        .from('upgrade_requests')
        .select('*')
        .eq('id', upgrade_request_id)
        .single();

      if (fetchError || !upgradeRequest) {
        throw new Error('Demande d\'upgrade non trouvée');
      }

      // Vérifier le statut via les Payment Links de Stripe
      // Note: Stripe ne fournit pas d'API directe pour vérifier le statut d'un Payment Link
      // On peut vérifier via les paiements récents du client
      paymentStatus = 'requires_verification';
    } else {
      throw new Error('payment_intent_id ou upgrade_request_id requis');
    }

    // Déterminer le nouveau statut de la demande d'upgrade
    let newStatus = 'pending';
    let shouldActivatePremium = false;

    switch (paymentStatus) {
      case 'succeeded':
        newStatus = 'completed';
        shouldActivatePremium = true;
        break;
      case 'processing':
        newStatus = 'processing';
        break;
      case 'requires_payment_method':
      case 'requires_confirmation':
      case 'requires_action':
        newStatus = 'pending';
        break;
      case 'canceled':
        newStatus = 'cancelled';
        break;
      default:
        newStatus = 'failed';
    }

    // Mettre à jour le statut de la demande d'upgrade
    if (upgrade_request_id) {
      const { error: updateError } = await supabaseClient
        .from('upgrade_requests')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', upgrade_request_id);

      if (updateError) {
        console.error('Error updating upgrade request:', updateError);
        throw updateError;
      }

      // Si le paiement est confirmé, activer la visibilité premium
      if (shouldActivatePremium) {
        const { data: upgradeRequest } = await supabaseClient
          .from('upgrade_requests')
          .select('*')
          .eq('id', upgrade_request_id)
          .single();

        if (upgradeRequest) {
          const premiumEndDate = new Date();
          premiumEndDate.setFullYear(premiumEndDate.getFullYear() + 1); // 1 an de premium

          const tableName = upgradeRequest.profile_type === 'artist' ? 'artist_profiles' : 'professional_profiles';
          
          const { error: premiumError } = await supabaseClient
            .from(tableName)
            .update({
              public_visibility_premium: true,
              premium_subscription_end: premiumEndDate.toISOString()
            })
            .eq('id', upgradeRequest.profile_id);

          if (premiumError) {
            console.error('Error activating premium visibility:', premiumError);
          } else {
            console.log('Premium visibility activated for profile:', upgradeRequest.profile_id);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        payment_status: paymentStatus,
        upgrade_status: newStatus,
        premium_activated: shouldActivatePremium
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in verify-payment function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});