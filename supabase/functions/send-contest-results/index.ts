import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendContestResultsRequest {
  contestId: string;
  contestName: string;
  recipientType: 'shortlisted' | 'rejected';
  artistIds: string[];
}

const getShortlistedEmailHtml = (artistName: string, contestName: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Georgia', serif; margin: 0; padding: 0; background-color: #f8f5f0; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, #c9a961 0%, #f4d675 50%, #c9a961 100%); padding: 40px; text-align: center; }
    .header h1 { color: #1a1a1a; margin: 0; font-size: 24px; font-weight: normal; letter-spacing: 2px; }
    .content { padding: 40px; color: #333; line-height: 1.8; }
    .content h2 { color: #c9a961; font-size: 20px; margin-bottom: 20px; }
    .highlight { background: #fef9e7; border-left: 4px solid #c9a961; padding: 20px; margin: 20px 0; }
    .cta { text-align: center; margin: 30px 0; }
    .cta a { background: #c9a961; color: white; padding: 15px 30px; text-decoration: none; font-size: 16px; letter-spacing: 1px; }
    .footer { background: #1a1a1a; color: #888; padding: 30px; text-align: center; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✨ SUMI JO INTERNATIONAL SINGING COMPETITION 2026 ✨</h1>
    </div>
    <div class="content">
      <h2>Félicitations, ${artistName} !</h2>
      
      <p>Nous avons le plaisir de vous informer que vous avez été sélectionné(e) parmi les <strong>24 demi-finalistes</strong> de la ${contestName}.</p>
      
      <div class="highlight">
        <p><strong>Prochaines étapes :</strong></p>
        <p>Veuillez confirmer votre participation en vous connectant à votre espace personnel sur Lyrisphere dans les plus brefs délais.</p>
      </div>
      
      <p>Nous vous communiquerons prochainement les informations détaillées concernant les demi-finales.</p>
      
      <div class="cta">
        <a href="https://lyrisphere.com/dashboard">Confirmer ma participation</a>
      </div>
      
      <p>Avec nos félicitations les plus chaleureuses,</p>
      <p><em>Le Comité d'Organisation<br>Sumi Jo International Singing Competition</em></p>
    </div>
    <div class="footer">
      <p>© 2026 Sumi Jo International Singing Competition - Lyrisphere</p>
      <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
    </div>
  </div>
</body>
</html>
`;

const getRejectedEmailHtml = (artistName: string, contestName: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Georgia', serif; margin: 0; padding: 0; background-color: #f8f5f0; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, #666 0%, #888 50%, #666 100%); padding: 40px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; font-weight: normal; letter-spacing: 2px; }
    .content { padding: 40px; color: #333; line-height: 1.8; }
    .content h2 { color: #666; font-size: 20px; margin-bottom: 20px; }
    .footer { background: #1a1a1a; color: #888; padding: 30px; text-align: center; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>SUMI JO INTERNATIONAL SINGING COMPETITION 2026</h1>
    </div>
    <div class="content">
      <h2>Cher(ère) ${artistName},</h2>
      
      <p>Nous vous remercions sincèrement pour votre participation à la ${contestName}.</p>
      
      <p>Après délibération du jury, nous avons le regret de vous informer que votre candidature n'a pas été retenue pour les demi-finales cette année.</p>
      
      <p>La qualité exceptionnelle des candidatures reçues a rendu la sélection particulièrement difficile. Votre talent et votre engagement artistique méritent d'être salués.</p>
      
      <p>Nous espérons avoir le plaisir de vous revoir lors de nos prochaines éditions et vous encourageons vivement à poursuivre votre parcours artistique.</p>
      
      <p>Avec nos meilleurs sentiments,</p>
      <p><em>Le Comité d'Organisation<br>Sumi Jo International Singing Competition</em></p>
    </div>
    <div class="footer">
      <p>© 2026 Sumi Jo International Singing Competition - Lyrisphere</p>
      <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
    </div>
  </div>
</body>
</html>
`;

const handler = async (req: Request): Promise<Response> => {
  console.log("send-contest-results function called");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization header required");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const { contestId, contestName, recipientType, artistIds }: SendContestResultsRequest = await req.json();
    console.log(`Sending ${recipientType} emails for contest ${contestId} to ${artistIds.length} artists`);

    // Use service role to fetch artist emails
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get artist profiles with emails
    const { data: artists, error: artistsError } = await supabaseAdmin
      .from('artist_profiles')
      .select('id, stage_name, contact_email')
      .in('id', artistIds);

    if (artistsError) {
      console.error("Error fetching artists:", artistsError);
      throw artistsError;
    }

    const results = {
      sent: 0,
      failed: 0,
      errors: [] as string[]
    };

    const fromEmail = Deno.env.get("SMTP_FROM") || "noreply@lyrisphere.com";

    for (const artist of artists || []) {
      if (!artist.contact_email) {
        results.failed++;
        results.errors.push(`No email for ${artist.stage_name}`);
        continue;
      }

      try {
        const subject = recipientType === 'shortlisted' 
          ? `🎉 Félicitations ! Vous êtes sélectionné(e) - ${contestName}`
          : `Résultats de votre candidature - ${contestName}`;

        const html = recipientType === 'shortlisted'
          ? getShortlistedEmailHtml(artist.stage_name, contestName)
          : getRejectedEmailHtml(artist.stage_name, contestName);

        const { error: emailError } = await resend.emails.send({
          from: `Sumi Jo Competition <${fromEmail}>`,
          to: [artist.contact_email],
          subject,
          html,
        });

        if (emailError) {
          console.error(`Error sending to ${artist.contact_email}:`, emailError);
          results.failed++;
          results.errors.push(`Failed to send to ${artist.stage_name}: ${emailError.message}`);
        } else {
          console.log(`Email sent to ${artist.contact_email}`);
          results.sent++;
        }
      } catch (err) {
        console.error(`Exception sending to ${artist.contact_email}:`, err);
        results.failed++;
        results.errors.push(`Exception for ${artist.stage_name}: ${err.message}`);
      }
    }

    console.log(`Results: ${results.sent} sent, ${results.failed} failed`);

    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("Error in send-contest-results:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
