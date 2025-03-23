
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar,
  Search,
  MapPin,
  Clock,
  Filter,
  ChevronDown,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Données exemple pour les événements
const eventsData = [
  {
    id: '1',
    title: 'Récital de Jeunes Talents',
    date: '2023-11-15',
    time: '20:00',
    location: 'Opéra Garnier, Paris',
    description: 'Découvrez les voix exceptionnelles de la nouvelle génération de chanteurs lyriques lors de ce récital unique.',
    category: 'concert',
    image: 'https://images.unsplash.com/photo-1581681682051-7334b4537b14?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    featured: true,
    price: '25€',
    artists: ['Sophia Laurent', 'Jean Dupont']
  },
  {
    id: '2',
    title: 'Masterclass avec Maria Callas',
    date: '2023-11-20',
    time: '14:30',
    location: 'Conservatoire de Lyon',
    description: 'Une opportunité unique d\'apprendre des techniques vocales avancées avec l\'une des plus grandes sopranos de notre temps.',
    category: 'formation',
    image: 'https://images.unsplash.com/photo-1598024077734-be87a601c1b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80',
    featured: false,
    price: '100€',
    artists: ['Maria Callas']
  },
  {
    id: '3',
    title: 'Concours International de Chant',
    date: '2023-12-05',
    time: '09:00',
    location: 'Théâtre des Champs-Élysées, Paris',
    description: 'Le prestigieux concours international qui révèle chaque année les futures stars de l\'opéra.',
    category: 'concours',
    image: 'https://images.unsplash.com/photo-1587407627257-27b7127c868c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80',
    featured: true,
    price: 'Gratuit',
    artists: []
  },
  {
    id: '4',
    title: 'Opéra La Traviata',
    date: '2023-12-15',
    time: '19:30',
    location: 'Opéra Bastille, Paris',
    description: 'Une production somptueuse du chef-d\'œuvre de Verdi avec un casting de jeunes talents prometteurs.',
    category: 'opera',
    image: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    featured: false,
    price: '45€ - 120€',
    artists: ['Sophia Laurent', 'Marc Lenoir']
  },
  {
    id: '5',
    title: 'Auditions Jeunes Artistes',
    date: '2024-01-10',
    time: '10:00',
    location: 'Théâtre du Châtelet, Paris',
    description: 'Auditions ouvertes pour intégrer le programme de jeunes artistes de la saison 2024.',
    category: 'audition',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    featured: true,
    price: 'Sur inscription',
    artists: []
  },
  {
    id: '6',
    title: 'Atelier d\'interprétation',
    date: '2024-01-20',
    time: '15:00',
    location: 'Conservatoire National de Paris',
    description: 'Un atelier pratique sur l\'interprétation des œuvres classiques et contemporaines.',
    category: 'formation',
    image: 'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    featured: false,
    price: '50€',
    artists: ['Pierre Dumont']
  }
];

// Fonction pour formatter la date en français
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
  return new Date(dateString).toLocaleDateString('fr-FR', options);
};

const Events = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  // Filtrer les événements en fonction de la recherche, de la catégorie et de la date
  const filteredEvents = eventsData.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        event.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    
    const matchesDate = !selectedDate || new Date(event.date).toDateString() === selectedDate.toDateString();
    
    return matchesSearch && matchesCategory && matchesDate;
  });

  // Liste des catégories uniques pour le filtre
  const categories = [
    { id: 'all', name: 'Tous' },
    { id: 'concert', name: 'Concerts' },
    { id: 'opera', name: 'Opéras' },
    { id: 'formation', name: 'Formations' },
    { id: 'concours', name: 'Concours' },
    { id: 'audition', name: 'Auditions' }
  ];

  // Réinitialiser les filtres
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedDate(undefined);
  };

  return (
    <Layout>
      <div className="bg-muted/30 py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4 text-appear">
              Événements Lyriques
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-appear">
              Découvrez les concerts, masterclasses, auditions et concours à venir dans le monde lyrique.
            </p>
          </div>
          
          {/* Barre de recherche et filtres */}
          <div className="max-w-4xl mx-auto mb-10 space-y-4">
            <div className="relative text-appear">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="text"
                placeholder="Rechercher un événement, un lieu..."
                className="pl-10 bg-background"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 text-appear">
              <Tabs 
                value={selectedCategory} 
                onValueChange={setSelectedCategory}
                className="w-full sm:max-w-md"
              >
                <TabsList className="w-full h-auto flex flex-wrap justify-start bg-muted/50">
                  {categories.map(category => (
                    <TabsTrigger 
                      key={category.id} 
                      value={category.id}
                      className="flex-grow sm:flex-grow-0"
                    >
                      {category.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              
              <div className="flex gap-2 ml-auto">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      {selectedDate ? (
                        format(selectedDate, 'PP', { locale: fr })
                      ) : (
                        "Date"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                
                <Button 
                  variant="ghost" 
                  onClick={resetFilters}
                  className="text-muted-foreground"
                >
                  Réinitialiser
                </Button>
              </div>
            </div>
          </div>
          
          {/* Affichage des événements */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event, index) => (
                <Card 
                  key={event.id}
                  className="overflow-hidden border border-border/50 bg-card hover:border-border hover:shadow-md transition-all duration-300 text-appear"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <img 
                      src={event.image} 
                      alt={event.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {event.featured && (
                      <div className="absolute top-3 right-3 bg-gold-500/90 text-white text-xs font-medium py-1 px-2 rounded-full">
                        À ne pas manquer
                      </div>
                    )}
                  </div>
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-serif font-semibold text-lg hover:text-lyrical-700 transition-colors">
                        <Link to={`/evenements/${event.id}`}>{event.title}</Link>
                      </h3>
                      <span className="text-sm font-medium bg-muted px-2 py-1 rounded">
                        {event.price}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                      {event.description}
                    </p>
                    <div className="space-y-2 mb-4">
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
                        <span>{event.location}</span>
                      </div>
                    </div>
                    {event.artists.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-muted-foreground mb-1">Avec</p>
                        <div className="flex flex-wrap gap-1">
                          {event.artists.map((artist, index) => (
                            <span 
                              key={index}
                              className="text-xs bg-muted px-2 py-1 rounded-full"
                            >
                              {artist}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <Button 
                      variant="outline" 
                      className="w-full hover:bg-muted"
                      asChild
                    >
                      <Link to={`/evenements/${event.id}`}>Détails et inscription</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full py-12 text-center">
                <p className="text-lg text-muted-foreground">Aucun événement ne correspond à votre recherche.</p>
                <Button 
                  variant="link" 
                  onClick={resetFilters}
                  className="mt-2"
                >
                  Réinitialiser les filtres
                </Button>
              </div>
            )}
          </div>
          
          {/* Pagination (simplifiée pour l'exemple) */}
          {filteredEvents.length > 0 && (
            <div className="flex justify-center mt-12">
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" disabled>Précédent</Button>
                <Button variant="outline" size="sm" className="bg-muted">1</Button>
                <Button variant="outline" size="sm">2</Button>
                <Button variant="outline" size="sm">3</Button>
                <Button variant="outline" size="sm">Suivant</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Events;
