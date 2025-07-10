import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const { artistId, stageName, voiceType, gender } = await req.json();

    if (!artistId || !stageName) {
      throw new Error('Artist ID and stage name are required');
    }

    // Déterminer le genre pour le prompt
    const genderPrompt = gender === 'female' ? 'young woman' : gender === 'male' ? 'young man' : 'young person';
    
    // Déterminer le style selon le type de voix
    let stylePrompt = '';
    if (voiceType?.toLowerCase().includes('soprano') || voiceType?.toLowerCase().includes('mezzo')) {
      stylePrompt = 'elegant opera singer, refined and graceful';
    } else if (voiceType?.toLowerCase().includes('tenor') || voiceType?.toLowerCase().includes('baryton') || voiceType?.toLowerCase().includes('basse')) {
      stylePrompt = 'distinguished opera singer, noble and charismatic';
    } else {
      stylePrompt = 'professional classical singer, elegant and artistic';
    }

    const prompt = `Professional portrait of a ${genderPrompt}, ${stylePrompt}, wearing elegant classical music attire, soft dramatic lighting, artistic photography style, high quality, professional headshot, neutral background, confident expression, suitable for an opera or classical music program`;

    console.log('Generating image with prompt:', prompt);

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: 'high',
        output_format: 'webp',
        response_format: 'b64_json'
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const base64Image = data.data[0].b64_json;

    // Convertir base64 en blob
    const imageBuffer = Uint8Array.from(atob(base64Image), c => c.charCodeAt(0));

    // Créer le client Supabase avec la clé de service
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Uploader l'image dans le storage
    const fileName = `${artistId}-${Date.now()}.webp`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('artist-images')
      .upload(fileName, imageBuffer, {
        contentType: 'image/webp',
        upsert: false
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw new Error(`Failed to upload image: ${uploadError.message}`);
    }

    // Obtenir l'URL publique
    const { data: { publicUrl } } = supabase.storage
      .from('artist-images')
      .getPublicUrl(fileName);

    // Mettre à jour le profil de l'artiste avec l'URL de l'image
    const { error: updateError } = await supabase
      .from('artist_profiles')
      .update({ 
        profile_image_url: publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', artistId);

    if (updateError) {
      console.error('Profile update error:', updateError);
      // Ne pas lancer d'erreur car l'image a été générée avec succès
    }

    console.log('Image generated and uploaded successfully:', publicUrl);

    return new Response(JSON.stringify({ 
      success: true,
      imageUrl: publicUrl,
      message: `Image générée pour ${stageName}`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-artist-image function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});