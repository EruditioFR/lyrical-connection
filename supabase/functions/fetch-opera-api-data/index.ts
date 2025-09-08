import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FetchOperaDataRequest {
  dataSource: 'musicbrainz' | 'wikidata' | 'openopus' | 'comprehensive';
  searchQuery?: string;
  composerName?: string;
  category?: 'opera' | 'oratorio' | 'lied' | 'all';
  limit?: number;
}

interface ComposerData {
  name: string;
  complete_name?: string;
  birth_year?: number;
  death_year?: number;
  epoch?: string;
  biography?: string;
  portrait_url?: string;
}

interface WorkData {
  title: string;
  composer: string;
  category: string;
  genre?: string;
  period?: string;
  language?: string;
  description?: string;
  premiere_date?: string;
  premiere_venue?: string;
  librettist?: string;
  acts_count?: number;
  total_duration_minutes?: number;
  catalogue_number?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const {
      dataSource,
      searchQuery,
      composerName,
      category = 'all',
      limit = 50
    }: FetchOperaDataRequest = await req.json();

    console.log(`Fetching opera data from ${dataSource}:`, { searchQuery, composerName, category, limit });

    let composers: ComposerData[] = [];
    let works: WorkData[] = [];
    let importedCount = { composers: 0, works: 0, roles: 0, arias: 0 };
    let errors: string[] = [];

    switch (dataSource) {
      case 'musicbrainz':
        ({ composers, works } = await fetchFromMusicBrainz(searchQuery, composerName, category, limit));
        break;
      case 'wikidata':
        ({ composers, works } = await fetchFromWikidata(searchQuery, composerName, category, limit));
        break;
      case 'openopus':
        ({ composers, works } = await fetchFromOpenOpus(searchQuery, composerName, category, limit));
        break;
      case 'comprehensive':
        // Combine data from multiple sources
        const mbData = await fetchFromMusicBrainz(searchQuery, composerName, category, Math.floor(limit / 3));
        const wdData = await fetchFromWikidata(searchQuery, composerName, category, Math.floor(limit / 3));
        const ooData = await fetchFromOpenOpus(searchQuery, composerName, category, Math.floor(limit / 3));
        
        composers = [...mbData.composers, ...wdData.composers, ...ooData.composers];
        works = [...mbData.works, ...wdData.works, ...ooData.works];
        
        // Remove duplicates
        composers = deduplicateComposers(composers);
        works = deduplicateWorks(works);
        break;
      default:
        throw new Error('Source de données non supportée');
    }

    // Import composers
    for (const composer of composers) {
      try {
        const { error } = await supabase
          .from('composers')
          .upsert(composer, { onConflict: 'name' });
        
        if (!error) {
          importedCount.composers++;
        } else {
          errors.push(`Composer ${composer.name}: ${error.message}`);
        }
      } catch (err) {
        errors.push(`Composer ${composer.name}: ${err.message}`);
      }
    }

    // Import works
    for (const work of works) {
      try {
        // Find composer ID
        const { data: composer } = await supabase
          .from('composers')
          .select('id')
          .eq('name', work.composer)
          .single();

        if (composer) {
          const workWithComposerId = { ...work, composer_id: composer.id };
          
          const { error } = await supabase
            .from('lyrical_works')
            .upsert(workWithComposerId, { onConflict: 'title,composer' });
          
          if (!error) {
            importedCount.works++;
          } else {
            errors.push(`Work ${work.title}: ${error.message}`);
          }
        } else {
          errors.push(`Work ${work.title}: Composer not found`);
        }
      } catch (err) {
        errors.push(`Work ${work.title}: ${err.message}`);
      }
    }

    const result = {
      success: true,
      dataSource,
      imported: importedCount,
      foundData: {
        composers: composers.length,
        works: works.length
      },
      errors,
      message: `Import depuis ${dataSource} terminé: ${importedCount.composers} compositeurs, ${importedCount.works} œuvres importées`
    };

    console.log('API data fetch completed:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in fetch-opera-api-data:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function fetchFromMusicBrainz(searchQuery?: string, composerName?: string, category?: string, limit = 50): Promise<{composers: ComposerData[], works: WorkData[]}> {
  console.log('Fetching from MusicBrainz API...');
  
  const composers: ComposerData[] = [];
  const works: WorkData[] = [];

  try {
    // Search for composers
    const composerQuery = composerName || searchQuery || 'Mozart OR Verdi OR Puccini OR Rossini OR Donizetti';
    const composerUrl = `https://musicbrainz.org/ws/2/artist?query=${encodeURIComponent(composerQuery)}&type:person AND tag:classical&fmt=json&limit=${Math.min(limit, 25)}`;
    
    const composerResponse = await fetch(composerUrl, {
      headers: { 'User-Agent': 'OperaDB/1.0 (https://opera-database.com)' }
    });
    
    if (composerResponse.ok) {
      const composerData = await composerResponse.json();
      
      for (const artist of composerData.artists || []) {
        if (artist.type === 'Person' && artist.tags?.some((tag: any) => 
          ['classical', 'opera', 'baroque', 'romantic'].includes(tag.name.toLowerCase())
        )) {
          composers.push({
            name: artist.name,
            complete_name: artist.name,
            birth_year: artist['life-span']?.begin ? parseInt(artist['life-span'].begin.split('-')[0]) : undefined,
            death_year: artist['life-span']?.end ? parseInt(artist['life-span'].end.split('-')[0]) : undefined,
            epoch: determineEpoch(artist['life-span']?.begin),
            biography: `${artist.name} - Compositeur ${artist.tags?.map((t: any) => t.name).join(', ') || 'classique'}`
          });
        }
      }

      // Search for works of each composer
      for (const composer of composers.slice(0, 10)) { // Limit to avoid too many requests
        try {
          const workUrl = `https://musicbrainz.org/ws/2/work?query=artist:"${encodeURIComponent(composer.name)}" AND type:opera&fmt=json&limit=20`;
          
          const workResponse = await fetch(workUrl, {
            headers: { 'User-Agent': 'OperaDB/1.0 (https://opera-database.com)' }
          });
          
          if (workResponse.ok) {
            const workData = await workResponse.json();
            
            for (const work of workData.works || []) {
              if (work.type === 'Opera' || work.type === 'Oratorio' || 
                  (category === 'all' && ['Song', 'Mass', 'Cantata'].includes(work.type))) {
                works.push({
                  title: work.title,
                  composer: composer.name,
                  category: mapMusicBrainzType(work.type),
                  genre: work.type,
                  language: work.language || 'Italien',
                  description: `${work.type} de ${composer.name}`,
                  period: composer.epoch || 'Classique'
                });
              }
            }
          }
          
          // Add delay to respect rate limits
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (err) {
          console.error(`Error fetching works for ${composer.name}:`, err);
        }
      }
    }
  } catch (error) {
    console.error('MusicBrainz API error:', error);
  }

  return { composers, works };
}

async function fetchFromWikidata(searchQuery?: string, composerName?: string, category?: string, limit = 50): Promise<{composers: ComposerData[], works: WorkData[]}> {
  console.log('Fetching from Wikidata API...');
  
  const composers: ComposerData[] = [];
  const works: WorkData[] = [];

  try {
    // SPARQL query for classical composers
    const sparqlQuery = `
      SELECT DISTINCT ?composer ?composerLabel ?birthDate ?deathDate ?image ?description WHERE {
        ?composer wdt:P31 wd:Q5 ;
                 wdt:P106/wdt:P279* wd:Q36834 ;
                 wdt:P136/wdt:P279* wd:Q9730 .
        OPTIONAL { ?composer wdt:P569 ?birthDate }
        OPTIONAL { ?composer wdt:P570 ?deathDate }
        OPTIONAL { ?composer wdt:P18 ?image }
        OPTIONAL { ?composer schema:description ?description FILTER(LANG(?description) = "fr") }
        ${composerName ? `FILTER(CONTAINS(LCASE(?composerLabel), LCASE("${composerName}")))` : ''}
        SERVICE wikibase:label { bd:serviceParam wikibase:language "fr,en" }
      }
      LIMIT ${Math.min(limit, 50)}
    `;

    const wikidataUrl = `https://query.wikidata.org/sparql?query=${encodeURIComponent(sparqlQuery)}&format=json`;
    
    const response = await fetch(wikidataUrl, {
      headers: { 
        'User-Agent': 'OperaDB/1.0 (https://opera-database.com)',
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      
      for (const binding of data.results?.bindings || []) {
        const birthYear = binding.birthDate?.value ? parseInt(binding.birthDate.value.split('-')[0]) : undefined;
        const deathYear = binding.deathDate?.value ? parseInt(binding.deathDate.value.split('-')[0]) : undefined;
        
        composers.push({
          name: binding.composerLabel.value,
          complete_name: binding.composerLabel.value,
          birth_year: birthYear,
          death_year: deathYear,
          epoch: determineEpoch(binding.birthDate?.value),
          biography: binding.description?.value || `Compositeur classique ${binding.composerLabel.value}`,
          portrait_url: binding.image?.value
        });
      }

      // Fetch famous works for each composer
      for (const composer of composers.slice(0, 8)) { // Limit to avoid timeout
        try {
          const worksQuery = `
            SELECT DISTINCT ?work ?workLabel ?genreLabel ?premiereDate ?premiereVenue WHERE {
              ?work wdt:P86 ?composer ;
                   wdt:P31/wdt:P279* wd:Q1344 .
              ?composer rdfs:label "${composer.name}"@fr .
              OPTIONAL { ?work wdt:P136 ?genre }
              OPTIONAL { ?work wdt:P1191 ?premiereDate }
              OPTIONAL { ?work wdt:P4647 ?premiereVenue }
              SERVICE wikibase:label { bd:serviceParam wikibase:language "fr,en" }
            }
            LIMIT 10
          `;

          const worksUrl = `https://query.wikidata.org/sparql?query=${encodeURIComponent(worksQuery)}&format=json`;
          
          const worksResponse = await fetch(worksUrl, {
            headers: { 
              'User-Agent': 'OperaDB/1.0 (https://opera-database.com)',
              'Accept': 'application/json'
            }
          });

          if (worksResponse.ok) {
            const worksData = await worksResponse.json();
            
            for (const work of worksData.results?.bindings || []) {
              works.push({
                title: work.workLabel.value,
                composer: composer.name,
                category: 'Opéra',
                genre: work.genreLabel?.value || 'Opéra',
                period: composer.epoch || 'Classique',
                language: 'Italien',
                description: `${work.genreLabel?.value || 'Opéra'} de ${composer.name}`,
                premiere_date: work.premiereDate?.value?.split('T')[0],
                premiere_venue: work.premiereVenue?.value
              });
            }
          }

          await new Promise(resolve => setTimeout(resolve, 200)); // Rate limiting
        } catch (err) {
          console.error(`Error fetching works for ${composer.name} from Wikidata:`, err);
        }
      }
    }
  } catch (error) {
    console.error('Wikidata API error:', error);
  }

  return { composers, works };
}

async function fetchFromOpenOpus(searchQuery?: string, composerName?: string, category?: string, limit = 50): Promise<{composers: ComposerData[], works: WorkData[]}> {
  console.log('Fetching from OpenOpus API...');
  
  const composers: ComposerData[] = [];
  const works: WorkData[] = [];

  try {
    // Fetch composers from OpenOpus
    const composersUrl = 'https://api.openopus.org/composer/list/pop.json';
    const composersResponse = await fetch(composersUrl);
    
    if (composersResponse.ok) {
      const composersData = await composersResponse.json();
      
      for (const composer of (composersData.composers || []).slice(0, limit)) {
        if (!composerName || composer.complete_name.toLowerCase().includes(composerName.toLowerCase())) {
          composers.push({
            name: composer.name,
            complete_name: composer.complete_name,
            birth_year: parseInt(composer.birth) || undefined,
            death_year: parseInt(composer.death) || undefined,
            epoch: composer.epoch,
            biography: `${composer.complete_name} (${composer.birth}-${composer.death}) - ${composer.epoch}`,
            portrait_url: composer.portrait
          });

          // Fetch works for this composer
          try {
            const worksUrl = `https://api.openopus.org/work/list/composer/${composer.id}/genre/Vocal.json`;
            const worksResponse = await fetch(worksUrl);
            
            if (worksResponse.ok) {
              const worksData = await worksResponse.json();
              
              for (const work of (worksData.works || []).slice(0, 10)) {
                if (work.genre === 'Vocal' && (category === 'all' || 
                    (category === 'opera' && (work.title.toLowerCase().includes('opera') || 
                                              work.title.toLowerCase().includes('don giovanni') ||
                                              work.title.toLowerCase().includes('traviata'))))) {
                  works.push({
                    title: work.title,
                    composer: composer.name,
                    category: determineCategory(work.title, work.genre),
                    genre: work.genre,
                    period: composer.epoch,
                    language: 'Italien',
                    description: `${work.genre} de ${composer.complete_name}`,
                    catalogue_number: work.cataloguename ? `${work.cataloguename} ${work.cataloguenumber}` : undefined
                  });
                }
              }
            }
            
            await new Promise(resolve => setTimeout(resolve, 100)); // Rate limiting
          } catch (err) {
            console.error(`Error fetching works for ${composer.name} from OpenOpus:`, err);
          }
        }
      }
    }
  } catch (error) {
    console.error('OpenOpus API error:', error);
  }

  return { composers, works };
}

// Helper functions
function determineEpoch(birthDate?: string): string {
  if (!birthDate) return 'Classique';
  const year = parseInt(birthDate.split('-')[0]);
  
  if (year < 1600) return 'Renaissance';
  if (year < 1750) return 'Baroque';
  if (year < 1820) return 'Classique';
  if (year < 1900) return 'Romantique';
  if (year < 1950) return 'Moderne';
  return 'Contemporain';
}

function mapMusicBrainzType(type: string): string {
  const mapping: { [key: string]: string } = {
    'Opera': 'Opéra',
    'Oratorio': 'Oratorio',
    'Song': 'Mélodie',
    'Mass': 'Messe',
    'Cantata': 'Cantate'
  };
  return mapping[type] || 'Opéra';
}

function determineCategory(title: string, genre: string): string {
  const titleLower = title.toLowerCase();
  if (titleLower.includes('opera') || titleLower.includes('giovanni') || 
      titleLower.includes('traviata') || titleLower.includes('rigoletto')) {
    return 'Opéra';
  }
  if (titleLower.includes('oratorio') || titleLower.includes('requiem') || titleLower.includes('mass')) {
    return 'Oratorio';
  }
  if (titleLower.includes('lied') || titleLower.includes('song')) {
    return 'Mélodie';
  }
  return 'Opéra';
}

function deduplicateComposers(composers: ComposerData[]): ComposerData[] {
  const seen = new Set<string>();
  return composers.filter(composer => {
    const key = composer.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function deduplicateWorks(works: WorkData[]): WorkData[] {
  const seen = new Set<string>();
  return works.filter(work => {
    const key = `${work.title.toLowerCase()}-${work.composer.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}