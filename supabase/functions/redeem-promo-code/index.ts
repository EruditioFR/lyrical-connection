import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Get the authorization header to identify the user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authentification requise' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create a client with the user's token to get their identity
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      console.error('User authentication error:', userError);
      return new Response(
        JSON.stringify({ success: false, error: 'Utilisateur non authentifié' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('User authenticated:', user.id, user.email);

    // Parse request body
    const { code } = await req.json();
    if (!code || typeof code !== 'string') {
      return new Response(
        JSON.stringify({ success: false, error: 'Code promo requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const normalizedCode = code.trim().toUpperCase();
    console.log('Attempting to redeem code:', normalizedCode);

    // Create admin client for database operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Fetch the promo code
    const { data: promoCode, error: promoError } = await supabaseAdmin
      .from('promo_codes')
      .select('*')
      .eq('code', normalizedCode)
      .single();

    if (promoError || !promoCode) {
      console.error('Promo code not found:', promoError);
      return new Response(
        JSON.stringify({ success: false, error: 'Code promo invalide' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Promo code found:', promoCode.campaign_name);

    // 2. Validate promo code is active
    if (!promoCode.is_active) {
      return new Response(
        JSON.stringify({ success: false, error: 'Ce code promo n\'est plus actif' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Check date validity
    const now = new Date();
    if (promoCode.starts_at && new Date(promoCode.starts_at) > now) {
      return new Response(
        JSON.stringify({ success: false, error: 'Ce code promo n\'est pas encore actif' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (promoCode.expires_at && new Date(promoCode.expires_at) < now) {
      return new Response(
        JSON.stringify({ success: false, error: 'Ce code promo a expiré' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Check if max uses reached (only if max_uses is set)
    if (promoCode.max_uses !== null && promoCode.current_uses >= promoCode.max_uses) {
      return new Response(
        JSON.stringify({ success: false, error: 'Ce code promo a atteint sa limite d\'utilisation' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 5. Check if user already used this code
    const { data: existingRedemption } = await supabaseAdmin
      .from('promo_code_redemptions')
      .select('id')
      .eq('promo_code_id', promoCode.id)
      .eq('user_id', user.id)
      .single();

    if (existingRedemption) {
      return new Response(
        JSON.stringify({ success: false, error: 'Vous avez déjà utilisé ce code promo' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 6. Get user's artist profile
    const { data: artistProfile } = await supabaseAdmin
      .from('artist_profiles')
      .select('id, stage_name')
      .eq('user_id', user.id)
      .single();

    if (!artistProfile) {
      return new Response(
        JSON.stringify({ success: false, error: 'Vous devez avoir un profil artiste pour utiliser ce code' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Artist profile found:', artistProfile.id, artistProfile.stage_name);

    // 7. Calculate subscription end date
    const subscriptionEndDate = new Date();
    subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + promoCode.subscription_months);

    // 8. Get badge info from metadata
    const metadata = promoCode.metadata as { badge_type?: string; badge_name?: string; badge_icon?: string } || {};
    const badgeType = metadata.badge_type || 'promo_' + normalizedCode.toLowerCase();
    const badgeName = metadata.badge_name || promoCode.campaign_name;
    const badgeIcon = metadata.badge_icon || '⭐';

    // Start transaction-like operations
    try {
      // 9. Update artist profile with premium visibility
      const { error: updateProfileError } = await supabaseAdmin
        .from('artist_profiles')
        .update({
          public_visibility_premium: true,
          premium_subscription_end: subscriptionEndDate.toISOString(),
          is_free_account: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', artistProfile.id);

      if (updateProfileError) {
        console.error('Error updating artist profile:', updateProfileError);
        throw updateProfileError;
      }

      console.log('Artist profile updated with premium visibility');

      // 10. Create or update the badge
      const { error: badgeError } = await supabaseAdmin
        .from('artist_badges')
        .upsert({
          artist_profile_id: artistProfile.id,
          badge_type: badgeType,
          badge_name: badgeName,
          badge_icon: badgeIcon,
          awarded_at: new Date().toISOString(),
          awarded_by: 'promo_code',
          metadata: { promo_code_id: promoCode.id, campaign: promoCode.campaign_name },
          is_active: true
        }, {
          onConflict: 'artist_profile_id,badge_type'
        });

      if (badgeError) {
        console.error('Error creating badge:', badgeError);
        throw badgeError;
      }

      console.log('Badge created:', badgeName);

      // 11. Record the redemption
      const { error: redemptionError } = await supabaseAdmin
        .from('promo_code_redemptions')
        .insert({
          promo_code_id: promoCode.id,
          user_id: user.id,
          artist_profile_id: artistProfile.id,
          subscription_granted_until: subscriptionEndDate.toISOString(),
          badges_granted: [badgeName]
        });

      if (redemptionError) {
        console.error('Error recording redemption:', redemptionError);
        throw redemptionError;
      }

      console.log('Redemption recorded');

      // 12. Increment usage counter
      const { error: incrementError } = await supabaseAdmin
        .from('promo_codes')
        .update({ 
          current_uses: promoCode.current_uses + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', promoCode.id);

      if (incrementError) {
        console.error('Error incrementing usage:', incrementError);
        // Non-critical, continue
      }

      // 13. Create a notification for the user
      try {
        await supabaseAdmin
          .from('notifications')
          .insert({
            user_id: user.id,
            type: 'subscription',
            title: `Bienvenue au ${promoCode.campaign_name} !`,
            content: `Votre abonnement Premium de ${promoCode.subscription_months} mois a été activé. Vous avez reçu le badge "${badgeName}".`,
            data: {
              promo_code: normalizedCode,
              badge: badgeName,
              subscription_end: subscriptionEndDate.toISOString()
            }
          });
        console.log('Notification created');
      } catch (notifError) {
        console.error('Error creating notification (non-critical):', notifError);
      }

      // Success response
      return new Response(
        JSON.stringify({
          success: true,
          subscription: {
            plan: 'Artistes Premium',
            months: promoCode.subscription_months,
            valid_until: subscriptionEndDate.toISOString()
          },
          badges: [badgeName],
          campaign: promoCode.campaign_name,
          message: `Félicitations ! Votre accès Premium ${promoCode.subscription_months} mois est activé.`
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (transactionError) {
      console.error('Transaction error:', transactionError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Une erreur est survenue lors de l\'activation. Veuillez réessayer.' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Erreur serveur inattendue' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
