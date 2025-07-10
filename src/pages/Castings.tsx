
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import CastingCard from '@/components/castings/CastingCard';
import CastingFilters from '@/components/castings/CastingFilters';
import { Button } from '@/components/ui/button';
import { useCastings } from '@/hooks/useCastings';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Loader2 } from 'lucide-react';

const Castings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [filters, setFilters] = useState({});
  const { castings, isLoading } = useCastings(filters);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Castings</h1>
            <p className="text-gray-600 mt-2">
              Découvrez les opportunités d'auditions et de castings
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filtres */}
          <div className="lg:col-span-1">
            <CastingFilters 
              filters={filters}
              onFiltersChange={setFilters}
            />
          </div>

          {/* Liste des castings */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-lyrical-600" />
              </div>
            ) : (
              <>
                <div className="mb-4 text-sm text-gray-500">
                  {castings.length} casting{castings.length !== 1 ? 's' : ''} trouvé{castings.length !== 1 ? 's' : ''}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {castings.map((casting) => (
                    <CastingCard key={casting.id} casting={casting} />
                  ))}
                </div>
                
                {castings.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">
                      Aucun casting ne correspond à vos critères.
                    </p>
                    <p className="text-gray-400 text-sm mt-2">
                      Essayez de modifier vos filtres de recherche.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Castings;
