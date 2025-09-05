import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

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

    try {
      const client = new SMTPClient({
        connection: {
          hostname: Deno.env.get('SMTP_HOST') || 'mail.o2switch.net',
          port: parseInt(Deno.env.get('SMTP_PORT') || '587'),
          tls: true,
          auth: {
            username: Deno.env.get('SMTP_USERNAME') || '',
            password: Deno.env.get('SMTP_PASSWORD') || '',
          },
        },
      });

      await client.send({
        from: Deno.env.get('SMTP_FROM') || 'noreply@aacfi.fr',
        to: real_email,
        subject: emailSubject,
        html: emailHtml,
      });

      console.log('Email sent successfully via O2Switch SMTP');
      await client.close();
    } catch (emailError) {
      console.error('Error sending email via SMTP:', emailError);
      // On continue même si l'email échoue, l'invitation est créée en base
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        invitation_token,
        invitation_link: invitationLink,
        real_email
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