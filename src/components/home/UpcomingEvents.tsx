import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Clock, MapPin, Users } from 'lucide-react';
import { useAnimateOnScroll } from '@/hooks/useIntersectionObserver';

// Données exemple pour les événements à venir
const upcomingEvents = [
  {
    id: '1',
    title: 'Récital de Jeunes Talents',
    date: '2024-02-15',
    time: '20:00',
    location: 'Opéra Garnier, Paris',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    featured: true,
    attendees: 45
  },
  {
    id: '2',
    title: 'Masterclass avec Natalie Dessay',
    date: '2024-02-20',
    time: '14:30',
    location: 'Conservatoire de Lyon',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    featured: false,
    attendees: 28
  },
  {
    id: '3',
    title: 'Concours International de Chant',
    date: '2024-03-05',
    time: '09:00',
    location: 'Théâtre des Champs-Élysées, Paris',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    featured: true,
    attendees: 120
  }
];

// Fonction pour formatter la date en français
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
  return new Date(dateString).toLocaleDateString('fr-FR', options);
};

const UpcomingEvents = () => {
  const headerRef = useAnimateOnScroll();
  const ctaRef = useAnimateOnScroll();
  
  return (
    <section className="bg-muted py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div ref={headerRef} className="text-appear">
            <h2 className="text-3xl md:text-4xl font-serif font-bold">Événements à venir</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              Participez à des événements exclusifs et découvrez les talents lyriques en live.
            </p>
          </div>
          <Button variant="link" className="flex items-center mt-4 md:mt-0" asChild>
            <Link to="/evenements">
              Voir tous les événements
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {upcomingEvents.map((event, index) => (
            <div 
              key={event.id}
              className={`group rounded-xl overflow-hidden border border-border/50 bg-card shadow-sm transition-all duration-300 hover:shadow-md hover:border-border text-appear`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative aspect-[16/9] overflow-hidden">
                <img 
                  src={event.image} 
                  alt={event.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                
                {event.featured && (
                  <div className="absolute top-3 right-3 bg-gold-500/90 text-white text-xs font-medium py-1 px-2 rounded-full">
                    À ne pas manquer
                  </div>
                )}
                
                {/* Event attendees overlay */}
                <div className="absolute bottom-3 left-3 flex items-center space-x-2 text-white">
                  <div className="bg-black/30 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1">
                    <Users className="h-3 w-3" />
                    <span className="text-xs font-medium">{event.attendees}</span>
                  </div>
                </div>
              </div>
              
              <div className="p-5">
                <h3 className="font-serif font-semibold text-lg hover:text-lyrical-700 transition-colors">
                  <Link to={`/evenements/${event.id}`}>{event.title}</Link>
                </h3>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span className="truncate">{event.location}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    className="w-full hover:bg-muted"
                    asChild
                  >
                    <Link to={`/evenements/${event.id}`}>Détails et inscription</Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Call to action section */}
        <div ref={ctaRef} className="mt-16 text-center bg-card rounded-xl p-8 border text-appear">
          <h3 className="text-xl font-serif font-semibold mb-4">
            Vous organisez un événement ?
          </h3>
          <p className="text-muted-foreground mb-6">
            Créez et promouvez vos événements auprès de notre communauté d'artistes et de professionnels.
          </p>
          <Button 
            className="bg-gradient-to-r from-lyrical-600 to-gold-500 hover:from-lyrical-700 hover:to-gold-600 text-white"
            asChild
          >
            <Link to="/evenements/creer">Créer un événement</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default UpcomingEvents;