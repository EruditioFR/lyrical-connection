
import React from 'react';
import { Navigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import CastingForm from '@/components/castings/CastingForm';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

const CreateCasting = () => {
  const { user, loading } = useAuth();

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

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Créer un casting</h1>
          <p className="text-gray-600 mt-2">
            Publiez votre casting pour attirer les meilleurs talents
          </p>
        </div>
        
        <CastingForm />
      </div>
    </Layout>
  );
};

export default CreateCasting;
