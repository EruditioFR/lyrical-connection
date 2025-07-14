
import React from 'react';
import Layout from '@/components/layout/Layout';
import { EventFormImproved } from '@/components/events/EventFormImproved';
import { useNavigate } from 'react-router-dom';

const CreateEvent = () => {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/mes-evenements');
  };

  return (
    <Layout>
      <div className="min-h-screen bg-muted/30 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-serif font-bold mb-8">
              Créer un nouvel événement
            </h1>
            <EventFormImproved onClose={handleClose} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreateEvent;
