
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { EventFormImproved } from '@/components/events/EventFormImproved';
import { useProfessionalEvent } from '@/hooks/useEvents';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

const EditEvent = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: event, isLoading, error } = useProfessionalEvent(id!);

  const handleClose = () => {
    navigate('/mes-evenements');
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-muted/30 py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin mr-2" />
                <span>Chargement de l'événement...</span>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !event) {
    return (
      <Layout>
        <div className="min-h-screen bg-muted/30 py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-4 mb-8">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/mes-evenements')}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Retour
                </Button>
                <h1 className="text-3xl font-serif font-bold">
                  Événement introuvable
                </h1>
              </div>
              
              <Alert>
                <AlertDescription>
                  L'événement que vous tentez de modifier n'a pas pu être trouvé ou vous n'avez pas les permissions nécessaires.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-muted/30 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <Button 
                variant="outline" 
                onClick={() => navigate('/mes-evenements')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour
              </Button>
              <h1 className="text-3xl font-serif font-bold">
                Modifier l'événement
              </h1>
            </div>
            <EventFormImproved event={event} onClose={handleClose} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EditEvent;
