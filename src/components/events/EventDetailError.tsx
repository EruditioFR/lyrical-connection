
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import Layout from '@/components/layout/Layout';

interface EventDetailErrorProps {
  error?: Error;
  eventId?: string;
}

const EventDetailError: React.FC<EventDetailErrorProps> = ({ error, eventId }) => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-3xl font-serif font-bold mb-4">
            {error ? 'Erreur de chargement' : 'Événement non trouvé'}
          </h1>
          <p className="text-muted-foreground mb-6">
            {error 
              ? `Une erreur s'est produite lors du chargement de l'événement : ${error.message}`
              : "L'événement que vous recherchez n'existe pas ou n'est pas accessible."
            }
          </p>
          <div className="space-y-2">
            <Button asChild>
              <Link to="/mes-evenements">Retour à mes événements</Link>
            </Button>
            {eventId && (
              <div className="text-xs text-muted-foreground">
                ID {error ? "de l'événement" : "recherché"}: {eventId}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EventDetailError;
