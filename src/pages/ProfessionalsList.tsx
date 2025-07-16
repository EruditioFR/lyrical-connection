
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Building, MapPin, Globe, Phone, Mail, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProfessionalProfile {
  id: string;
  company_name: string | null;
  bio: string | null;
  professional_role: string;
  location: string | null;
  contact_email: string | null;
  phone: string | null;
  website: string | null;
  logo_url: string | null;
  is_verified: boolean;
}

const ProfessionalsList = () => {
  const [filters, setFilters] = useState({
    role: '',
    company: '',
    country: '',
    city: ''
  });

  const { data: professionals, isLoading } = useQuery({
    queryKey: ['professionals', filters],
    queryFn: async () => {
      let query = supabase
        .from('professional_profiles')
        .select('*')
        .eq('is_active', true);

      if (filters.role) {
        query = query.eq('professional_role', filters.role);
      }

      if (filters.company) {
        query = query.ilike('company_name', `%${filters.company}%`);
      }

      if (filters.country || filters.city) {
        let locationFilter = '';
        if (filters.city && filters.country) {
          locationFilter = `%${filters.city}%${filters.country}%`;
        } else if (filters.city) {
          locationFilter = `%${filters.city}%`;
        } else if (filters.country) {
          locationFilter = `%${filters.country}%`;
        }
        query = query.ilike('location', locationFilter);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ProfessionalProfile[];
    }
  });

  const getRoleLabel = (role: string) => {
    const roleLabels: Record<string, string> = {
      'casting_director': 'Directeur de casting',
      'vocal_coach': 'Coach vocal',
      'conductor': 'Chef d\'orchestre',
      'opera_house_manager': 'Directeur d\'opéra',
      'voice_teacher': 'Professeur de chant',
      'artistic_agent': 'Agent artistique',
      'producer': 'Producteur',
      'competition_director': 'Directeur de concours'
    };
    return roleLabels[role] || role;
  };

  const clearFilters = () => {
    setFilters({
      role: '',
      company: '',
      country: '',
      city: ''
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Les Professionnels du Secteur
          </h1>
          <p className="text-gray-600">
            Découvrez les professionnels de l'opéra et du chant lyrique
          </p>
        </div>

        {/* Filtres */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Filtres de recherche
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">Métier</label>
                <Select value={filters.role} onValueChange={(value) => setFilters(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les métiers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous les métiers</SelectItem>
                    <SelectItem value="casting_director">Directeur de casting</SelectItem>
                    <SelectItem value="vocal_coach">Coach vocal</SelectItem>
                    <SelectItem value="conductor">Chef d'orchestre</SelectItem>
                    <SelectItem value="opera_house_manager">Directeur d'opéra</SelectItem>
                    <SelectItem value="voice_teacher">Professeur de chant</SelectItem>
                    <SelectItem value="artistic_agent">Agent artistique</SelectItem>
                    <SelectItem value="producer">Producteur</SelectItem>
                    <SelectItem value="competition_director">Directeur de concours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Entreprise</label>
                <Input
                  placeholder="Nom de l'entreprise"
                  value={filters.company}
                  onChange={(e) => setFilters(prev => ({ ...prev, company: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Pays</label>
                <Input
                  placeholder="Pays"
                  value={filters.country}
                  onChange={(e) => setFilters(prev => ({ ...prev, country: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Ville</label>
                <Input
                  placeholder="Ville"
                  value={filters.city}
                  onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
                />
              </div>
            </div>

            <Button variant="outline" onClick={clearFilters}>
              Effacer les filtres
            </Button>
          </CardContent>
        </Card>

        {/* Liste des professionnels */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {professionals?.map((professional) => (
              <Card key={professional.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {professional.logo_url ? (
                        <img
                          src={professional.logo_url}
                          alt={professional.company_name || 'Logo'}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Building className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-lg">
                          {professional.company_name || 'Professionnel'}
                        </h3>
                        {professional.is_verified && (
                          <Badge variant="secondary" className="text-xs">
                            Vérifié
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Badge variant="outline">
                        {getRoleLabel(professional.professional_role)}
                      </Badge>
                    </div>

                    {professional.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{professional.location}</span>
                      </div>
                    )}

                    {professional.bio && (
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {professional.bio}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2 pt-2">
                      {professional.contact_email && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => window.open(`mailto:${professional.contact_email}`)}
                        >
                          <Mail className="h-3 w-3 mr-1" />
                          Contact
                        </Button>
                      )}

                      {professional.website && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => window.open(professional.website, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Site web
                        </Button>
                      )}

                      {professional.phone && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => window.open(`tel:${professional.phone}`)}
                        >
                          <Phone className="h-3 w-3 mr-1" />
                          Appeler
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {professionals && professionals.length === 0 && (
          <div className="text-center py-12">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun professionnel trouvé
            </h3>
            <p className="text-gray-600">
              Essayez de modifier vos critères de recherche
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProfessionalsList;
