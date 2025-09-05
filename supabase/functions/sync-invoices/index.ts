import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SYNC-INVOICES] ${step}${detailsStr}`);
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
    
    // Detect if we're in test mode
    const isTestMode = stripeKey.startsWith('sk_test_');
    logStep("Stripe mode detected", { isTestMode });
    
    // Find Stripe customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length === 0) {
      logStep("No Stripe customer found");
      return new Response(JSON.stringify({ invoices: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Fetch invoices from Stripe
    const stripeInvoices = await stripe.invoices.list({
      customer: customerId,
      limit: 100, // Fetch last 100 invoices
    });

    logStep("Retrieved invoices from Stripe", { count: stripeInvoices.data.length });

    // Sync invoices to database
    const invoicePromises = stripeInvoices.data.map(async (invoice) => {
      const invoiceData = {
        user_id: user.id,
        stripe_invoice_id: invoice.id,
        stripe_customer_id: customerId,
        amount_paid: invoice.amount_paid,
        amount_due: invoice.amount_due,
        currency: invoice.currency,
        status: invoice.status,
        invoice_pdf: invoice.invoice_pdf,
        hosted_invoice_url: invoice.hosted_invoice_url,
        invoice_number: invoice.number,
        description: invoice.description || `Facture ${invoice.number}`,
        period_start: invoice.period_start ? new Date(invoice.period_start * 1000).toISOString() : null,
        period_end: invoice.period_end ? new Date(invoice.period_end * 1000).toISOString() : null,
        due_date: invoice.due_date ? new Date(invoice.due_date * 1000).toISOString() : null,
        is_test_mode: isTestMode,
        updated_at: new Date().toISOString(),
      };

      return supabaseClient
        .from("invoices")
        .upsert(invoiceData, { onConflict: 'stripe_invoice_id' });
    });

    await Promise.all(invoicePromises);
    logStep("Synced invoices to database", { count: stripeInvoices.data.length });

    // Return invoices from database
    const { data: invoices, error: fetchError } = await supabaseClient
      .from("invoices")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (fetchError) throw new Error(`Error fetching invoices: ${fetchError.message}`);

    logStep("Returning invoices", { count: invoices?.length || 0 });

    return new Response(JSON.stringify({ invoices: invoices || [] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in sync-invoices", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});