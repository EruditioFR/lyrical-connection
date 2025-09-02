
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Star, 
  Clock,
  Award,
  Music,
  BookOpen,
  Target
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const EventsMarketing = () => {
  // Récupérer les vrais événements pour la démonstration
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['marketing-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('professional_events')
        .select('*')
        .eq('status', 'published')
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
  const displayEvents = events.map(event => ({
    id: event.id,
    title: event.title,
    type: event.event_type === 'stage' ? 'Stage' : 
          event.event_type === 'atelier' ? 'Atelier' :
          event.event_type === 'concours' ? 'Concours' :
          event.event_type === 'conference' ? 'Conférence' : 'Événement',
    date: new Date(event.start_date).toLocaleDateString('fr-FR'),
    location: event.location || event.venue || 'Lieu à confirmer',
    instructor: 'Professionnel', // TODO: Récupérer depuis professional_profiles
    price: event.price ? `${event.price}${event.currency || '€'}` : 'Gratuit',
    difficulty: 'Tous niveaux' // TODO: Ajouter un champ difficulty aux événements
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6">
            Événements & Formations
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Participez aux masterclass, stages et concours organisés par les meilleurs professionnels du chant lyrique
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/auth">
                Rejoindre la plateforme
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/about">
                En savoir plus
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Événements réels */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl font-serif font-bold text-center mb-12">
            Événements à venir
          </h2>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-muted rounded-xl h-64"></div>
                </div>
              ))}
            </div>
          ) : displayEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayEvents.map((event) => (
                <Card key={event.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="secondary">{event.type}</Badge>
                      <Badge variant="outline">{event.difficulty}</Badge>
                    </div>
                    <CardTitle className="text-xl">{event.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 mr-2" />
                      {event.date}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-2" />
                      {event.location}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="w-4 h-4 mr-2" />
                      {event.instructor}
                    </div>
                    <div className="flex justify-between items-center pt-4">
                      <span className="text-lg font-semibold text-primary">{event.price}</span>
                      <Button size="sm" asChild>
                        <Link to={`/evenements/${event.id}`}>S'inscrire</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Aucun événement programmé pour le moment.</p>
              <Button asChild className="mt-4">
                <Link to="/auth">Créer le premier événement</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Fonctionnalités */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-serif font-bold text-center mb-12">
            Pourquoi participer à nos événements ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Professionnels reconnus</h3>
              <p className="text-muted-foreground">
                Apprenez auprès des meilleurs artistes et pédagogues du milieu lyrique
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Formation complète</h3>
              <p className="text-muted-foreground">
                Techniques vocales, interprétation, préparation scénique et plus
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Réseau professionnel</h3>
              <p className="text-muted-foreground">
                Rencontrez d'autres artistes et créez des connexions durables
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Opportunités</h3>
              <p className="text-muted-foreground">
                Concours, auditions et occasions de vous faire remarquer
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-serif font-bold mb-4">
            Prêt à faire évoluer votre carrière lyrique ?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Rejoignez notre communauté et accédez à tous nos événements exclusifs
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link to="/auth">
              Créer mon compte gratuitement
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default EventsMarketing;
