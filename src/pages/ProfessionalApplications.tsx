
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useCastingApplications, useUpdateApplication } from '@/hooks/useApplications';
import { useCasting } from '@/hooks/useCastings';
import { useAuth } from '@/hooks/useAuth';
import { 
  Calendar, MapPin, User, FileText, MessageSquare,
  Clock, CheckCircle, XCircle, AlertCircle,
  Loader2, Save
} from 'lucide-react';

const ProfessionalApplications = () => {
  const { castingId } = useParams<{ castingId: string }>();
  const { user } = useAuth();
  const { casting, isLoading: castingLoading } = useCasting(castingId!);
  const { applications, isLoading: applicationsLoading } = useCastingApplications(castingId!);
  const { mutate: updateApplication, isPending: isUpdating } = useUpdateApplication();
  const [activeTab, setActiveTab] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [auditionDate, setAuditionDate] = useState('');
  const [auditionNotes, setAuditionNotes] = useState('');

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'En attente', variant: 'secondary' as const, icon: Clock },
      shortlisted: { label: 'Présélectionné', variant: 'default' as const, icon: AlertCircle },
      accepted: { label: 'Accepté', variant: 'default' as const, icon: CheckCircle },
      rejected: { label: 'Refusé', variant: 'destructive' as const, icon: XCircle },
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

  const handleStatusChange = (applicationId: string, newStatus: string) => {
    updateApplication({
      id: applicationId,
      updates: { status: newStatus }
    });
  };

  const handleSaveNotes = (applicationId: string) => {
    const updates: any = {};
    if (notes) updates.professional_notes = notes;
    if (auditionDate) updates.audition_scheduled_at = new Date(auditionDate).toISOString();
    if (auditionNotes) updates.audition_notes = auditionNotes;

    updateApplication({
      id: applicationId,
      updates
    }, {
      onSuccess: () => {
        setSelectedApplication(null);
        setNotes('');
        setAuditionDate('');
        setAuditionNotes('');
      }
    });
  };

  const filteredApplications = applications.filter(app => {
    if (activeTab === 'all') return true;
    return app.status === activeTab;
  });

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Connexion requise
          </h1>
        </div>
      </Layout>
    );
  }

  if (castingLoading || applicationsLoading) {
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
          <h1 className="text-3xl font-bold text-gray-900">
            Candidatures : {casting?.title}
          </h1>
          <p className="text-gray-600 mt-2">
            Gérez les candidatures reçues pour ce casting
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
                  <p className="text-gray-600">
                    {activeTab === 'all' 
                      ? "Aucune candidature reçue pour ce casting."
                      : `Aucune candidature ${activeTab}.`
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {filteredApplications.map((application) => (
                  <Card key={application.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <User className="h-8 w-8 text-gray-400" />
                          <div>
                            <CardTitle className="text-lg">
                              {application.artist_profiles?.stage_name}
                            </CardTitle>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                Postulé le {new Date(application.created_at).toLocaleDateString('fr-FR')}
                              </div>
                              {application.artist_profiles?.voice_type && (
                                <div>
                                  Type de voix: {application.artist_profiles.voice_type}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(application.status)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {application.cover_letter && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Lettre de motivation</h4>
                            <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg">
                              {application.cover_letter}
                            </p>
                          </div>
                        )}

                        {application.motivation && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Motivation</h4>
                            <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg">
                              {application.motivation}
                            </p>
                          </div>
                        )}

                        {application.availability_notes && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Disponibilités</h4>
                            <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg">
                              {application.availability_notes}
                            </p>
                          </div>
                        )}

                        {application.professional_notes && (
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <h4 className="font-medium text-blue-900 mb-2">Vos notes</h4>
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

                        <div className="flex gap-2 pt-4 border-t">
                          <Button
                            size="sm"
                            variant={application.status === 'pending' ? 'default' : 'outline'}
                            onClick={() => handleStatusChange(application.id, 'pending')}
                            disabled={isUpdating}
                          >
                            En attente
                          </Button>
                          <Button
                            size="sm"
                            variant={application.status === 'shortlisted' ? 'default' : 'outline'}
                            onClick={() => handleStatusChange(application.id, 'shortlisted')}
                            disabled={isUpdating}
                          >
                            Présélectionner
                          </Button>
                          <Button
                            size="sm"
                            variant={application.status === 'accepted' ? 'default' : 'outline'}
                            onClick={() => handleStatusChange(application.id, 'accepted')}
                            disabled={isUpdating}
                          >
                            Accepter
                          </Button>
                          <Button
                            size="sm"
                            variant={application.status === 'rejected' ? 'destructive' : 'outline'}
                            onClick={() => handleStatusChange(application.id, 'rejected')}
                            disabled={isUpdating}
                          >
                            Refuser
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedApplication(application.id);
                              setNotes(application.professional_notes || '');
                              setAuditionDate(application.audition_scheduled_at ? 
                                new Date(application.audition_scheduled_at).toISOString().slice(0, 16) : '');
                              setAuditionNotes(application.audition_notes || '');
                            }}
                          >
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Noter
                          </Button>
                        </div>

                        {selectedApplication === application.id && (
                          <div className="border-t pt-4 space-y-4">
                            <div>
                              <Label htmlFor="notes">Notes privées</Label>
                              <Textarea
                                id="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Ajoutez vos notes sur ce candidat..."
                                rows={3}
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor="audition-date">Date d'audition</Label>
                              <Input
                                id="audition-date"
                                type="datetime-local"
                                value={auditionDate}
                                onChange={(e) => setAuditionDate(e.target.value)}
                              />
                            </div>

                            <div>
                              <Label htmlFor="audition-notes">Notes d'audition</Label>
                              <Textarea
                                id="audition-notes"
                                value={auditionNotes}
                                onChange={(e) => setAuditionNotes(e.target.value)}
                                placeholder="Instructions pour l'audition..."
                                rows={2}
                              />
                            </div>

                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleSaveNotes(application.id)}
                                disabled={isUpdating}
                              >
                                <Save className="h-4 w-4 mr-1" />
                                Sauvegarder
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedApplication(null)}
                              >
                                Annuler
                              </Button>
                            </div>
                          </div>
                        )}
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

export default ProfessionalApplications;
