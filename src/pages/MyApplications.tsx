
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMyApplications } from '@/hooks/useApplications';
import { useAuth } from '@/hooks/useAuth';
import { 
  Calendar, MapPin, Eye, FileText, 
  Clock, CheckCircle, XCircle, AlertCircle,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MyApplications = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { applications, isLoading } = useMyApplications();
  const [activeTab, setActiveTab] = useState('all');

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Connexion requise
          </h1>
          <p className="text-gray-600 mb-6">
            Vous devez être connecté pour voir vos candidatures.
          </p>
          <Button onClick={() => navigate('/auth')}>
            Se connecter
          </Button>
        </div>
      </Layout>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'En attente', variant: 'secondary' as const, icon: Clock },
      shortlisted: { label: 'Présélectionné', variant: 'default' as const, icon: Eye },
      accepted: { label: 'Accepté', variant: 'default' as const, icon: CheckCircle },
      rejected: { label: 'Refusé', variant: 'destructive' as const, icon: XCircle },
      withdrawn: { label: 'Retiré', variant: 'outline' as const, icon: AlertCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;

    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const filteredApplications = applications.filter(app => {
    if (activeTab === 'all') return true;
    return app.status === activeTab;
  });

  if (isLoading) {
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
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mes candidatures</h1>
          <p className="text-gray-600 mt-2">
            Suivez l'état de vos candidatures aux différents castings
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">
              Toutes ({applications.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              En attente ({applications.filter(a => a.status === 'pending').length})
            </TabsTrigger>
            <TabsTrigger value="shortlisted">
              Présélectionnées ({applications.filter(a => a.status === 'shortlisted').length})
            </TabsTrigger>
            <TabsTrigger value="accepted">
              Acceptées ({applications.filter(a => a.status === 'accepted').length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Refusées ({applications.filter(a => a.status === 'rejected').length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {filteredApplications.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucune candidature
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {activeTab === 'all' 
                      ? "Vous n'avez pas encore postulé à des castings."
                      : `Aucune candidature ${activeTab === 'pending' ? 'en attente' : activeTab}.`
                    }
                  </p>
                  <Button onClick={() => navigate('/castings')}>
                    Découvrir les castings
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {filteredApplications.map((application) => (
                  <Card key={application.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl">
                            {application.castings?.title}
                          </CardTitle>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {application.castings?.location || 'Lieu non précisé'}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Postulé le {new Date(application.created_at).toLocaleDateString('fr-FR')}
                            </div>
                          </div>
                        </div>
                        {getStatusBadge(application.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {application.cover_letter && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Lettre de motivation</h4>
                            <p className="text-gray-700 text-sm line-clamp-3">
                              {application.cover_letter}
                            </p>
                          </div>
                        )}

                        {application.professional_notes && (
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <h4 className="font-medium text-blue-900 mb-2">Notes du professionnel</h4>
                            <p className="text-blue-800 text-sm">
                              {application.professional_notes}
                            </p>
                          </div>
                        )}

                        {application.audition_scheduled_at && (
                          <div className="bg-green-50 p-4 rounded-lg">
                            <h4 className="font-medium text-green-900 mb-2">Audition programmée</h4>
                            <p className="text-green-800 text-sm">
                              {new Date(application.audition_scheduled_at).toLocaleDateString('fr-FR', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                            {application.audition_notes && (
                              <p className="text-green-700 text-sm mt-2">
                                {application.audition_notes}
                              </p>
                            )}
                          </div>
                        )}

                        <div className="flex gap-3 pt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/castings/${application.casting_id}`)}
                          >
                            Voir le casting
                          </Button>
                          
                          {application.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/applications/${application.id}/edit`)}
                            >
                              Modifier
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default MyApplications;
