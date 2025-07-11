
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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

    // Récupérer les données de la requête
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    // Vérifier l'utilisateur authentifié
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !userData.user) {
      throw new Error('Unauthorized');
    }

    const { profile_id, profile_type, user_id } = await req.json();

    console.log('Creating upgrade request:', { profile_id, profile_type, user_id });

    // Créer la demande d'upgrade
    const { data: upgradeRequest, error: upgradeError } = await supabaseClient
      .from('upgrade_requests')
      .insert({
        user_id: user_id,
        profile_type: profile_type,
        profile_id: profile_id,
        requested_by: userData.user.id,
        status: 'pending'
      })
      .select()
      .single();

    if (upgradeError) {
      console.error('Error creating upgrade request:', upgradeError);
      throw upgradeError;
    }

    // TODO: Intégrer avec Stripe pour générer un lien de paiement
    // Pour l'instant, on simule la création d'un lien
    const paymentLink = `https://stripe.com/payment-link-placeholder-${upgradeRequest.id}`;

    // Mettre à jour la demande avec le lien de paiement
    const { error: updateError } = await supabaseClient
      .from('upgrade_requests')
      .update({ 
        payment_link: paymentLink,
        status: 'sent' 
      })
      .eq('id', upgradeRequest.id);

    if (updateError) {
      console.error('Error updating upgrade request:', updateError);
      throw updateError;
    }

    console.log('Upgrade request created successfully:', upgradeRequest.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        upgrade_request_id: upgradeRequest.id,
        payment_link: paymentLink
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in send-upgrade-request function:', error);
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
