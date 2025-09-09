import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[DELETE-USER-ADMIN] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Use service role key to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const currentUser = userData.user;
    if (!currentUser) throw new Error("User not authenticated");
    logStep("Current user authenticated", { userId: currentUser.id });

    // Verify admin role
    const { data: adminCheck } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', currentUser.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (!adminCheck) {
      throw new Error("Seuls les administrateurs peuvent supprimer des utilisateurs");
    }
    logStep("Admin role verified");

    const { userIdToDelete } = await req.json();
    if (!userIdToDelete) throw new Error("User ID to delete is required");
    logStep("User ID to delete", { userIdToDelete });

    // Check if user exists and get profile info for logging
    const { data: artistProfiles } = await supabaseAdmin
      .from('artist_profiles')
      .select('stage_name, user_id')
      .eq('user_id', userIdToDelete);

    const { data: professionalProfiles } = await supabaseAdmin
      .from('professional_profiles')
      .select('company_name as stage_name, user_id')
      .eq('user_id', userIdToDelete);

    const profiles = [...(artistProfiles || []), ...(professionalProfiles || [])];

    if (!profiles || profiles.length === 0) {
      logStep("No profiles found for user, checking if user exists in auth");
    } else {
      logStep("Found profiles to delete", { profiles });
    }

    // Delete user from auth.users - this will cascade to all related tables
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userIdToDelete);
    
    if (deleteError) {
      throw new Error(`Failed to delete user: ${deleteError.message}`);
    }

    logStep("User completely deleted", { userIdToDelete });

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Utilisateur supprimé avec succès",
      deletedUserId: userIdToDelete
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in delete-user-admin", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      success: false 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});