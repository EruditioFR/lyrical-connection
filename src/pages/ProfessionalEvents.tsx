
import React, { useState } from 'react';
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
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mes Événements</h1>
            <p className="text-gray-600 mt-2">
              Gérez vos masterclass, stages et concours avec un formulaire amélioré
            </p>
            <div className="mt-2 text-xs text-gray-500">
              <p>Utilisateur: {user?.email}</p>
              <p>Événements trouvés: {events.length}</p>
              {error && <p className="text-red-500">Erreur: {error.message}</p>}
            </div>
          </div>
          <div className="flex gap-2">
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
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="text-red-800 font-medium">Erreur de chargement</h3>
            <p className="text-red-600 text-sm mt-1">{error.message}</p>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total événements</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{events.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Publiés</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{publishedEvents.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Brouillons</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{draftEvents.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inscriptions totales</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalApplications}</div>
            </CardContent>
          </Card>
        </div>

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
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun événement publié
                </h3>
                <p className="text-gray-600">
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun brouillon
                </h3>
                <p className="text-gray-600">
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun événement terminé
                </h3>
                <p className="text-gray-600">
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
