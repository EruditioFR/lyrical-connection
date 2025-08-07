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
      // Get all composers from our database
      const { data: composers } = await supabase
        .from('composers')
        .select('id, openopus_id, name')
        .not('openopus_id', 'is', null);

      console.log(`Processing works for ${composers?.length || 0} composers`);

      if (composers) {
        for (const composer of composers) {
          try {
            console.log(`Processing composer: ${composer.name} (OpenOpus ID: ${composer.openopus_id})`);
            
            // Fetch ALL works for this composer, not just operas
            const worksResponse = await fetch(
              `https://api.openopus.org/work/list/composer/${composer.openopus_id}.json`
            );

            console.log(`API Response status for ${composer.name}: ${worksResponse.status}`);

            if (worksResponse.ok) {
              const worksData = await worksResponse.json();
              console.log(`Raw works data for ${composer.name}:`, JSON.stringify(worksData, null, 2));
              
              if (worksData.works && Array.isArray(worksData.works)) {
                console.log(`Found ${worksData.works.length} total works for ${composer.name}`);
                
                // Filter for vocal/lyrical works
                const vocalWorks = worksData.works.filter(work => {
                  const hasVocalGenre = work.genre && (
                    work.genre.toLowerCase().includes('opera') ||
                    work.genre.toLowerCase().includes('vocal') ||
                    work.genre.toLowerCase().includes('song') ||
                    work.genre.toLowerCase().includes('lied') ||
                    work.genre.toLowerCase().includes('aria') ||
                    work.genre.toLowerCase().includes('cantata') ||
                    work.genre.toLowerCase().includes('oratorio') ||
                    work.genre.toLowerCase().includes('mass') ||
                    work.genre.toLowerCase().includes('requiem')
                  );
                  
                  const hasVocalTerms = work.searchterms?.toLowerCase().includes('voice') ||
                    work.title.toLowerCase().includes('aria') ||
                    work.title.toLowerCase().includes('song');
                    
                  return hasVocalGenre || hasVocalTerms;
                });
                
                console.log(`Filtered to ${vocalWorks.length} vocal works for ${composer.name}`);
                
                for (const work of vocalWorks) {
                  try {
                    console.log(`Processing work: ${work.title} (Genre: ${work.genre})`);
                    
                    // Check if work already exists
                    const { data: existingWork } = await supabase
                      .from('lyrical_works')
                      .select('id')
                      .eq('openopus_work_id', work.id)
                      .maybeSingle();

                    if (!existingWork) {
                      console.log(`Inserting new work: ${work.title}`);
                      const { error: workError } = await supabase
                        .from('lyrical_works')
                        .insert({
                          title: work.title,
                          composer: composer.name,
                          composer_id: composer.id,
                          openopus_id: composer.openopus_id,
                          openopus_work_id: work.id,
                          category: work.genre || 'Vocal',
                          genre: work.genre,
                          description: work.subtitle,
                          recommended_recording: work.recommended,
                          external_urls: {
                            openopus: `https://openopus.org/work/${work.id}`
                          }
                        });

                      if (workError) {
                        console.error(`Error inserting work ${work.title}:`, workError);
                        errors.push(`Work ${work.title}: ${workError.message}`);
                      } else {
                        totalImported++;
                        console.log(`Successfully imported work: ${work.title} by ${composer.name}`);
                      }
                    } else {
                      console.log(`Work already exists: ${work.title}`);
                    }
                  } catch (error) {
                    console.error(`Error processing work ${work.title}:`, error);
                    errors.push(`Work ${work.title}: ${error.message}`);
                  }
                }
              } else {
                console.log(`No works found in API response for ${composer.name}`);
              }
            } else {
              console.error(`API request failed for ${composer.name}: ${worksResponse.status} ${worksResponse.statusText}`);
            }
          } catch (error) {
            console.error(`Error processing composer ${composer.name}:`, error);
            errors.push(`Works for ${composer.name}: ${error.message}`);
          }

          // Add delay to respect API rate limits
          await new Promise(resolve => setTimeout(resolve, 100));
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