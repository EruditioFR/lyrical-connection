
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { useUserType } from '@/hooks/useUserType';
import { usePublicEvents, useEventCategories, useArtistApplications } from '@/hooks/useEvents';
import { EventCard } from '@/components/events/EventCard';
import EventsMarketing from '@/components/events/EventsMarketing';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const Events = () => {
  const { user, loading } = useAuth();
  const { isArtist } = useUserType();
  const [filters, setFilters] = useState({
    event_type: '',
    category_id: '',
    search: ''
  });
  
  const {
    data: events = [],
    isLoading: eventsLoading,
    error: eventsError
  } = usePublicEvents(filters);
  
  const {
    data: categories = [],
    error: categoriesError
  } = useEventCategories();
  
  const {
    data: artistApplications = [],
    isLoading: applicationsLoading
  } = useArtistApplications();

  // Si l'utilisateur n'est pas authentifié, afficher la page marketing
  if (!loading && !user) {
    return (
      <Layout>
        <EventsMarketing />
      </Layout>
    );
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: 'En attente',
      waitlisted: 'Présélectionné(e)',
      accepted: 'Accepté(e)',
      rejected: 'Refusé(e)'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      waitlisted: 'bg-blue-100 text-blue-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-muted/30 py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6">
          {/* Header */}
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4">
              Événements
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Découvrez les masterclass, stages et concours organisés par nos professionnels
            </p>
          </div>

          <div className="max-w-7xl mx-auto space-y-8">
            {/* Tableau des inscriptions pour les artistes */}
            {isArtist && artistApplications.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Mes inscriptions</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                      <TableHead>Événement</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead>Statut</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {artistApplications.map((application: any) => {
                        const event = application.professional_events;
                        const displayStatus = event.results_published 
                          ? getStatusLabel(application.status)
                          : 'En attente';
                        const statusColor = event.results_published 
                          ? getStatusColor(application.status)
                          : 'bg-yellow-100 text-yellow-800';
                        
                        return (
                          <TableRow key={application.id}>
                          <TableCell className="font-medium">
                            {event.title}
                          </TableCell>
                          <TableCell>
                            {format(new Date(event.start_date), 'dd MMM yyyy', { locale: fr })}
                            {event.start_date !== event.end_date && (
                              <> - {format(new Date(event.end_date), 'dd MMM yyyy', { locale: fr })}</>
                            )}
                          </TableCell>
                            <TableCell>
                              <Badge className={statusColor}>
                                {displayStatus}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* Liste des événements */}
            <div>
              {eventsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-lyrical-600" />
                </div>
              ) : eventsError ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Impossible de charger les événements. Veuillez réessayer plus tard.
                  </AlertDescription>
                </Alert>
              ) : events.length === 0 ? (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium mb-2">
                    Aucun événement trouvé
                  </h3>
                  <p className="text-muted-foreground">
                    Modifiez vos filtres pour voir plus d'événements
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {events.map((event) => (
                    <div key={event.id}>
                      <EventCard event={event} showApplyButton={!!user} />
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
