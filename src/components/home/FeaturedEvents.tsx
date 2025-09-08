
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Clock, MapPin, Star } from 'lucide-react';

import { usePublicEvents } from '@/hooks/useEvents';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const FeaturedEvents = () => {
  const { data: events = [], isLoading } = usePublicEvents();
  
  
  // Prendre les 3 premiers événements, en priorisant les événements promus
  const featuredEvents = events
    .sort((a, b) => {
      // Les événements promus en premier
      if (a.is_featured && !b.is_featured) return -1;
      if (!a.is_featured && b.is_featured) return 1;
      // Puis par date de création
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    })
    .slice(0, 3);

  if (isLoading) {
    return (
      <section className="bg-background py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex justify-center">
            <div className="rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </section>
    );
  }

  if (featuredEvents.length === 0) {
    return null;
  }

  return (
    <section className="bg-background py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold">Les événements</h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            Découvrez les prochains événements lyriques sélectionnés pour vous.
          </p>
          <Button variant="link" className="flex items-center justify-center mt-4" asChild>
            <Link to="/events">
              Voir tous les événements
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {featuredEvents.map((event, index) => (
            <div 
              key={event.id}
              className="rounded-xl overflow-hidden border border-border/50 bg-card shadow-sm relative"
            >
              {event.is_featured && (
                <div className="absolute top-3 right-3 bg-gold-500/90 text-white text-xs font-medium py-1 px-2 rounded-full flex items-center gap-1 z-10">
                  <Star className="h-3 w-3" />
                  Promu
                </div>
              )}

              <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                {event.image_url ? (
                  <img 
                    src={event.image_url} 
                    alt={event.title} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-lyrical-100 to-gold-100 flex items-center justify-center">
                    <Calendar className="h-12 w-12 text-lyrical-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              </div>
              
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-lyrical-600 bg-lyrical-50 px-2 py-1 rounded-full">
                    {event.event_type === 'masterclass' && 'Masterclass'}
                    {event.event_type === 'stage' && 'Stage'}
                    {event.event_type === 'concours' && 'Concours'}
                    {event.event_type === 'atelier' && 'Atelier'}
                    {event.event_type === 'conference' && 'Conférence'}
                  </span>
                  {event.price && (
                    <span className="text-xs font-medium text-green-600">
                      {event.price}€
                    </span>
                  )}
                </div>

                <h3 className="font-serif font-semibold text-lg mb-3">
                  <Link to={`/events/${event.id}`}>{event.title}</Link>
                </h3>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>
                      {format(new Date(event.start_date), 'dd MMMM yyyy', { locale: fr })}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>
                      {format(new Date(event.start_date), 'HH:mm')}
                    </span>
                  </div>
                  {event.location && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  )}
                </div>

                <Button 
                  variant="outline" 
                  className="w-full hover:bg-muted"
                  asChild
                >
                  <Link to={`/events/${event.id}`}>En savoir plus</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedEvents;
