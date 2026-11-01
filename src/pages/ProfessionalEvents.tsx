
import React, { useState } from 'react';
import { Stat, StatRow } from '@/components/dashboard/Panel';
import { Navigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { useProfessionalEvents } from '@/hooks/useEvents';
import { ProfessionalEventCard } from '@/components/events/ProfessionalEventCard';
import { EventFormImproved } from '@/components/events/EventFormImproved';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Loader2, Calendar, BarChart3, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQueryClient } from '@tanstack/react-query';

const ProfessionalEvents = () => {
  const { user, loading } = useAuth();
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const queryClient = useQueryClient();
  
  const { data: events = [], isLoading, error, refetch } = useProfessionalEvents();

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const draftEvents = events.filter(event => event.status === 'draft');
  const publishedEvents = events.filter(event => event.status === 'published');
  const completedEvents = events.filter(event => event.status === 'completed');

  const totalApplications = events.reduce((sum, event) => sum + (event.applications_count || 0), 0);

  const handleEditEvent = (event: any) => {
    setEditingEvent(event);
    setShowEventForm(true);
  };

  const handleCloseForm = () => {
    setShowEventForm(false);
    setEditingEvent(null);
  };

  const handleRefresh = () => {
    console.log('🔄 Manual refresh triggered');
    queryClient.invalidateQueries({ queryKey: ['professionalEvents'] });
    refetch();
  };

  if (error) {
    console.error('Error in ProfessionalEvents:', error);
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif">Mes événements</h1>
            <p className="text-muted-foreground mt-2">
              Vos masterclasses, stages et concours, publiés ou en brouillon.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
            <Button onClick={() => setShowEventForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvel événement
            </Button>
          </div>
        </div>

        {isLoading && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Chargement des événements...</span>
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 mb-6">
            <h3 className="text-destructive font-medium">Erreur de chargement</h3>
            <p className="text-destructive text-sm mt-1">{error.message}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              className="mt-2"
            >
              Réessayer
            </Button>
          </div>
        )}

        {/* Statistiques */}
        <StatRow className="mb-8">
          <Stat label="Événements" value={events.length} />
          <Stat label="Publiés" value={publishedEvents.length} />
          
          <Stat label="Brouillons" value={draftEvents.length} />
          <Stat label="Inscriptions" value={totalApplications} />
        </StatRow>

        <Tabs defaultValue="published" className="space-y-6">
          <TabsList>
            <TabsTrigger value="published">
              Publiés ({publishedEvents.length})
            </TabsTrigger>
            <TabsTrigger value="draft">
              Brouillons ({draftEvents.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Terminés ({completedEvents.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="published">
            {publishedEvents.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Aucun événement publié
                </h3>
                <p className="text-muted-foreground">
                  Publiez vos premiers événements pour commencer à recevoir des inscriptions
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {publishedEvents.map(event => (
                  <ProfessionalEventCard
                    key={event.id}
                    event={event}
                    onEdit={() => handleEditEvent(event)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="draft">
            {draftEvents.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Aucun brouillon
                </h3>
                <p className="text-muted-foreground">
                  Créez un nouvel événement pour commencer
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {draftEvents.map(event => (
                  <ProfessionalEventCard
                    key={event.id}
                    event={event}
                    onEdit={() => handleEditEvent(event)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed">
            {completedEvents.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Aucun événement terminé
                </h3>
                <p className="text-muted-foreground">
                  Vos événements passés apparaîtront ici
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedEvents.map(event => (
                  <ProfessionalEventCard
                    key={event.id}
                    event={event}
                    onEdit={() => handleEditEvent(event)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Formulaire d'événement amélioré */}
        {showEventForm && (
          <EventFormImproved
            event={editingEvent}
            onClose={handleCloseForm}
          />
        )}
      </div>
    </Layout>
  );
};

export default ProfessionalEvents;
