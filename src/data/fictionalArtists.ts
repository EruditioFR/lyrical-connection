import type { Artist } from '@/hooks/useArtists';

// Artistes fictifs pour enrichir la page /artistes
export const fictionalArtists: Artist[] = [
  {
    id: 'fictional-1',
    stage_name: 'Isabella Rossini',
    voice_type: 'Soprano colorature',
    bio: 'Soprano italienne spécialisée dans le bel canto. Formée au Conservatoire de Milan, elle s\'est produite dans les plus grands opéras européens.',
    location: 'Milan, Italie',
    profile_image_url: null,
    is_active: true,
    experience_years: 12,
    repertoire: ['Verdi - La Traviata', 'Puccini - La Bohème', 'Donizetti - Lucia di Lammermoor'],
    contact_email: 'isabella.rossini@exemple.it'
  },
  {
    id: 'fictional-2',
    stage_name: 'Pierre Dubois',
    voice_type: 'Ténor lyrique',
    bio: 'Ténor français au répertoire romantique étendu. Diplômé du CNSMD de Paris, il se produit régulièrement à l\'Opéra de Paris.',
    location: 'Paris, France',
    profile_image_url: null,
    is_active: true,
    experience_years: 8,
    repertoire: ['Gounod - Faust', 'Bizet - Carmen', 'Massenet - Werther'],
    contact_email: 'pierre.dubois@exemple.fr'
  },
  {
    id: 'fictional-3',
    stage_name: 'Maria Wagner',
    voice_type: 'Soprano dramatique',
    bio: 'Soprano allemande spécialisée dans le répertoire wagnérien. Formée à la Hochschule de Berlin, elle interprète les grands rôles dramatiques.',
    location: 'Berlin, Allemagne',
    profile_image_url: null,
    is_active: true,
    experience_years: 15,
    repertoire: ['Wagner - Tristan und Isolde', 'Wagner - Der Ring des Nibelungen', 'Strauss - Salome'],
    contact_email: 'maria.wagner@exemple.de'
  },
  {
    id: 'fictional-4',
    stage_name: 'Antonio Silva',
    voice_type: 'Baryton',
    bio: 'Baryton espagnol au charisme exceptionnel. Passionné de zarzuela et d\'opéra italien, il enchante les publics méditerranéens.',
    location: 'Séville, Espagne',
    profile_image_url: null,
    is_active: true,
    experience_years: 10,
    repertoire: ['Verdi - Rigoletto', 'Mozart - Don Giovanni', 'Bizet - Carmen'],
    contact_email: 'antonio.silva@exemple.es'
  },
  {
    id: 'fictional-5',
    stage_name: 'Charlotte Moreau',
    voice_type: 'Mezzo-soprano',
    bio: 'Mezzo-soprano française spécialisée dans la mélodie française et l\'opéra du XIXe siècle. Artiste résidente de l\'Opéra de Lyon.',
    location: 'Lyon, France',
    profile_image_url: null,
    is_active: true,
    experience_years: 6,
    repertoire: ['Bizet - Carmen', 'Saint-Saëns - Samson et Dalila', 'Ravel - L\'Enfant et les sortilèges'],
    contact_email: 'charlotte.moreau@exemple.fr'
  },
  {
    id: 'fictional-6',
    stage_name: 'Giuseppe Romano',
    voice_type: 'Basse',
    bio: 'Basse italienne à la voix profonde et expressive. Spécialiste du répertoire buffa et seria, il apporte humour et gravité à ses interprétations.',
    location: 'Naples, Italie',
    profile_image_url: null,
    is_active: true,
    experience_years: 20,
    repertoire: ['Mozart - Le Nozze di Figaro', 'Rossini - Il Barbiere di Siviglia', 'Verdi - Aida'],
    contact_email: 'giuseppe.romano@exemple.it'
  },
  {
    id: 'fictional-7',
    stage_name: 'Anna Petrov',
    voice_type: 'Soprano lyrique',
    bio: 'Soprano russe à la technique impeccable. Formée au Conservatoire Tchaïkovski de Moscou, elle excelle dans le répertoire slave et français.',
    location: 'Saint-Pétersbourg, Russie',
    profile_image_url: null,
    is_active: true,
    experience_years: 9,
    repertoire: ['Tchaïkovski - Eugène Onéguine', 'Puccini - Tosca', 'Gounod - Roméo et Juliette'],
    contact_email: 'anna.petrov@exemple.ru'
  },
  {
    id: 'fictional-8',
    stage_name: 'James Mitchell',
    voice_type: 'Ténor dramatique',
    bio: 'Ténor britannique au répertoire wagnérien et verdien. Formé au Royal College of Music, il s\'impose sur les scènes internationales.',
    location: 'Londres, Royaume-Uni',
    profile_image_url: null,
    is_active: true,
    experience_years: 14,
    repertoire: ['Wagner - Lohengrin', 'Verdi - Otello', 'Puccini - Turandot'],
    contact_email: 'james.mitchell@exemple.co.uk'
  },
  {
    id: 'fictional-9',
    stage_name: 'Camille Larsson',
    voice_type: 'Alto',
    bio: 'Alto suédoise aux couleurs vocales uniques. Spécialisée dans la musique baroque et contemporaine, elle explore les répertoires rares.',
    location: 'Stockholm, Suède',
    profile_image_url: null,
    is_active: true,
    experience_years: 7,
    repertoire: ['Händel - Giulio Cesare', 'Purcell - Dido and Aeneas', 'Musique contemporaine'],
    contact_email: 'camille.larsson@exemple.se'
  },
  {
    id: 'fictional-10',
    stage_name: 'Lucas Fernández',
    voice_type: 'Basse-baryton',
    bio: 'Basse-baryton mexicain au timbre chaleureux. Passionné de musique ibéro-américaine et d\'opéra italien, il mélange traditions populaires et lyrique.',
    location: 'Mexico, Mexique',
    profile_image_url: null,
    is_active: true,
    experience_years: 11,
    repertoire: ['Verdi - Un Ballo in Maschera', 'Puccini - Tosca', 'Musique mexicaine traditionnelle'],
    contact_email: 'lucas.fernandez@exemple.mx'
  }
];