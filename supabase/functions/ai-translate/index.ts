
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

    const { keyId, languageCode, frenchText, context } = await req.json();

    if (!keyId || !languageCode || !frenchText) {
      throw new Error('Missing required parameters: keyId, languageCode, frenchText');
    }

    console.log('Translating text:', { keyId, languageCode, frenchText });

    // Créer le prompt pour OpenAI
    const prompt = `Traduisez le texte français suivant en ${getLanguageName(languageCode)}.

Texte à traduire: "${frenchText}"
${context ? `Contexte: ${context}` : ''}

Instructions:
- Traduisez de manière naturelle et idiomatique
- Respectez le ton et le style du texte original
- Pour les termes techniques liés à l'opéra et la musique classique, utilisez les termes appropriés dans la langue cible
- Répondez uniquement avec la traduction, sans explication

Traduction:`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Vous êtes un traducteur professionnel spécialisé dans la musique classique et l\'opéra. Traduisez avec précision en respectant les nuances culturelles et terminologiques.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const translatedText = data.choices[0].message.content.trim();

    console.log('Translation result:', translatedText);

    // Créer le client Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Calculer un score de confiance basé sur la longueur et la complexité
    const confidence = calculateConfidence(frenchText, translatedText);

    // Sauvegarder la suggestion de traduction
    const { error: suggestionError } = await supabase
      .from('translation_suggestions')
      .insert({
        key_id: keyId,
        language_code: languageCode,
        suggested_text: translatedText,
        ai_confidence: confidence,
        context_used: context || null,
        status: 'pending'
      });

    if (suggestionError) {
      console.error('Error saving translation suggestion:', suggestionError);
      throw new Error(`Failed to save translation suggestion: ${suggestionError.message}`);
    }

    return new Response(JSON.stringify({
      success: true,
      translatedText,
      confidence,
      message: 'Traduction générée avec succès'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-translate function:', error);
    return new Response(JSON.stringify({
      error: error.message,
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function getLanguageName(code: string): string {
  const languages: { [key: string]: string } = {
    'en': 'anglais',
    'de': 'allemand',
    'it': 'italien',
    'zh': 'chinois',
    'ko': 'coréen'
  };
  return languages[code] || code;
}

function calculateConfidence(originalText: string, translatedText: string): number {
  // Score de base
  let confidence = 0.7;

  // Ajuster selon la longueur relative
  const lengthRatio = translatedText.length / originalText.length;
  if (lengthRatio > 0.5 && lengthRatio < 2) {
    confidence += 0.1;
  }

  // Ajuster selon la présence de mots-clés musicaux
  const musicalTerms = ['opéra', 'aria', 'récital', 'concert', 'soprano', 'ténor', 'baryton', 'basse'];
  const hasMusicalTerms = musicalTerms.some(term => 
    originalText.toLowerCase().includes(term) || translatedText.toLowerCase().includes(term)
  );
  
  if (hasMusicalTerms) {
    confidence += 0.1;
  }

  // S'assurer que la confiance reste entre 0 et 1
  return Math.min(Math.max(confidence, 0.4), 0.95);
}
