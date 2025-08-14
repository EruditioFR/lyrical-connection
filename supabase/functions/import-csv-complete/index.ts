import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ImportOptions {
  csvData: string;
  importType: 'works' | 'composers' | 'roles' | 'arias' | 'complete';
  skipDuplicates?: boolean;
}

interface ImportResult {
  success: boolean;
  imported: {
    composers: number;
    works: number;
    roles: number;
    arias: number;
  };
  errors: string[];
  message: string;
}

interface ParsedComposer {
  name: string;
  complete_name?: string;
  birth_year?: number;
  death_year?: number;
  epoch?: string;
  biography?: string;
  portrait_url?: string;
}

interface ParsedWork {
  title: string;
  composer: string;
  category: string;
  genre?: string;
  period?: string;
  language?: string;
  description?: string;
  synopsis?: string;
  librettist?: string;
  historical_context?: string;
  performance_notes?: string;
  difficulty_level?: number;
  acts_count?: number;
  total_duration_minutes?: number;
  premiere_date?: string;
  premiere_venue?: string;
  catalogue_number?: string;
  recommended_recording?: string;
}

interface ParsedRole {
  work_title: string;
  composer?: string;
  role_name: string;
  voice_type?: string;
  role_type?: string;
  description?: string;
  difficulty_level?: number;
  tessitura_min?: string;
  tessitura_max?: string;
  vocal_characteristics?: string;
}

interface ParsedAria {
  work_title: string;
  role_name?: string;
  title: string;
  act_number?: number;
  scene_number?: number;
  key_signature?: string;
  tempo_marking?: string;
  difficulty_level?: number;
  duration_minutes?: number;
  aria_type?: string;
  dramatic_context?: string;
  first_line?: string;
  vocal_technique_notes?: string;
  tessitura_min?: string;
  tessitura_max?: string;
}

function detectImportType(headers: string[]): string {
  const lowerHeaders = headers.map(h => h.toLowerCase().trim());
  
  if (lowerHeaders.includes('air_titre') || lowerHeaders.includes('aria_title')) {
    return 'arias';
  }
  if (lowerHeaders.includes('role_nom') || lowerHeaders.includes('role_name')) {
    return 'roles';
  }
  if (lowerHeaders.includes('compositeur_naissance') || lowerHeaders.includes('composer_birth')) {
    return 'composers';
  }
  if (lowerHeaders.includes('titre') || lowerHeaders.includes('title')) {
    return 'works';
  }
  
  return 'complete';
}

function parseComposerRow(row: string[], headers: string[]): ParsedComposer | null {
  const data: any = {};
  headers.forEach((header, index) => {
    data[header.toLowerCase().trim()] = row[index]?.trim() || '';
  });

  const name = data.compositeur || data.composer || data.nom || data.name;
  if (!name) return null;

  return {
    name,
    complete_name: data.compositeur_nom_complet || data.composer_full_name || data.complete_name,
    birth_year: data.compositeur_naissance || data.composer_birth ? parseInt(data.compositeur_naissance || data.composer_birth) : undefined,
    death_year: data.compositeur_mort || data.composer_death ? parseInt(data.compositeur_mort || data.composer_death) : undefined,
    epoch: data.compositeur_epoque || data.composer_epoch || data.epoch || data.epoque,
    biography: data.compositeur_biographie || data.composer_biography || data.biography || data.biographie,
    portrait_url: data.compositeur_portrait || data.composer_portrait || data.portrait_url
  };
}

function parseWorkRow(row: string[], headers: string[]): ParsedWork | null {
  const data: any = {};
  headers.forEach((header, index) => {
    data[header.toLowerCase().trim()] = row[index]?.trim() || '';
  });

  const title = data.titre || data.title;
  const composer = data.compositeur || data.composer;
  const category = data.catégorie || data.category || data.categorie;

  if (!title || !composer || !category) return null;

  return {
    title,
    composer,
    category,
    genre: data.genre,
    period: data.période || data.period || data.periode,
    language: data.langue || data.language,
    description: data.description,
    synopsis: data.synopsis,
    librettist: data.librettiste || data.librettist,
    historical_context: data.contexte_historique || data.historical_context,
    performance_notes: data.notes_interpretation || data.performance_notes,
    difficulty_level: data.difficulté || data.difficulty ? parseInt(data.difficulté || data.difficulty) : undefined,
    acts_count: data.nombre_actes || data.acts_count ? parseInt(data.nombre_actes || data.acts_count) : undefined,
    total_duration_minutes: data.durée_totale || data.total_duration ? parseInt(data.durée_totale || data.total_duration) : undefined,
    premiere_date: data.date_création || data.premiere_date,
    premiere_venue: data.lieu_création || data.premiere_venue,
    catalogue_number: data.numéro_catalogue || data.catalogue_number,
    recommended_recording: data.enregistrement_recommandé || data.recommended_recording
  };
}

function parseRoleRow(row: string[], headers: string[]): ParsedRole | null {
  const data: any = {};
  headers.forEach((header, index) => {
    data[header.toLowerCase().trim()] = row[index]?.trim() || '';
  });

  const workTitle = data.oeuvre_titre || data.work_title || data.titre || data.title;
  const roleName = data.role_nom || data.role_name || data.nom || data.name;

  if (!workTitle || !roleName) return null;

  return {
    work_title: workTitle,
    composer: data.compositeur || data.composer,
    role_name: roleName,
    voice_type: data.role_tessiture || data.voice_type || data.tessiture,
    role_type: data.role_type || data.type,
    description: data.role_description || data.description,
    difficulty_level: data.role_difficulté || data.difficulty ? parseInt(data.role_difficulté || data.difficulty) : undefined,
    tessitura_min: data.tessiture_min || data.tessitura_min,
    tessitura_max: data.tessiture_max || data.tessitura_max,
    vocal_characteristics: data.caractéristiques_vocales || data.vocal_characteristics
  };
}

function parseAriaRow(row: string[], headers: string[]): ParsedAria | null {
  const data: any = {};
  headers.forEach((header, index) => {
    data[header.toLowerCase().trim()] = row[index]?.trim() || '';
  });

  const workTitle = data.oeuvre_titre || data.work_title || data.titre;
  const title = data.air_titre || data.aria_title || data.title;

  if (!workTitle || !title) return null;

  return {
    work_title: workTitle,
    role_name: data.role_nom || data.role_name,
    title,
    act_number: data.air_acte || data.act_number ? parseInt(data.air_acte || data.act_number) : undefined,
    scene_number: data.air_scène || data.scene_number ? parseInt(data.air_scène || data.scene_number) : undefined,
    key_signature: data.air_tonalité || data.key_signature,
    tempo_marking: data.air_tempo || data.tempo_marking,
    difficulty_level: data.air_difficulté || data.difficulty ? parseInt(data.air_difficulté || data.difficulty) : undefined,
    duration_minutes: data.air_durée || data.duration ? parseInt(data.air_durée || data.duration) : undefined,
    aria_type: data.air_type || data.aria_type,
    dramatic_context: data.air_contexte || data.dramatic_context,
    first_line: data.air_premier_vers || data.first_line,
    vocal_technique_notes: data.air_technique || data.vocal_technique,
    tessitura_min: data.tessiture_min || data.tessitura_min,
    tessitura_max: data.tessiture_max || data.tessitura_max
  };
}

Deno.serve(async (req) => {
  console.log('=== Complete CSV Import Function Called ===');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { csvData, importType, skipDuplicates = true }: ImportOptions = await req.json();

    if (!csvData) {
      throw new Error('CSV data is required');
    }

    console.log(`Import type: ${importType}, Skip duplicates: ${skipDuplicates}`);

    const lines = csvData.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error('CSV must contain at least a header row and one data row');
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const detectedType = importType === 'complete' ? detectImportType(headers) : importType;

    console.log(`Detected/Selected import type: ${detectedType}`);
    console.log(`Headers: ${headers.join(', ')}`);

    const result: ImportResult = {
      success: true,
      imported: { composers: 0, works: 0, roles: 0, arias: 0 },
      errors: [],
      message: ''
    };

    // Process each row based on detected/selected type
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(',').map(cell => cell.trim().replace(/"/g, ''));
      
      try {
        if (detectedType === 'composers' || detectedType === 'complete') {
          const composer = parseComposerRow(row, headers);
          if (composer) {
            // Check for duplicates
            const { data: existing } = await supabase
              .from('composers')
              .select('id')
              .eq('name', composer.name)
              .single();

            if (!existing || !skipDuplicates) {
              const { error } = await supabase
                .from('composers')
                .insert(composer);

              if (!error) {
                result.imported.composers++;
              } else {
                result.errors.push(`Composer ${composer.name}: ${error.message}`);
              }
            }
          }
        }

        if (detectedType === 'works' || detectedType === 'complete') {
          const work = parseWorkRow(row, headers);
          if (work) {
            // Find or create composer
            let composerId: string | null = null;
            const { data: existingComposer } = await supabase
              .from('composers')
              .select('id')
              .eq('name', work.composer)
              .single();

            if (existingComposer) {
              composerId = existingComposer.id;
            } else {
              const { data: newComposer, error: composerError } = await supabase
                .from('composers')
                .insert({ name: work.composer })
                .select('id')
                .single();

              if (!composerError && newComposer) {
                composerId = newComposer.id;
                result.imported.composers++;
              }
            }

            // Check for duplicate works
            const { data: existingWork } = await supabase
              .from('lyrical_works')
              .select('id')
              .eq('title', work.title)
              .eq('composer', work.composer)
              .single();

            if (!existingWork || !skipDuplicates) {
              const { error } = await supabase
                .from('lyrical_works')
                .insert({ ...work, composer_id: composerId });

              if (!error) {
                result.imported.works++;
              } else {
                result.errors.push(`Work ${work.title}: ${error.message}`);
              }
            }
          }
        }

        if (detectedType === 'roles') {
          const role = parseRoleRow(row, headers);
          if (role) {
            // Find work
            const { data: work } = await supabase
              .from('lyrical_works')
              .select('id')
              .eq('title', role.work_title)
              .single();

            if (work) {
              const { error } = await supabase
                .from('work_roles')
                .insert({ ...role, work_id: work.id, role_name: role.role_name });

              if (!error) {
                result.imported.roles++;
              } else {
                result.errors.push(`Role ${role.role_name}: ${error.message}`);
              }
            } else {
              result.errors.push(`Work not found for role ${role.role_name}: ${role.work_title}`);
            }
          }
        }

        if (detectedType === 'arias') {
          const aria = parseAriaRow(row, headers);
          if (aria) {
            // Find work
            const { data: work } = await supabase
              .from('lyrical_works')
              .select('id')
              .eq('title', aria.work_title)
              .single();

            if (work) {
              let roleId: string | null = null;
              
              // Find role if specified
              if (aria.role_name) {
                const { data: role } = await supabase
                  .from('work_roles')
                  .select('id')
                  .eq('work_id', work.id)
                  .eq('role_name', aria.role_name)
                  .single();

                if (role) {
                  roleId = role.id;
                }
              }

              const { error } = await supabase
                .from('arias')
                .insert({ 
                  ...aria, 
                  work_id: work.id, 
                  role_id: roleId 
                });

              if (!error) {
                result.imported.arias++;
              } else {
                result.errors.push(`Aria ${aria.title}: ${error.message}`);
              }
            } else {
              result.errors.push(`Work not found for aria ${aria.title}: ${aria.work_title}`);
            }
          }
        }

      } catch (rowError) {
        result.errors.push(`Row ${i + 1}: ${rowError.message}`);
      }
    }

    const totalImported = Object.values(result.imported).reduce((sum, count) => sum + count, 0);
    result.message = `Import terminé: ${totalImported} éléments importés (${result.imported.composers} compositeurs, ${result.imported.works} œuvres, ${result.imported.roles} rôles, ${result.imported.arias} airs)`;

    if (result.errors.length > 0) {
      result.message += `. ${result.errors.length} erreurs rencontrées.`;
    }

    console.log('Import completed:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Import error:', error);
    
    const result: ImportResult = {
      success: false,
      imported: { composers: 0, works: 0, roles: 0, arias: 0 },
      errors: [error.message],
      message: `Erreur lors de l'import: ${error.message}`
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});