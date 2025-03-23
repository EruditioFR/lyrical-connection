
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from "@/components/ui/button";
import { PlayCircle, Music, Calendar, MapPin, Share2, Star, Facebook, Instagram, Youtube, Linkedin } from 'lucide-react';

// Données exemples d'artistes (dans un projet réel, ces données viendraient d'une API ou d'une base de données)
const artistsData = {
  '1': {
    id: '1',
    name: 'Sophia Laurent',
    voiceType: 'Soprano',
    image: 'https://images.unsplash.com/photo-1516307343428-2c5675a99540?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
    coverImage: 'https://images.unsplash.com/photo-1514533450685-4493e01d1fdc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    bio: "Sophia Laurent est une soprano française reconnue pour sa voix puissante et expressive. Formée au Conservatoire National Supérieur de Musique de Paris, elle a remporté plusieurs concours internationaux et se produit régulièrement sur les plus grandes scènes d'Europe.",
    specialty: 'Opéra classique',
    experience: '8 ans',
    education: 'Conservatoire National Supérieur de Musique de Paris',
    location: 'Paris, France',
    repertoire: ['La Traviata', 'La Bohème', 'Carmen', 'Les Noces de Figaro'],
    awards: ['Premier Prix du Concours International de Chant de Toulouse (2019)', 'Révélation Artiste Lyrique aux Victoires de la Musique Classique (2020)'],
    socialMedia: {
      facebook: 'https://facebook.com',
      instagram: 'https://instagram.com',
      youtube: 'https://youtube.com',
      linkedin: 'https://linkedin.com'
    },
    videos: [
      {
        title: 'Mozart: Queen of the Night Aria',
        thumbnail: 'https://img.youtube.com/vi/YuBeBjqKSGQ/maxresdefault.jpg',
        url: 'https://www.youtube.com/watch?v=YuBeBjqKSGQ'
      },
      {
        title: 'Puccini: O Mio Babbino Caro',
        thumbnail: 'https://img.youtube.com/vi/RxZSP1Dc78Q/maxresdefault.jpg',
        url: 'https://www.youtube.com/watch?v=RxZSP1Dc78Q'
      }
    ],
    upcomingEvents: [
      {
        id: '101',
        title: 'Récital à l\'Opéra Garnier',
        date: '2023-11-20',
        location: 'Opéra Garnier, Paris'
      },
      {
        id: '102',
        title: 'La Traviata',
        date: '2023-12-15',
        location: 'Opéra Bastille, Paris'
      }
    ]
  }
};

const ArtistProfile = () => {
  const { id } = useParams<{ id: string }>();
  
  // Récupère les données de l'artiste en fonction de l'ID
  const artist = id ? artistsData[id as keyof typeof artistsData] : null;

  // Si l'artiste n'existe pas, affiche un message d'erreur
  if (!artist) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-3xl font-serif font-bold mb-4">Artiste non trouvé</h1>
            <p className="text-muted-foreground mb-6">
              L'artiste que vous recherchez n'existe pas ou a été supprimé.
            </p>
            <Button asChild>
              <Link to="/artistes">Retour à la liste des artistes</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  // Formater la date pour les événements à venir
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  return (
    <Layout>
      {/* En-tête de profil avec image de couverture */}
      <div className="relative">
        <div className="h-80 md:h-96 w-full">
          <div className="absolute inset-0">
            <img 
              src={artist.coverImage} 
              alt={`Couverture de ${artist.name}`} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-6 relative">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-20 md:-mt-16">
            <div className="w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-background shadow-lg">
              <img 
                src={artist.image} 
                alt={artist.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-center md:text-left pb-4">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                <h1 className="text-3xl md:text-4xl font-serif font-bold">{artist.name}</h1>
                <span className="inline-block bg-lyrical-100 text-lyrical-800 text-sm font-medium px-3 py-1 rounded-full">
                  {artist.voiceType}
                </span>
              </div>
              <p className="text-muted-foreground mt-1">{artist.specialty} • {artist.location}</p>
            </div>
            <div className="md:ml-auto flex space-x-3 pb-4">
              <Button variant="outline" size="sm" className="gap-2">
                <Share2 className="h-4 w-4" />
                Partager
              </Button>
              <Button size="sm" className="gap-2 bg-gradient-to-r from-lyrical-600 to-gold-500 hover:from-lyrical-700 hover:to-gold-600 text-white">
                <Star className="h-4 w-4" />
                Suivre
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-8">
            {/* Biographie */}
            <section className="bg-card rounded-xl p-6 shadow-sm border border-border">
              <h2 className="text-2xl font-serif font-semibold mb-4">Biographie</h2>
              <p className="text-muted-foreground">{artist.bio}</p>
            </section>

            {/* Vidéos */}
            <section className="bg-card rounded-xl p-6 shadow-sm border border-border">
              <h2 className="text-2xl font-serif font-semibold mb-4">Vidéos</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {artist.videos.map((video, index) => (
                  <div key={index} className="rounded-lg overflow-hidden group">
                    <a 
                      href={video.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block relative aspect-video"
                    >
                      <img 
                        src={video.thumbnail} 
                        alt={video.title} 
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <PlayCircle className="h-12 w-12 text-white" />
                      </div>
                    </a>
                    <h3 className="mt-2 font-medium">{video.title}</h3>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <Button variant="link" className="text-lyrical-700">
                  Voir plus de vidéos
                </Button>
              </div>
            </section>

            {/* Répertoire */}
            <section className="bg-card rounded-xl p-6 shadow-sm border border-border">
              <h2 className="text-2xl font-serif font-semibold mb-4">Répertoire</h2>
              <div className="flex flex-wrap gap-2">
                {artist.repertoire.map((item, index) => (
                  <span 
                    key={index} 
                    className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-sm"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </section>

            {/* Prix et récompenses */}
            <section className="bg-card rounded-xl p-6 shadow-sm border border-border">
              <h2 className="text-2xl font-serif font-semibold mb-4">Prix et récompenses</h2>
              <ul className="space-y-2">
                {artist.awards.map((award, index) => (
                  <li key={index} className="flex items-start">
                    <div className="bg-gold-100 text-gold-700 p-1 rounded-full mr-3 mt-1">
                      <Star className="h-4 w-4" />
                    </div>
                    <span>{award}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Barre latérale */}
          <div className="space-y-6">
            {/* Informations de contact */}
            <section className="bg-card rounded-xl p-6 shadow-sm border border-border">
              <h2 className="text-xl font-serif font-semibold mb-4">Informations</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Music className="h-5 w-5 text-muted-foreground mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Type de voix</p>
                    <p className="font-medium">{artist.voiceType}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-muted-foreground mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Expérience</p>
                    <p className="font-medium">{artist.experience}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-muted-foreground mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Localisation</p>
                    <p className="font-medium">{artist.location}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Réseaux sociaux</h3>
                <div className="flex space-x-3">
                  <a
                    href={artist.socialMedia.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-muted hover:bg-muted/80 transition-colors p-2 rounded-full"
                    aria-label="Facebook"
                  >
                    <Facebook className="h-5 w-5" />
                  </a>
                  <a
                    href={artist.socialMedia.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-muted hover:bg-muted/80 transition-colors p-2 rounded-full"
                    aria-label="Instagram"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                  <a
                    href={artist.socialMedia.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-muted hover:bg-muted/80 transition-colors p-2 rounded-full"
                    aria-label="YouTube"
                  >
                    <Youtube className="h-5 w-5" />
                  </a>
                  <a
                    href={artist.socialMedia.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-muted hover:bg-muted/80 transition-colors p-2 rounded-full"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </section>

            {/* Événements à venir */}
            <section className="bg-card rounded-xl p-6 shadow-sm border border-border">
              <h2 className="text-xl font-serif font-semibold mb-4">Événements à venir</h2>
              {artist.upcomingEvents.length === 0 ? (
                <p className="text-muted-foreground">Aucun événement à venir pour le moment.</p>
              ) : (
                <div className="space-y-4">
                  {artist.upcomingEvents.map((event) => (
                    <div key={event.id} className="border-b border-border last:border-0 pb-4 last:pb-0">
                      <h3 className="font-medium">
                        <Link to={`/evenements/${event.id}`} className="hover:text-lyrical-700 transition-colors">
                          {event.title}
                        </Link>
                      </h3>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{formatDate(event.date)}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{event.location}</span>
                      </div>
                      <div className="mt-2">
                        <Button variant="outline" size="sm" className="w-full" asChild>
                          <Link to={`/evenements/${event.id}`}>
                            Détails et réservation
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Bouton de contact */}
            <div className="bg-gradient-to-r from-lyrical-600 to-gold-500 p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-serif font-semibold text-white mb-3">Vous êtes intéressé ?</h2>
              <p className="text-white/90 mb-4">Contactez cet artiste pour vos projets ou événements.</p>
              <Button className="w-full bg-white hover:bg-white/90 text-lyrical-900">
                Contacter l'artiste
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ArtistProfile;
