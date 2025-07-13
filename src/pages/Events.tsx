
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { usePublicEvents, useEventCategories } from '@/hooks/useEvents';
import { EventCard } from '@/components/events/EventCard';
import { EventFilters } from '@/components/events/EventFilters';
import { Loader2 } from 'lucide-react';

const Events = () => {
  console.log('🚀 Events page loading...');
  
  const { user, loading } = useAuth();
  const [filters, setFilters] = useState({
    event_type: '',
    category_id: '',
    search: ''
  });

  console.log('🔍 Current filters:', filters);
  console.log('👤 User authenticated:', !!user);

  const { data: events = [], isLoading: eventsLoading, error: eventsError } = usePublicEvents(filters);
  const { data: categories = [], error: categoriesError } = useEventCategories();

  console.log('📊 Events data:', events?.length || 0, 'events loaded');
  console.log('🏷️ Categories data:', categories?.length || 0, 'categories loaded');
  
  if (eventsError) {
    console.error('❌ Events error:', eventsError);
  }
  
  if (categoriesError) {
    console.error('❌ Categories error:', categoriesError);
  }

  if (loading) {
    console.log('⏳ Auth loading...');
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  console.log('✅ Events page rendering successfully');

  return (
    <Layout>
      <div className="bg-muted/30 py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4">
              Événements et Formations
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Découvrez les masterclass, stages et concours organisés par nos professionnels
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {/* Filtres */}
            <div className="lg:col-span-1">
              <EventFilters
                filters={filters}
                onFiltersChange={setFilters}
                categories={categories}
              />
            </div>

            {/* Liste des événements */}
            <div className="lg:col-span-3">
              {eventsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : eventsError ? (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium text-red-600 mb-2">
                    Erreur de chargement
                  </h3>
                  <p className="text-gray-600">
                    Impossible de charger les événements. Veuillez réessayer.
                  </p>
                </div>
              ) : events.length === 0 ? (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucun événement trouvé
                  </h3>
                  <p className="text-gray-600">
                    Modifiez vos filtres pour voir plus d'événements
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {events.map((event, index) => (
                    <div 
                      key={event.id}
                      className="animate-fade-in"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <EventCard
                        event={event}
                        showApplyButton={!!user}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Events;
