import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ImportResult {
  success: boolean;
  imported: number;
  errors: string[];
  message: string;
}

interface LyricalWork {
  title: string;
  composer: string;
  category: string;
  genre?: string;
  period?: string;
  description?: string;
  librettist?: string;
  synopsis?: string;
  language?: string;
  premiere_date?: string;
  premiere_venue?: string;
  historical_context?: string;
  performance_notes?: string;
  difficulty_level?: number;
  acts_count?: number;
  total_duration_minutes?: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { csvData } = await req.json();
    console.log('Starting CSV import');

    if (!csvData) {
      throw new Error('No CSV data provided');
    }

    // Parse CSV data
    const lines = csvData.split('\n').filter((line: string) => line.trim().length > 0);
    if (lines.length < 2) {
      throw new Error('CSV file must have at least a header and one data row');
    }

    // Parse header to determine column mapping
    const header = lines[0].split(',').map((col: string) => col.trim().toLowerCase());
    console.log('CSV Header:', header);

    const works: LyricalWork[] = [];
    const errors: string[] = [];

    // Process each data row
    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(',').map((val: string) => val.trim().replace(/"/g, ''));
        
        if (values.length < 3) {
          errors.push(`Ligne ${i + 1}: Données insuffisantes (minimum: titre, compositeur, catégorie)`);
          continue;
        }

        const work: LyricalWork = {
          title: values[header.indexOf('titre')] || values[header.indexOf('title')] || values[0] || '',
          composer: values[header.indexOf('compositeur')] || values[header.indexOf('composer')] || values[1] || '',
          category: values[header.indexOf('catégorie')] || values[header.indexOf('category')] || values[2] || 'Opéra',
        };

        // Optional fields mapping
        const genreIndex = header.indexOf('genre');
        if (genreIndex >= 0 && values[genreIndex]) work.genre = values[genreIndex];

        const periodIndex = header.indexOf('période') || header.indexOf('period');
        if (periodIndex >= 0 && values[periodIndex]) work.period = values[periodIndex];

        const descriptionIndex = header.indexOf('description');
        if (descriptionIndex >= 0 && values[descriptionIndex]) work.description = values[descriptionIndex];

        const librettistIndex = header.indexOf('librettiste') || header.indexOf('librettist');
        if (librettistIndex >= 0 && values[librettistIndex]) work.librettist = values[librettistIndex];

        const synopsisIndex = header.indexOf('synopsis');
        if (synopsisIndex >= 0 && values[synopsisIndex]) work.synopsis = values[synopsisIndex];

        const languageIndex = header.indexOf('langue') || header.indexOf('language');
        if (languageIndex >= 0 && values[languageIndex]) work.language = values[languageIndex];

        const difficultyIndex = header.indexOf('difficulté') || header.indexOf('difficulty');
        if (difficultyIndex >= 0 && values[difficultyIndex]) {
          const difficulty = parseInt(values[difficultyIndex]);
          if (difficulty >= 1 && difficulty <= 5) work.difficulty_level = difficulty;
        }

        const actsIndex = header.indexOf('actes') || header.indexOf('acts');
        if (actsIndex >= 0 && values[actsIndex]) {
          const acts = parseInt(values[actsIndex]);
          if (acts > 0) work.acts_count = acts;
        }

        // Validate required fields
        if (!work.title || !work.composer || !work.category) {
          errors.push(`Ligne ${i + 1}: Champs requis manquants (titre, compositeur, catégorie)`);
          continue;
        }

        works.push(work);
      } catch (error) {
        errors.push(`Ligne ${i + 1}: Erreur de parsing - ${error.message}`);
      }
    }

    console.log(`Parsed ${works.length} works from CSV`);

    // Import works into database
    let importedCount = 0;
    for (const work of works) {
      try {
        // Check if work already exists
        const { data: existingWork } = await supabase
          .from('lyrical_works')
          .select('id')
          .eq('title', work.title)
          .eq('composer', work.composer)
          .single();

        if (existingWork) {
          console.log(`Work already exists: ${work.title} by ${work.composer}`);
          continue;
        }

        // Try to find matching composer
        let composerId = null;
        const { data: composer } = await supabase
          .from('composers')
          .select('id')
          .eq('name', work.composer)
          .single();

        if (composer) {
          composerId = composer.id;
        }

        // Insert the work
        const { error: insertError } = await supabase
          .from('lyrical_works')
          .insert({
            title: work.title,
            composer: work.composer,
            composer_id: composerId,
            category: work.category,
            genre: work.genre,
            period: work.period,
            description: work.description,
            librettist: work.librettist,
            synopsis: work.synopsis,
            language: work.language || 'Français',
            difficulty_level: work.difficulty_level || 3,
            acts_count: work.acts_count || 1,
            total_duration_minutes: work.total_duration_minutes,
            premiere_venue: work.premiere_venue,
            historical_context: work.historical_context,
            performance_notes: work.performance_notes,
          });

        if (insertError) {
          console.error(`Error inserting work ${work.title}:`, insertError);
          errors.push(`Erreur lors de l'insertion de "${work.title}": ${insertError.message}`);
        } else {
          importedCount++;
          console.log(`Successfully imported: ${work.title} by ${work.composer}`);
        }
      } catch (error) {
        console.error(`Error processing work ${work.title}:`, error);
        errors.push(`Erreur lors du traitement de "${work.title}": ${error.message}`);
      }
    }

    const result: ImportResult = {
      success: importedCount > 0,
      imported: importedCount,
      errors,
      message: `Import terminé avec succès : ${importedCount} œuvre(s) importée(s)${errors.length > 0 ? ` (${errors.length} erreurs)` : ''}`,
    };

    console.log('Import completed:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('CSV import error:', error);
    
    const result: ImportResult = {
      success: false,
      imported: 0,
      errors: [error.message],
      message: `Erreur lors de l'import CSV: ${error.message}`,
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})