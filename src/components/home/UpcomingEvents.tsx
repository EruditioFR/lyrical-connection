import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Clock, MapPin, Users } from 'lucide-react';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const UpcomingEvents = () => {
  
  // Récupérer les vrais événements depuis la base de données
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['upcoming-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('professional_events')
        .select('*')
        .eq('status', 'published')
        .gte('start_date', new Date().toISOString())
        .order('start_date', { ascending: true })
        .limit(3);

      if (error) {
        console.error('Erreur lors de la récupération des événements:', error);
        return [];
      }

      return data || [];
    }
  });
  
  // Transformer les événements pour l'affichage
  const upcomingEvents = events.map(event => ({
    id: event.id,
    title: event.title,
    date: event.start_date.split('T')[0],
    time: new Date(event.start_date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    location: event.location || event.venue || 'Lieu à confirmer',
    image: event.image_url || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    featured: Math.random() > 0.5,
    attendees: Math.floor(Math.random() * 100) + 20 // TODO: Implémenter le vrai nombre de participants
  }));

  if (isLoading) {
    return (
      <section className="bg-muted py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div>
            <div className="h-8 bg-background rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-background rounded w-1/2 mb-12"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="bg-background rounded-xl h-96"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Si aucun événement, ne pas afficher la section
  if (upcomingEvents.length === 0) {
    return null;
  }
  
  return (
    <section className="bg-muted py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold">Événements à venir</h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            Participez à des événements exclusifs et découvrez les talents lyriques en live.
          </p>
          <Button variant="link" className="flex items-center justify-center mt-4" asChild>
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
              className="rounded-xl overflow-hidden border border-border/50 bg-card shadow-sm"
            >
              <div className="relative aspect-[16/9] overflow-hidden">
                <img 
                  src={event.image} 
                  alt={event.title} 
                  className="w-full h-full object-cover"
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
                <h3 className="font-serif font-semibold text-lg">
                  <Link to={`/evenements/${event.id}`}>{event.title}</Link>
                </h3>
                <div className="mt-3 space-y-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-2" />
                <span>{new Date(event.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
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
                    className="w-full"
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
        <div className="mt-16 text-center bg-card rounded-xl p-8 border">
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