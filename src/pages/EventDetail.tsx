
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock, MapPin, Share2, Users, Music, ArrowLeft } from 'lucide-react';

// Données exemple pour les événements (dans un projet réel, ces données viendraient d'une API)
const eventsData = {
  '1': {
    id: '1',
    title: 'Récital de Jeunes Talents',
    date: '2023-11-15',
    time: '20:00',
    endTime: '22:30',
    location: 'Opéra Garnier, Paris',
    address: '8 Rue Scribe, 75009 Paris',
    description: 'Découvrez les voix exceptionnelles de la nouvelle génération de chanteurs lyriques lors de ce récital unique. Une soirée magique où de jeunes artistes talentueux vous feront voyager à travers un répertoire varié allant du baroque au romantisme.\n\nCe récital offre une plateforme aux jeunes artistes émergents pour présenter leur talent devant un public d\'amateurs et de professionnels. Venez encourager ces voix prometteuses et peut-être découvrir les futures stars de la scène lyrique internationale.',
    category: 'concert',
    image: 'https://images.unsplash.com/photo-1581681682051-7334b4537b14?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    featured: true,
    price: '25€',
    artists: [
      {
        id: '1',
        name: 'Sophia Laurent',
        role: 'Soprano',
        photo: 'https://images.unsplash.com/photo-1516307343428-2c5675a99540?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80'
      },
      {
        id: '2',
        name: 'Jean Dupont',
        role: 'Ténor',
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80'
      }
    ],
    program: [
      { composer: 'W. A. Mozart', piece: 'La Flûte Enchantée, "Der Hölle Rache"' },
      { composer: 'G. Puccini', piece: 'La Bohème, "Che gelida manina"' },
      { composer: 'G. Verdi', piece: 'La Traviata, "Libiamo ne\' lieti calici"' },
      { composer: 'G. Bizet', piece: 'Carmen, "Habanera"' }
    ],
    organizer: 'Association des Jeunes Artistes Lyriques',
    capacity: 200,
    remainingTickets: 45
  },
  // Autres événements...
};

// Fonction pour formatter la date en français
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  return new Date(dateString).toLocaleDateString('fr-FR', options);
};

const getCategoryLabel = (category: string) => {
  const categories = {
    'concert': 'Concert',
    'opera': 'Opéra',
    'formation': 'Formation',
    'concours': 'Concours',
    'audition': 'Audition'
  };
  return categories[category as keyof typeof categories] || category;
};

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  
  // Récupère les données de l'événement en fonction de l'ID
  const event = id ? eventsData[id as keyof typeof eventsData] : null;

  // Si l'événement n'existe pas, affiche un message d'erreur
  if (!event) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-3xl font-serif font-bold mb-4">Événement non trouvé</h1>
            <p className="text-muted-foreground mb-6">
              L'événement que vous recherchez n'existe pas ou a été supprimé.
            </p>
            <Button asChild>
              <Link to="/evenements">Retour à la liste des événements</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* En-tête avec image de couverture */}
      <div className="relative h-64 md:h-96 w-full">
        <div className="absolute inset-0">
          <img 
            src={event.image} 
            alt={event.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>
        </div>
        <div className="container mx-auto px-4 md:px-6 relative h-full flex items-end pb-6">
          <Button variant="outline" className="absolute top-6 left-4 md:left-6 bg-background/80 hover:bg-background" asChild>
            <Link to="/evenements">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Link>
          </Button>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-8">
            <div className="text-appear">
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary" className="text-sm">
                  {getCategoryLabel(event.category)}
                </Badge>
                {event.featured && (
                  <Badge variant="secondary" className="bg-gold-500/90 text-white hover:bg-gold-600 text-sm">
                    Événement à ne pas manquer
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">{event.title}</h1>
              <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 text-muted-foreground mb-6">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  <span>{formatDate(event.date)}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  <span>{event.time} - {event.endTime}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>{event.location}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <section className="bg-card rounded-xl p-6 shadow-sm border border-border text-appear">
              <h2 className="text-2xl font-serif font-semibold mb-4">À propos de cet événement</h2>
              <div className="text-muted-foreground whitespace-pre-line">
                {event.description}
              </div>
            </section>

            {/* Programme */}
            {event.program && event.program.length > 0 && (
              <section className="bg-card rounded-xl p-6 shadow-sm border border-border text-appear">
                <h2 className="text-2xl font-serif font-semibold mb-4">Programme</h2>
                <div className="space-y-3">
                  {event.program.map((item, index) => (
                    <div key={index} className="pb-3 border-b border-border last:border-0 last:pb-0">
                      <p className="font-medium">{item.piece}</p>
                      <p className="text-sm text-muted-foreground">{item.composer}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Artistes */}
            {event.artists && event.artists.length > 0 && (
              <section className="bg-card rounded-xl p-6 shadow-sm border border-border text-appear">
                <h2 className="text-2xl font-serif font-semibold mb-4">Artistes</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {event.artists.map((artist) => (
                    <Link 
                      key={artist.id} 
                      to={`/artistes/${artist.id}`}
                      className="flex items-center p-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="w-12 h-12 rounded-full overflow-hidden mr-3">
                        <img 
                          src={artist.photo} 
                          alt={artist.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-medium">{artist.name}</h3>
                        <p className="text-sm text-muted-foreground">{artist.role}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Lieu */}
            <section className="bg-card rounded-xl p-6 shadow-sm border border-border text-appear">
              <h2 className="text-2xl font-serif font-semibold mb-4">Lieu</h2>
              <p className="text-muted-foreground mb-2">{event.location}</p>
              <p className="text-muted-foreground mb-4">{event.address}</p>
              <div className="aspect-[16/9] w-full rounded-lg overflow-hidden bg-muted">
                <iframe 
                  src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${encodeURIComponent(event.address)}`}
                  className="w-full h-full border-0"
                  allowFullScreen
                  title={`Carte pour ${event.location}`}
                ></iframe>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Note: La carte est illustrative et nécessite une clé API valide pour fonctionner correctement.
              </p>
            </section>

            {/* Organisateur */}
            <section className="bg-card rounded-xl p-6 shadow-sm border border-border text-appear">
              <h2 className="text-2xl font-serif font-semibold mb-4">Organisateur</h2>
              <p className="text-muted-foreground">{event.organizer}</p>
              <Button variant="link" className="p-0 h-auto mt-2 text-lyrical-700">
                Voir le profil de l'organisateur
              </Button>
            </section>
          </div>

          {/* Barre latérale */}
          <div className="space-y-6">
            {/* Réservation */}
            <Card className="shadow-sm border-border text-appear sticky top-20">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-serif font-semibold">Réservation</h3>
                  <p className="text-xl font-bold">{event.price}</p>
                </div>
                
                <Separator className="mb-4" />
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium">{formatDate(event.date)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Heure</span>
                    <span className="font-medium">{event.time} - {event.endTime}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Lieu</span>
                    <span className="font-medium">{event.location}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Places restantes</span>
                    <span className="font-medium">{event.remainingTickets} / {event.capacity}</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Button className="w-full bg-gradient-to-r from-lyrical-600 to-gold-500 hover:from-lyrical-700 hover:to-gold-600 text-white">
                    Réserver maintenant
                  </Button>
                  <Button variant="outline" className="w-full gap-2">
                    <Share2 className="w-4 h-4" />
                    Partager
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Événements similaires */}
      <div className="bg-muted/30 py-16">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-serif font-semibold mb-8 text-appear">Événements similaires</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Affichage simplifié de 3 événements similaires (pour l'exemple) */}
            {Object.values(eventsData).slice(0, 3).map((similarEvent) => (
              <Card 
                key={similarEvent.id}
                className="overflow-hidden border border-border/50 bg-card hover:border-border hover:shadow-md transition-all duration-300 text-appear"
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  <img 
                    src={similarEvent.image} 
                    alt={similarEvent.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <CardContent className="p-5">
                  <h3 className="font-serif font-semibold text-lg hover:text-lyrical-700 transition-colors mb-2">
                    <Link to={`/evenements/${similarEvent.id}`}>{similarEvent.title}</Link>
                  </h3>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{formatDate(similarEvent.date)}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{similarEvent.location}</span>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full hover:bg-muted"
                    asChild
                  >
                    <Link to={`/evenements/${similarEvent.id}`}>Voir les détails</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EventDetail;
