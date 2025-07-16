
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Target, Building, CheckCircle, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';


interface Professional {
  id: string;
  user_id: string;
  company_name: string;
  professional_role: string;
  location: string;
  intervention_radius: number;
  bio: string;
  logo_url: string;
  is_verified: boolean;
}

const ProfessionalsList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const { data: professionals = [], isLoading, error } = useQuery({
    queryKey: ['professionals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('professional_profiles')
        .select('*');

      if (error) {
        console.error('Error fetching professionals:', error);
        throw error;
      }

      return data as Professional[];
    },
  });

  const filteredProfessionals = professionals.filter(professional =>
    professional.company_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <Layout><div>Loading professionals...</div></Layout>;
  }

  if (error) {
    return <Layout><div>Error: {error.message}</div></Layout>;
  }

  const ProfessionalCard = ({ professional }: { professional: Professional }) => {
    const navigate = useNavigate();

    const handleViewProfile = () => {
      navigate(`/professional/${professional.id}`);
    };

    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {professional.company_name}
              </h3>
              
              <Badge variant="secondary" className="mb-2">
                {professional.professional_role === 'vocal_coach' && 'Coach vocal'}
                {professional.professional_role === 'opera_director' && 'Directeur d\'opéra'}
                {professional.professional_role === 'casting_director' && 'Directeur de casting'}
                {professional.professional_role === 'accompanist' && 'Accompagnateur'}
                {professional.professional_role === 'agent' && 'Agent'}
                {professional.professional_role === 'producer' && 'Producteur'}
              </Badge>
              
              <div className="flex items-center text-gray-600 text-sm mb-2">
                <MapPin className="w-4 h-4 mr-1" />
                {professional.location || 'Lieu non spécifié'}
              </div>
              
              <div className="flex items-center text-gray-600 text-sm">
                <Target className="w-4 h-4 mr-1" />
                Rayon: {professional.intervention_radius || 50} km
              </div>
            </div>

            <div className="ml-4">
              {professional.logo_url ? (
                <img
                  src={professional.logo_url}
                  alt={professional.company_name}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                  <Building className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>
          </div>

          {professional.bio && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
              {professional.bio}
            </p>
          )}

          <div className="flex flex-wrap gap-2 mb-4">
            {professional.is_verified && (
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Vérifié
              </Badge>
            )}
          </div>

          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewProfile}
            >
              Voir le profil
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => console.log('Contact professional:', professional.company_name)}
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              Contacter
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">Liste des professionnels</h1>

        <div className="mb-4">
          <Input
            type="text"
            placeholder="Rechercher un professionnel..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <ScrollArea className="rounded-md border">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 p-4">
            {filteredProfessionals.map(professional => (
              <ProfessionalCard key={professional.id} professional={professional} />
            ))}
          </div>
        </ScrollArea>
      </div>
    </Layout>
  );
};

export default ProfessionalsList;
