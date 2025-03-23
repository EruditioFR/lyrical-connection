
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import Layout from '@/components/layout/Layout';
import { Button } from "@/components/ui/button";
import { Home } from 'lucide-react';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <Layout>
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="text-9xl font-serif font-bold bg-clip-text text-transparent bg-gradient-to-r from-lyrical-700 to-gold-500">404</h1>
          <h2 className="text-2xl md:text-3xl font-serif font-bold mt-4 mb-6">Page non trouvée</h2>
          <p className="text-muted-foreground mb-8">
            La page que vous recherchez n'existe pas ou a été déplacée.
          </p>
          <Button size="lg" className="bg-gradient-to-r from-lyrical-600 to-gold-500 hover:from-lyrical-700 hover:to-gold-600 text-white" asChild>
            <Link to="/" className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Retour à l'accueil
            </Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
