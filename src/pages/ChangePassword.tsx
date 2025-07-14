
import React from 'react';
import { Navigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import PasswordChangeForm from '@/components/auth/PasswordChangeForm';
import { useAuth } from '@/hooks/useAuth';

const ChangePassword = () => {
  const { user, loading } = useAuth();

  // Rediriger si pas connecté
  if (!loading && !user) {
    return <Navigate to="/auth" replace />;
  }

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lyrical-600 mx-auto mb-4"></div>
              <p>Chargement...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-serif font-bold mb-2">Sécurité du compte</h1>
            <p className="text-muted-foreground">
              Gérez les paramètres de sécurité de votre compte
            </p>
          </div>
          
          <PasswordChangeForm />
        </div>
      </div>
    </Layout>
  );
};

export default ChangePassword;
