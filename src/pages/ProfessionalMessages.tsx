
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/hooks/useAuth';
import { useInvitations } from '@/hooks/useInvitations';
import { useProfessionalContacts } from '@/hooks/useProfessionalContacts';
import { Loader2, MessageSquare, UserPlus, Calendar, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const ProfessionalMessages = () => {
  const { user, loading } = useAuth();
  const { invitations, isLoading: invitationsLoading } = useInvitations('professional');
  const { contacts, isLoading: contactsLoading } = useProfessionalContacts('professional');

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

  const getStatusBadge = (status: string) => {
    const variants = {
      sent: 'secondary',
      viewed: 'outline',
      accepted: 'default',
      declined: 'destructive',
      replied: 'default',
    };
    
    const labels = {
      sent: 'Envoyé',
      viewed: 'Lu',
      accepted: 'Accepté',
      declined: 'Décliné',
      replied: 'Répondu',
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] as any}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Messages & Invitations</h1>
          <p className="text-gray-600 mt-2">
            Gérez vos communications avec les artistes
          </p>
        </div>

        <Tabs defaultValue="invitations" className="space-y-6">
          <TabsList>
            <TabsTrigger value="invitations" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Invitations envoyées
            </TabsTrigger>
            <TabsTrigger value="contacts" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Messages envoyés
            </TabsTrigger>
          </TabsList>

          <TabsContent value="invitations">
            <div className="space-y-4">
              {invitationsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : invitations.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Aucune invitation envoyée</p>
                  </CardContent>
                </Card>
              ) : (
                invitations.map((invitation) => (
                  <Card key={invitation.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {invitation.artist_profiles?.stage_name}
                          </CardTitle>
                          <p className="text-sm text-gray-600">
                            {invitation.castings?.title} - {invitation.castings?.production_type}
                          </p>
                        </div>
                        {getStatusBadge(invitation.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(invitation.created_at), 'dd MMM yyyy', { locale: fr })}
                          </span>
                          {invitation.castings?.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {invitation.castings.location}
                            </span>
                          )}
                        </div>
                        
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm">{invitation.message}</p>
                        </div>
                        
                        {invitation.status === 'viewed' && (
                          <p className="text-xs text-blue-600">
                            Lu le {format(new Date(invitation.viewed_at!), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                          </p>
                        )}
                        
                        {invitation.responded_at && (
                          <p className="text-xs text-green-600">
                            Répondu le {format(new Date(invitation.responded_at), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="contacts">
            <div className="space-y-4">
              {contactsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : contacts.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Aucun message envoyé</p>
                  </CardContent>
                </Card>
              ) : (
                contacts.map((contact) => (
                  <Card key={contact.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {contact.artist_profiles?.stage_name}
                          </CardTitle>
                          <p className="text-sm text-gray-600 font-medium">
                            {contact.subject}
                          </p>
                        </div>
                        {getStatusBadge(contact.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(contact.created_at), 'dd MMM yyyy', { locale: fr })}
                          </span>
                          {contact.artist_profiles?.voice_type && (
                            <Badge variant="outline">
                              {contact.artist_profiles.voice_type}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm">{contact.message}</p>
                        </div>
                        
                        {contact.status === 'viewed' && contact.viewed_at && (
                          <p className="text-xs text-blue-600">
                            Lu le {format(new Date(contact.viewed_at), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                          </p>
                        )}
                        
                        {contact.replied_at && (
                          <p className="text-xs text-green-600">
                            Répondu le {format(new Date(contact.replied_at), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ProfessionalMessages;
