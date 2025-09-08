import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateDataRequest {
  templateName: string;
}

interface SampleData {
  composers: any[];
  works: any[];
  roles: any[];
  arias: any[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { templateName }: GenerateDataRequest = await req.json();
    console.log('Generating sample data for template:', templateName);

    let sampleData: SampleData;

    switch (templateName) {
      case 'Mozart - Répertoire classique':
        sampleData = generateMozartData();
        break;
      case 'Verdi - Opéras populaires':
        sampleData = generateVerdiData();
        break;
      case 'Répertoire français':
        sampleData = generateFrenchData();
        break;
      case 'Base complète d\'opéra':
        sampleData = generateCompleteData();
        break;
      default:
        throw new Error('Template inconnu');
    }

    // Import composers first
    let composersImported = 0;
    for (const composer of sampleData.composers) {
      const { error } = await supabase
        .from('composers')
        .upsert(composer, { onConflict: 'name' });
      
      if (!error) {
        composersImported++;
      } else {
        console.error('Error importing composer:', composer.name, error);
      }
    }

    // Import works
    let worksImported = 0;
    for (const work of sampleData.works) {
      // Find composer ID
      const { data: composer } = await supabase
        .from('composers')
        .select('id')
        .eq('name', work.composer)
        .single();

      if (composer) {
        work.composer_id = composer.id;
      }

      const { error } = await supabase
        .from('lyrical_works')
        .upsert(work, { onConflict: 'title,composer' });
      
      if (!error) {
        worksImported++;
      } else {
        console.error('Error importing work:', work.title, error);
      }
    }

    // Import roles
    let rolesImported = 0;
    for (const role of sampleData.roles) {
      // Find work ID
      const { data: work } = await supabase
        .from('lyrical_works')
        .select('id')
        .eq('title', role.work_title)
        .eq('composer', role.composer)
        .single();

      if (work) {
        role.work_id = work.id;
        delete role.work_title;
        delete role.composer;

        const { error } = await supabase
          .from('work_roles')
          .upsert(role, { onConflict: 'work_id,role_name' });
        
        if (!error) {
          rolesImported++;
        } else {
          console.error('Error importing role:', role.role_name, error);
        }
      }
    }

    // Import arias
    let ariasImported = 0;
    for (const aria of sampleData.arias) {
      // Find work ID
      const { data: work } = await supabase
        .from('lyrical_works')
        .select('id')
        .eq('title', aria.work_title)
        .single();

      if (work) {
        aria.work_id = work.id;
        delete aria.work_title;

        const { error } = await supabase
          .from('arias')
          .upsert(aria, { onConflict: 'work_id,title' });
        
        if (!error) {
          ariasImported++;
        } else {
          console.error('Error importing aria:', aria.title, error);
        }
      }
    }

    const result = {
      success: true,
      imported: {
        composers: composersImported,
        works: worksImported,
        roles: rolesImported,
        arias: ariasImported
      },
      message: `Template "${templateName}" importé avec succès`
    };

    console.log('Sample data generation completed:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-sample-data:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateMozartData(): SampleData {
  const composers = [{
    name: 'Mozart',
    complete_name: 'Wolfgang Amadeus Mozart',
    birth_year: 1756,
    death_year: 1791,
    epoch: 'Classique',
    biography: 'Compositeur autrichien, prodige musical du XVIIIe siècle, l\'un des plus grands maîtres de la musique classique.'
  }];

  const works = [
    {
      title: 'Don Giovanni',
      composer: 'Mozart',
      category: 'Opéra',
      genre: 'Dramma giocoso',
      period: 'Classique',
      language: 'Italien',
      description: 'Opéra en deux actes sur un livret de Lorenzo Da Ponte',
      synopsis: 'L\'histoire du séducteur Don Juan et de sa punition finale',
      librettist: 'Lorenzo Da Ponte',
      difficulty_level: 4,
      acts_count: 2,
      total_duration_minutes: 165,
      premiere_date: '1787-10-29',
      premiere_venue: 'Prague'
    },
    {
      title: 'Le nozze di Figaro',
      composer: 'Mozart',
      category: 'Opéra',
      genre: 'Opera buffa',
      period: 'Classique',
      language: 'Italien',
      description: 'Opéra en quatre actes sur un livret de Lorenzo Da Ponte',
      synopsis: 'Les aventures de Figaro et Suzanne le jour de leur mariage',
      librettist: 'Lorenzo Da Ponte',
      difficulty_level: 4,
      acts_count: 4,
      total_duration_minutes: 180,
      premiere_date: '1786-05-01',
      premiere_venue: 'Vienne'
    },
    {
      title: 'Die Zauberflöte',
      composer: 'Mozart',
      category: 'Opéra',
      genre: 'Singspiel',
      period: 'Classique',
      language: 'Allemand',
      description: 'Opéra en deux actes sur un livret d\'Emanuel Schikaneder',
      synopsis: 'Quête initiatique de Tamino pour sauver Pamina',
      librettist: 'Emanuel Schikaneder',
      difficulty_level: 3,
      acts_count: 2,
      total_duration_minutes: 150,
      premiere_date: '1791-09-30',
      premiere_venue: 'Vienne'
    }
  ];

  const roles = [
    // Don Giovanni
    { work_title: 'Don Giovanni', composer: 'Mozart', role_name: 'Don Giovanni', voice_type: 'Baryton', role_type: 'Principal', description: 'Le séducteur légendaire', difficulty_level: 4 },
    { work_title: 'Don Giovanni', composer: 'Mozart', role_name: 'Donna Anna', voice_type: 'Soprano dramatique', role_type: 'Principal', description: 'Noble dame outragée', difficulty_level: 5 },
    { work_title: 'Don Giovanni', composer: 'Mozart', role_name: 'Don Ottavio', voice_type: 'Ténor lyrique', role_type: 'Principal', description: 'Fiancé de Donna Anna', difficulty_level: 4 },
    { work_title: 'Don Giovanni', composer: 'Mozart', role_name: 'Zerlina', voice_type: 'Soprano lyrique', role_type: 'Secondaire', description: 'Jeune paysanne', difficulty_level: 3 },
    
    // Le nozze di Figaro
    { work_title: 'Le nozze di Figaro', composer: 'Mozart', role_name: 'Figaro', voice_type: 'Baryton', role_type: 'Principal', description: 'Valet spirituel du Comte', difficulty_level: 4 },
    { work_title: 'Le nozze di Figaro', composer: 'Mozart', role_name: 'Suzanne', voice_type: 'Soprano lyrique', role_type: 'Principal', description: 'Camériste de la Comtesse', difficulty_level: 4 },
    { work_title: 'Le nozze di Figaro', composer: 'Mozart', role_name: 'Le Comte Almaviva', voice_type: 'Baryton', role_type: 'Principal', description: 'Noble libertin', difficulty_level: 4 },
    { work_title: 'Le nozze di Figaro', composer: 'Mozart', role_name: 'La Comtesse', voice_type: 'Soprano lyrique', role_type: 'Principal', description: 'Épouse délaissée', difficulty_level: 4 },
    
    // Die Zauberflöte
    { work_title: 'Die Zauberflöte', composer: 'Mozart', role_name: 'Tamino', voice_type: 'Ténor lyrique', role_type: 'Principal', description: 'Prince en quête', difficulty_level: 3 },
    { work_title: 'Die Zauberflöte', composer: 'Mozart', role_name: 'Pamina', voice_type: 'Soprano lyrique', role_type: 'Principal', description: 'Fille de la Reine de la Nuit', difficulty_level: 4 },
    { work_title: 'Die Zauberflöte', composer: 'Mozart', role_name: 'Papageno', voice_type: 'Baryton', role_type: 'Principal', description: 'Oiseleur naïf', difficulty_level: 2 },
    { work_title: 'Die Zauberflöte', composer: 'Mozart', role_name: 'Reine de la Nuit', voice_type: 'Soprano colorature', role_type: 'Principal', description: 'Mère vengeresse', difficulty_level: 5 }
  ];

  const arias = [
    // Don Giovanni
    { work_title: 'Don Giovanni', title: 'Là ci darem la mano', act_number: 1, scene_number: 2, key_signature: 'A majeur', difficulty_level: 3, first_line: 'Là ci darem la mano', dramatic_context: 'Duo de séduction avec Zerlina' },
    { work_title: 'Don Giovanni', title: 'Or sai chi l\'onore', act_number: 1, scene_number: 3, key_signature: 'D majeur', difficulty_level: 5, first_line: 'Or sai chi l\'onore', dramatic_context: 'Révélation de Donna Anna' },
    
    // Le nozze di Figaro
    { work_title: 'Le nozze di Figaro', title: 'Largo al factotum', act_number: 1, scene_number: 1, key_signature: 'C majeur', difficulty_level: 4, first_line: 'Se vuol ballare', dramatic_context: 'Défi de Figaro au Comte' },
    { work_title: 'Le nozze di Figaro', title: 'Porgi amor', act_number: 2, scene_number: 1, key_signature: 'E-flat majeur', difficulty_level: 4, first_line: 'Porgi amor', dramatic_context: 'Plainte de la Comtesse' },
    
    // Die Zauberflöte
    { work_title: 'Die Zauberflöte', title: 'Der Vogelfänger bin ich ja', act_number: 1, scene_number: 1, key_signature: 'G majeur', difficulty_level: 2, first_line: 'Der Vogelfänger bin ich ja', dramatic_context: 'Présentation de Papageno' },
    { work_title: 'Die Zauberflöte', title: 'Der Hölle Rache kocht in meinem Herzen', act_number: 2, scene_number: 1, key_signature: 'D mineur', difficulty_level: 5, first_line: 'Der Hölle Rache', dramatic_context: 'Colère de la Reine de la Nuit' }
  ];

  return { composers, works, roles, arias };
}

function generateVerdiData(): SampleData {
  const composers = [{
    name: 'Verdi',
    complete_name: 'Giuseppe Verdi',
    birth_year: 1813,
    death_year: 1901,
    epoch: 'Romantique',
    biography: 'Compositeur italien, maître de l\'opéra romantique, figure emblématique du Risorgimento.'
  }];

  const works = [
    {
      title: 'La Traviata',
      composer: 'Verdi',
      category: 'Opéra',
      genre: 'Melodramma',
      period: 'Romantique',
      language: 'Italien',
      description: 'Opéra en trois actes inspiré de La Dame aux camélias',
      synopsis: 'Histoire d\'amour tragique entre Violetta et Alfredo',
      librettist: 'Francesco Maria Piave',
      difficulty_level: 4,
      acts_count: 3,
      total_duration_minutes: 120,
      premiere_date: '1853-03-06',
      premiere_venue: 'Venise'
    },
    {
      title: 'Rigoletto',
      composer: 'Verdi',
      category: 'Opéra',
      genre: 'Melodramma',
      period: 'Romantique',
      language: 'Italien',
      description: 'Opéra en trois actes d\'après Victor Hugo',
      synopsis: 'Vengeance du bouffon Rigoletto contre le Duc',
      librettist: 'Francesco Maria Piave',
      difficulty_level: 4,
      acts_count: 3,
      total_duration_minutes: 135,
      premiere_date: '1851-03-11',
      premiere_venue: 'Venise'
    }
  ];

  const roles = [
    // La Traviata
    { work_title: 'La Traviata', composer: 'Verdi', role_name: 'Violetta', voice_type: 'Soprano colorature', role_type: 'Principal', description: 'Courtisane parisienne', difficulty_level: 5 },
    { work_title: 'La Traviata', composer: 'Verdi', role_name: 'Alfredo', voice_type: 'Ténor lyrique', role_type: 'Principal', description: 'Jeune bourgeois amoureux', difficulty_level: 3 },
    
    // Rigoletto
    { work_title: 'Rigoletto', composer: 'Verdi', role_name: 'Rigoletto', voice_type: 'Baryton', role_type: 'Principal', description: 'Bouffon bossu de la cour', difficulty_level: 5 },
    { work_title: 'Rigoletto', composer: 'Verdi', role_name: 'Gilda', voice_type: 'Soprano colorature', role_type: 'Principal', description: 'Fille innocente de Rigoletto', difficulty_level: 4 }
  ];

  const arias = [
    // La Traviata
    { work_title: 'La Traviata', title: 'Sempre libera', act_number: 1, scene_number: 4, key_signature: 'F majeur', difficulty_level: 5, first_line: 'Sempre libera degg\'io', dramatic_context: 'Air de bravoure de Violetta' },
    
    // Rigoletto
    { work_title: 'Rigoletto', title: 'La donna è mobile', act_number: 3, scene_number: 1, key_signature: 'B majeur', difficulty_level: 3, first_line: 'La donna è mobile', dramatic_context: 'Chanson cynique du Duc' }
  ];

  return { composers, works, roles, arias };
}

function generateFrenchData(): SampleData {
  const composers = [
    {
      name: 'Massenet',
      complete_name: 'Jules Massenet',
      birth_year: 1842,
      death_year: 1912,
      epoch: 'Romantique',
      biography: 'Compositeur français, maître de l\'opéra lyrique français.'
    },
    {
      name: 'Gounod',
      complete_name: 'Charles Gounod',
      birth_year: 1818,
      death_year: 1893,
      epoch: 'Romantique',
      biography: 'Compositeur français, auteur de Faust et Roméo et Juliette.'
    }
  ];

  const works = [
    {
      title: 'Manon',
      composer: 'Massenet',
      category: 'Opéra',
      genre: 'Opéra comique',
      period: 'Romantique',
      language: 'Français',
      description: 'Opéra en cinq actes d\'après l\'Abbé Prévost',
      synopsis: 'Histoire d\'amour tragique de Manon et Des Grieux',
      librettist: 'Henri Meilhac et Philippe Gille',
      difficulty_level: 4,
      acts_count: 5,
      total_duration_minutes: 150,
      premiere_date: '1884-01-19',
      premiere_venue: 'Paris'
    }
  ];

  const roles = [
    { work_title: 'Manon', composer: 'Massenet', role_name: 'Manon', voice_type: 'Soprano lyrique', role_type: 'Principal', description: 'Jeune femme éprise de luxe', difficulty_level: 4 }
  ];

  const arias = [
    { work_title: 'Manon', title: 'Adieu notre petite table', act_number: 2, scene_number: 2, key_signature: 'A-flat majeur', difficulty_level: 4, first_line: 'Adieu notre petite table', dramatic_context: 'Adieux mélancoliques de Manon' }
  ];

  return { composers, works, roles, arias };
}

function generateCompleteData(): SampleData {
  // Combine all previous data for a complete set
  const mozartData = generateMozartData();
  const verdiData = generateVerdiData();
  const frenchData = generateFrenchData();

  return {
    composers: [...mozartData.composers, ...verdiData.composers, ...frenchData.composers],
    works: [...mozartData.works, ...verdiData.works, ...frenchData.works],
    roles: [...mozartData.roles, ...verdiData.roles, ...frenchData.roles],
    arias: [...mozartData.arias, ...verdiData.arias, ...frenchData.arias]
  };
}