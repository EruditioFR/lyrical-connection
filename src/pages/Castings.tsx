
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import CastingCard from '@/components/castings/CastingCard';
import { CastingsSidebar } from '@/components/castings/CastingsSidebar';
import CastingsMarketing from '@/components/castings/CastingsMarketing';
import { Button } from '@/components/ui/button';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { useCastings, useMyCastings } from '@/hooks/useCastings';
import { useAuth } from '@/hooks/useAuth';
import { useUserType } from '@/hooks/useUserType';
import { Plus, Loader2, Search } from 'lucide-react';

const Castings = () => {
  console.log('Castings component rendered');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userType } = useUserType();
  const [filters, setFilters] = useState({});
  
  // Tous les hooks doivent être appelés AVANT toute condition
  const { castings: allCastings, isLoading: allCastingsLoading } = useCastings(filters);
  const { castings: myCastings, isLoading: myCastingsLoading } = useMyCastings();
  
  // Si l'utilisateur n'est pas connecté, afficher la page marketing
  if (!user) {
    return (
      <Layout>
        <CastingsMarketing />
      </Layout>
    );
  }
  
  // Utiliser le bon hook selon le type d'utilisateur
  const isProfessional = userType === 'professional';
  const castings = isProfessional ? myCastings : allCastings;
  const isLoading = isProfessional ? myCastingsLoading : allCastingsLoading;
  
  console.log('Castings data:', { castings, isLoading, user, userType, isProfessional });

  return (
    <Layout>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          {/* Sidebar pour les filtres - masqué pour les professionnels */}
          {!isProfessional && (
            <CastingsSidebar 
              filters={filters}
              onFiltersChange={setFilters}
            />
          )}

          {/* Contenu principal */}
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto px-4 py-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold">
                    {isProfessional ? 'Mes Castings' : 'Castings'}
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    {isProfessional 
                      ? 'Gérez vos castings et consultez les candidatures reçues'
                      : 'Découvrez les opportunités d\'auditions et de castings'
                    }
                  </p>
                </div>
                
                {user && (
                  <Button
                    onClick={() => navigate('/castings/nouveau')}
                    className="bg-gradient-to-r from-lyrical-600 to-gold-500 hover:from-lyrical-700 hover:to-gold-600"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Créer un casting
                  </Button>
                )}
              </div>

              {/* Liste des castings */}
              <div>
                {isLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-lyrical-600" />
                  </div>
                ) : (
                  <>
                    <div className="mb-4 text-sm text-muted-foreground">
                      {castings.length} casting{castings.length !== 1 ? 's' : ''} trouvé{castings.length !== 1 ? 's' : ''}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {castings.map((casting) => (
                        <CastingCard key={casting.id} casting={casting} />
                      ))}
                    </div>
                    
                    {castings.length === 0 && (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground text-lg">
                          Aucun casting ne correspond à vos critères.
                        </p>
                        <p className="text-muted-foreground/70 text-sm mt-2">
                          Essayez de modifier vos filtres de recherche.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    </Layout>
  );
};

export default Castings;
