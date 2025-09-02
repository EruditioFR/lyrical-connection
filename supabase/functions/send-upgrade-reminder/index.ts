import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Vérifier l'authentification (admin uniquement)
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    const { data: userData, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !userData.user) {
      throw new Error('Unauthorized');
    }

    const { upgrade_request_id, custom_message } = await req.json();

    console.log('Sending upgrade reminder for request:', upgrade_request_id);

    // Récupérer les détails de la demande d'upgrade
    const { data: upgradeRequest, error: fetchError } = await supabaseClient
      .from('upgrade_requests')
      .select(`
        *,
        user:user_id (email, raw_user_meta_data)
      `)
      .eq('id', upgrade_request_id)
      .single();

    if (fetchError || !upgradeRequest) {
      throw new Error('Demande d\'upgrade non trouvée');
    }

    if (upgradeRequest.status !== 'sent') {
      throw new Error('Cette demande n\'est pas en attente de paiement');
    }

    // Préparer le contenu de l'email
    const userName = upgradeRequest.user?.raw_user_meta_data?.stage_name || 
                    upgradeRequest.user?.raw_user_meta_data?.company_name || 
                    'Utilisateur';
    
    const profileTypeText = upgradeRequest.profile_type === 'artist' ? 'artiste' : 'professionnel';
    
    const emailSubject = `Rappel : Amélioration de votre profil ${profileTypeText}`;
    
    const defaultMessage = `
      Bonjour ${userName},
      
      Nous vous rappelons que vous avez une demande d'amélioration en attente pour votre profil ${profileTypeText}.
      
      Pour finaliser votre upgrade et bénéficier d'une visibilité premium, cliquez sur le lien ci-dessous :
      ${upgradeRequest.payment_link}
      
      Cette amélioration vous permettra de :
      - Augmenter la visibilité de votre profil
      - Apparaître en priorité dans les recherches
      - Accéder à des fonctionnalités premium
      
      Si vous avez des questions, n'hésitez pas à nous contacter.
      
      Cordialement,
      L'équipe
    `;

    const emailContent = custom_message || defaultMessage;

    // Envoyer l'email de rappel
    const emailResponse = await resend.emails.send({
      from: "Rappel Upgrade <noreply@resend.dev>",
      to: [upgradeRequest.user.email],
      subject: emailSubject,
      html: emailContent.replace(/\n/g, '<br>'),
    });

    if (emailResponse.error) {
      throw new Error(`Erreur lors de l'envoi de l'email: ${emailResponse.error.message}`);
    }

    // Marquer la demande comme "reminded"
    const { error: updateError } = await supabaseClient
      .from('upgrade_requests')
      .update({ 
        updated_at: new Date().toISOString()
      })
      .eq('id', upgrade_request_id);

    if (updateError) {
      console.error('Error updating upgrade request:', updateError);
    }

    console.log('Upgrade reminder sent successfully:', emailResponse.data?.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        email_id: emailResponse.data?.id,
        message: 'Rappel envoyé avec succès'
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in send-upgrade-reminder function:', error);
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