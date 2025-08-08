import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OpenOpusComposer {
  id: string;
  name: string;
  complete_name: string;
  birth: string;
  death: string;
  epoch: string;
  portrait: string;
}

interface OpenOpusWork {
  id: string;
  title: string;
  subtitle?: string;
  searchterms?: string;
  popular?: string;
  recommended?: string;
  genre?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { searchQuery, importMode } = await req.json();
    
    console.log(`Starting OpenOpus import - Mode: ${importMode}, Query: ${searchQuery}`);
    
    let totalImported = 0;
    let errors: string[] = [];

    if (importMode === 'composers' || importMode === 'all') {
      // Fetch composers from OpenOpus
      const composersResponse = await fetch(
        `https://api.openopus.org/composer/list/search/${encodeURIComponent(searchQuery || 'opera')}.json`
      );
      
      if (!composersResponse.ok) {
        throw new Error(`OpenOpus API error: ${composersResponse.status}`);
      }

      const composersData = await composersResponse.json();
      console.log(`Found ${composersData.composers?.length || 0} composers`);

      if (composersData.composers) {
        for (const composer of composersData.composers) {
          try {
            // Check if composer already exists
            const { data: existingComposer } = await supabase
              .from('composers')
              .select('id')
              .eq('openopus_id', composer.id)
              .single();

            if (!existingComposer) {
              const { error: composerError } = await supabase
                .from('composers')
                .insert({
                  openopus_id: composer.id,
                  name: composer.name,
                  complete_name: composer.complete_name,
                  birth_year: composer.birth ? parseInt(composer.birth) : null,
                  death_year: composer.death ? parseInt(composer.death) : null,
                  epoch: composer.epoch,
                  portrait_url: composer.portrait,
                });

              if (composerError) {
                errors.push(`Composer ${composer.name}: ${composerError.message}`);
              } else {
                totalImported++;
                console.log(`Imported composer: ${composer.name}`);
              }
            }
          } catch (error) {
            errors.push(`Composer ${composer.name}: ${error.message}`);
          }
        }
      }
    }

    if (importMode === 'works' || importMode === 'all') {
      console.log('OpenOpus works API is currently broken. Creating sample lyrical works instead.');
      
      // Since OpenOpus works API is broken, create a curated list of major lyrical works
      const curatedWorks = [
        // Mozart Opera
        { composer: 'Mozart', title: 'Don Giovanni', category: 'Opera', genre: 'Opera buffa', openopus_id: '196' },
        { composer: 'Mozart', title: 'Le nozze di Figaro', category: 'Opera', genre: 'Opera buffa', openopus_id: '196' },
        { composer: 'Mozart', title: 'Così fan tutte', category: 'Opera', genre: 'Opera buffa', openopus_id: '196' },
        { composer: 'Mozart', title: 'Die Zauberflöte', category: 'Opera', genre: 'Singspiel', openopus_id: '196' },
        { composer: 'Mozart', title: 'Idomeneo', category: 'Opera', genre: 'Opera seria', openopus_id: '196' },
        { composer: 'Mozart', title: 'Requiem en ré mineur K. 626', category: 'Messe', genre: 'Sacred music', openopus_id: '196' },
        { composer: 'Mozart', title: 'Messe du Couronnement K. 317', category: 'Messe', genre: 'Sacred music', openopus_id: '196' },
        { composer: 'Mozart', title: 'Vespres solennelles K. 339', category: 'Musique sacrée', genre: 'Sacred music', openopus_id: '196' },

        // Verdi Opera  
        { composer: 'Verdi', title: 'La traviata', category: 'Opera', genre: 'Opera', openopus_id: '35' },
        { composer: 'Verdi', title: 'Rigoletto', category: 'Opera', genre: 'Opera', openopus_id: '35' },
        { composer: 'Verdi', title: 'Il trovatore', category: 'Opera', genre: 'Opera', openopus_id: '35' },
        { composer: 'Verdi', title: 'Aida', category: 'Opera', genre: 'Opera', openopus_id: '35' },
        { composer: 'Verdi', title: 'Un ballo in maschera', category: 'Opera', genre: 'Opera', openopus_id: '35' },
        { composer: 'Verdi', title: 'Otello', category: 'Opera', genre: 'Opera', openopus_id: '35' },
        { composer: 'Verdi', title: 'Falstaff', category: 'Opera', genre: 'Opera', openopus_id: '35' },
        { composer: 'Verdi', title: 'La forza del destino', category: 'Opera', genre: 'Opera', openopus_id: '35' },
        { composer: 'Verdi', title: 'Requiem', category: 'Messe', genre: 'Sacred music', openopus_id: '35' },
      ];

      // Filter works based on search query if provided
      let worksToImport = curatedWorks;
      if (searchQuery && searchQuery.length > 1) {
        worksToImport = curatedWorks.filter(work => 
          work.composer.toLowerCase().includes(searchQuery.toLowerCase()) ||
          work.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      console.log(`Importing ${worksToImport.length} curated lyrical works`);

      for (const work of worksToImport) {
        try {
          // Find composer in our database
          const { data: composer } = await supabase
            .from('composers')
            .select('id')
            .eq('name', work.composer)
            .single();

          if (!composer) {
            console.log(`Composer ${work.composer} not found in database, skipping work ${work.title}`);
            continue;
          }

          // Check if work already exists
          const { data: existingWork } = await supabase
            .from('lyrical_works')
            .select('id')
            .eq('title', work.title)
            .eq('composer', work.composer)
            .maybeSingle();

          if (!existingWork) {
            console.log(`Inserting new work: ${work.title} by ${work.composer}`);
            
            // Generate unique curated work id and avoid duplicate composer openopus_id constraint
            const slugify = (s: string) =>
              s.toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
            const uniqueWorkId = `${work.composer.toLowerCase()}-${slugify(work.title)}-curated`;

            const { error: workError } = await supabase
              .from('lyrical_works')
              .insert({
                title: work.title,
                composer: work.composer,
                composer_id: composer.id,
                // Leave openopus_id null to respect unique constraint on that column
                openopus_id: null,
                openopus_work_id: uniqueWorkId,
                category: work.category,
                genre: work.genre,
                description: `${work.category} by ${work.composer}`,
                external_urls: {
                  source: 'Curated database',
                  composer_openopus_id: work.openopus_id
                }
              });

            if (workError) {
              console.error(`Error inserting work ${work.title}:`, workError);
              errors.push(`Work ${work.title}: ${workError.message}`);
            } else {
              totalImported++;
              console.log(`Successfully imported work: ${work.title} by ${work.composer}`);
            }
          } else {
            console.log(`Work already exists: ${work.title}`);
          }
        } catch (error) {
          console.error(`Error processing work ${work.title}:`, error);
          errors.push(`Work ${work.title}: ${error.message}`);
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      imported: totalImported,
      errors: errors.slice(0, 10), // Limit errors in response
      message: `Import completed. ${totalImported} items imported with ${errors.length} errors.`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Import error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});