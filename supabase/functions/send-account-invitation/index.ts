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

    const { profile_id, profile_type, real_email } = await req.json();

    console.log('Sending account invitation:', { profile_id, profile_type, real_email });

    // Validation des secrets Mailjet
    const mailjetConfig = {
      apiKey: Deno.env.get('MAILJET_API_KEY'),
      secretKey: Deno.env.get('MAILJET_SECRET_KEY')
    };

    console.log('Mailjet Configuration check:', {
      apiKey: mailjetConfig.apiKey ? 'SET' : 'MISSING',
      secretKey: mailjetConfig.secretKey ? 'SET' : 'MISSING'
    });

    if (!mailjetConfig.apiKey || !mailjetConfig.secretKey) {
      throw new Error('MAILJET_API_KEY and MAILJET_SECRET_KEY environment variables must be set');
    }

    // Validation du format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(real_email)) {
      console.error('Invalid email format:', real_email);
      throw new Error('Format d\'email invalide');
    }

    // Générer un token unique pour l'invitation
    const invitation_token = crypto.randomUUID();
    const expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 jours

    // Créer l'invitation dans la base de données
    const { error: invitationError } = await supabaseClient
      .from('account_invitations')
      .insert({
        profile_id,
        profile_type,
        real_email,
        invitation_token,
        expires_at,
      });

    if (invitationError) {
      console.error('Error creating invitation:', invitationError);
      throw invitationError;
    }

    // Générer le lien d'invitation
    const baseUrl = Deno.env.get('SITE_URL') || 'https://lyrisphere.lovable.app';
    const invitationLink = `${baseUrl}/invitation/${invitation_token}`;

    console.log('Account invitation created successfully');

    // Envoyer l'email d'invitation
    const emailSubject = `Invitation à rejoindre Lyrisphere - ${profile_type === 'artist' ? 'Profil Artiste' : 'Profil Professionnel'}`;
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1a365d, #2d5a87); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { 
              display: inline-block; 
              background: #2563eb; 
              color: white; 
              padding: 12px 24px; 
              text-decoration: none; 
              border-radius: 6px; 
              margin: 20px 0;
              font-weight: bold;
            }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎵 Bienvenue sur Lyrisphere</h1>
            </div>
            <div class="content">
              <h2>Votre invitation est prête !</h2>
              <p>Bonjour,</p>
              <p>Un administrateur vous a créé un compte sur <strong>Lyrisphere</strong>, la plateforme dédiée aux professionnels de l'opéra et du chant lyrique.</p>
              
              <p>Votre profil <strong>${profile_type === 'artist' ? 'Artiste' : 'Professionnel'}</strong> a été préparé et vous pouvez maintenant y accéder en cliquant sur le bouton ci-dessous :</p>
              
              <p style="text-align: center;">
                <a href="${invitationLink}" class="button" style="color: white;">
                  Activer mon compte
                </a>
              </p>
              
              <p><strong>Important :</strong></p>
              <ul>
                <li>Cette invitation est valable pendant <strong>7 jours</strong></li>
                <li>Vous devrez créer un mot de passe lors de votre première connexion</li>
                <li>Votre adresse email sera : <strong>${real_email}</strong></li>
              </ul>
              
              <p>Une fois connecté, vous pourrez compléter votre profil et accéder à toutes les fonctionnalités de la plateforme.</p>
              
              <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
              
              <p>L'équipe Lyrisphere</p>
            </div>
            <div class="footer">
              <p>Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br>
              <a href="${invitationLink}">${invitationLink}</a></p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Variable pour tracker le succès d'envoi email
    let emailSent = false;

    // Envoi d'email via Mailjet API
    const emailId = crypto.randomUUID().substring(0, 8);
    console.log(`[EMAIL-${emailId}] Starting Mailjet email process for ${real_email}`);

    try {
      // Préparer les données pour Mailjet
      const mailjetPayload = {
        Messages: [
          {
            From: {
              Email: "noreply@lyrisphere.com",
              Name: "Lyrisphere"
            },
            To: [
              {
                Email: real_email,
                Name: real_email
              }
            ],
            Subject: emailSubject,
            HTMLPart: emailHtml
          }
        ]
      };

      console.log(`[EMAIL-${emailId}] Email data prepared:`, {
        to: real_email,
        subject: emailSubject,
        html_length: emailHtml.length,
        profile_type: profile_type
      });

      const startTime = Date.now();
      
      // Encoder les credentials pour l'authentification Basic
      const auth = btoa(`${mailjetConfig.apiKey}:${mailjetConfig.secretKey}`);
      
      const response = await fetch('https://api.mailjet.com/v3.1/send', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mailjetPayload),
      });

      const endTime = Date.now();
      const responseData = await response.json();

      console.log(`[EMAIL-${emailId}] Mailjet API response in ${endTime - startTime}ms:`, {
        status: response.status,
        success: response.ok,
        data: responseData
      });

      if (!response.ok) {
        throw new Error(`Mailjet API error: ${responseData.ErrorMessage || 'Unknown error'} (Status: ${response.status})`);
      }

      console.log(`[EMAIL-${emailId}] Email sent successfully via Mailjet API`);
      emailSent = true;
      
    } catch (emailError) {
      console.error(`[EMAIL-${emailId}] Mailjet Email Error:`, {
        error_name: emailError.name,
        error_message: emailError.message,
        error_stack: emailError.stack
      });
      
      // Diagnostic spécifique selon le type d'erreur
      if (emailError.message?.includes('MAILJET_API_KEY')) {
        console.error(`[EMAIL-${emailId}] Configuration error - Set MAILJET_API_KEY and MAILJET_SECRET_KEY environment variables`);
      } else if (emailError.message?.includes('fetch')) {
        console.error(`[EMAIL-${emailId}] Network error - Check Mailjet API availability`);
      } else if (emailError.message?.includes('Mailjet API error')) {
        console.error(`[EMAIL-${emailId}] Mailjet API returned an error - Check API credentials and limits`);
      }
      
      emailSent = false;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        invitation_token,
        invitation_link: invitationLink,
        real_email,
        email_sent: emailSent,
        email_status: emailSent ? 'sent' : 'failed',
        message: emailSent ? 
          'Invitation créée et email envoyé avec succès' : 
          'Invitation créée mais email non envoyé (voir logs)'
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in send-account-invitation function:', error);
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