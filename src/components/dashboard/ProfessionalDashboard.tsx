import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Eye, 
  Calendar, 
  FileText, 
  TrendingUp, 
  Star,
  MessageCircle,
  CheckCircle,
  Clock,
  X
} from 'lucide-react';
import { useCastings } from '@/hooks/useCastings';
import { useMyApplications } from '@/hooks/useApplications';
import { useProfessionalProfile } from '@/hooks/useProfessionalProfile';
import AnalyticsDashboard from './AnalyticsDashboard';

const ProfessionalDashboard = () => {
  const { profile } = useProfessionalProfile();
  const { castings = [], isLoading: castingsLoading } = useCastings({});
  const { applications = [], isLoading: applicationsLoading } = useMyApplications();

  // Filter data for the current professional
  const myCastings = castings.filter(c => c.professional_profile_id === profile?.id);
  const myEvents = events.filter(e => e.professional_profile_id === profile?.id);
  const myApplications = applications.filter(app => 
    myCastings.some(casting => casting.id === app.casting_id)
  );

  // Calculate statistics
  const stats = {
    totalCastings: myCastings.length,
    activeCastings: myCastings.filter(c => c.is_active).length,
    totalEvents: myEvents.length,
    upcomingEvents: myEvents.filter(e => new Date(e.start_date) > new Date()).length,
    totalApplications: myApplications.length,
    pendingApplications: myApplications.filter(a => a.status === 'pending').length,
    totalViews: myCastings.reduce((sum, c) => sum + (c.view_count || 0), 0)
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'yellow';
      case 'accepted': return 'green';
      case 'rejected': return 'red';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-3 h-3" />;
      case 'accepted': return <CheckCircle className="w-3 h-3" />;
      case 'rejected': return <X className="w-3 h-3" />;
      default: return <FileText className="w-3 h-3" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold">
          Tableau de bord professionnel
        </h1>
        <p className="text-muted-foreground">
          Bienvenue, {profile?.company_name || 'Professionnel'}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Castings actifs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCastings}</div>
            <p className="text-xs text-muted-foreground">
              sur {stats.totalCastings} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Événements à venir</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
            <p className="text-xs text-muted-foreground">
              sur {stats.totalEvents} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Candidatures en attente</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingApplications}</div>
            <p className="text-xs text-muted-foreground">
              sur {stats.totalApplications} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vues totales</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews}</div>
            <p className="text-xs text-muted-foreground">
              vues sur vos castings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Aperçu</TabsTrigger>
          <TabsTrigger value="applications">Candidatures</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Recent Castings */}
            <Card>
              <CardHeader>
                <CardTitle>Castings récents</CardTitle>
                <CardDescription>
                  Vos derniers castings publiés
                </CardDescription>
              </CardHeader>
              <CardContent>
                {myCastings.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Aucun casting publié</p>
                    <Button size="sm" className="mt-2">
                      Créer un casting
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myCastings.slice(0, 5).map((casting) => (
                      <div key={casting.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{casting.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {casting.production_type} • {casting.location}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={casting.is_active ? 'default' : 'secondary'}>
                              {casting.is_active ? 'Actif' : 'Inactif'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {casting.view_count || 0} vues
                            </span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Gérer
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <CardTitle>Événements à venir</CardTitle>
                <CardDescription>
                  Vos prochains événements
                </CardDescription>
              </CardHeader>
              <CardContent>
                {myEvents.filter(e => new Date(e.start_date) > new Date()).length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Aucun événement à venir</p>
                    <Button size="sm" className="mt-2">
                      Créer un événement
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myEvents
                      .filter(e => new Date(e.start_date) > new Date())
                      .slice(0, 5)
                      .map((event) => (
                        <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium">{event.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {new Date(event.start_date).toLocaleDateString('fr-FR')} • {event.location}
                            </p>
                            <Badge variant="outline" className="mt-1">
                              {event.event_type}
                            </Badge>
                          </div>
                          <Button variant="outline" size="sm">
                            Gérer
                          </Button>
                        </div>
                      ))
                    }
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="applications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Candidatures récentes</CardTitle>
              <CardDescription>
                Les dernières candidatures à vos castings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {myApplications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Aucune candidature reçue</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myApplications.slice(0, 10).map((application) => {
                    const casting = myCastings.find(c => c.id === application.casting_id);
                    
                    return (
                      <div key={application.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">
                            Candidature pour "{casting?.title}"
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Reçue le {new Date(application.created_at).toLocaleDateString('fr-FR')}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge 
                              variant={getStatusColor(application.status) as any}
                              className="gap-1"
                            >
                              {getStatusIcon(application.status)}
                              {application.status === 'pending' ? 'En attente' :
                               application.status === 'accepted' ? 'Acceptée' :
                               application.status === 'rejected' ? 'Refusée' : application.status}
                            </Badge>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Examiner
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <AnalyticsDashboard profileType="professional" />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfessionalDashboard;