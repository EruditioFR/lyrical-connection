import React, { useState } from 'react';
import { Plus, Search, Filter, Music, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useArtistRepertoire } from '@/hooks/useArtistRepertoire';
import { useLyricalWorks } from '@/hooks/useLyricalWorks';
import RepertoireAddForm from './repertoire/RepertoireAddForm';
interface RepertoireManagerProps {
  artistProfileId: string;
}
export const RepertoireManager: React.FC<RepertoireManagerProps> = ({
  artistProfileId
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedComposer, setSelectedComposer] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedVenue, setSelectedVenue] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const {
    repertoire = [],
    isLoading
  } = useArtistRepertoire(artistProfileId);
  const {
    works = []
  } = useLyricalWorks();

  // Extract unique values for filters
  const categories = Array.from(new Set(works.map(work => work.category)));
  const composers = Array.from(new Set(repertoire.map(item => item.lyrical_works?.composer).filter(Boolean)));
  const roles = Array.from(new Set(repertoire.map(item => item.work_roles?.role_name).filter(Boolean)));
  const years = Array.from(new Set(repertoire.map(item => item.performance_year).filter(Boolean))).sort((a, b) => b - a);
  const venues = Array.from(new Set(repertoire.map(item => item.venue).filter(Boolean)));
  const filteredRepertoire = repertoire.filter(item => {
    const matchesSearch = item.lyrical_works?.title?.toLowerCase().includes(searchQuery.toLowerCase()) || item.lyrical_works?.composer?.toLowerCase().includes(searchQuery.toLowerCase()) || item.work_roles?.role_name?.toLowerCase().includes(searchQuery.toLowerCase()) || item.venue?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.lyrical_works?.category === selectedCategory;
    const matchesComposer = selectedComposer === 'all' || item.lyrical_works?.composer === selectedComposer;
    const matchesRole = selectedRole === 'all' || item.work_roles?.role_name === selectedRole;
    const matchesYear = selectedYear === 'all' || item.performance_year?.toString() === selectedYear;
    const matchesVenue = selectedVenue === 'all' || item.venue === selectedVenue;
    return matchesSearch && matchesCategory && matchesComposer && matchesRole && matchesYear && matchesVenue;
  });
  const getMasteryColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-red-100 text-red-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-green-100 text-green-800';
      case 'expert':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  const handleCloseForm = () => {
    setShowAddForm(false);
  };
  if (isLoading) {
    return <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>;
  }
  return <div className="space-y-6">
      {/* Header with actions */}
      

      {/* Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher par œuvre, compositeur, rôle ou lieu..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <h4 className="text-sm font-medium text-muted-foreground">Filtrer par</h4>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Catégorie">
                  {selectedCategory === 'all' ? 'Catégorie' : `Catégorie: ${selectedCategory}`}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-background border z-50">
                <SelectItem value="all">-</SelectItem>
                {categories.map((category: string) => <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={selectedComposer} onValueChange={setSelectedComposer}>
              <SelectTrigger>
                <SelectValue placeholder="Compositeur">
                  {selectedComposer === 'all' ? 'Compositeur' : `Compositeur: ${selectedComposer}`}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-background border z-50">
                <SelectItem value="all">-</SelectItem>
                {composers.map((composer: string) => <SelectItem key={composer} value={composer}>
                    {composer}
                  </SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Rôle">
                  {selectedRole === 'all' ? 'Rôle' : `Rôle: ${selectedRole}`}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-background border z-50">
                <SelectItem value="all">-</SelectItem>
                {roles.map((role: string) => <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger>
                <SelectValue placeholder="Année">
                  {selectedYear === 'all' ? 'Année' : `Année: ${selectedYear}`}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-background border z-50">
                <SelectItem value="all">-</SelectItem>
                {years.map((year: number) => <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={selectedVenue} onValueChange={setSelectedVenue}>
              <SelectTrigger>
                <SelectValue placeholder="Lieu">
                  {selectedVenue === 'all' ? 'Lieu' : `Lieu: ${selectedVenue}`}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-background border z-50">
                <SelectItem value="all">-</SelectItem>
                {venues.map((venue: string) => <SelectItem key={venue} value={venue}>
                    {venue}
                  </SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {(searchQuery || selectedCategory !== 'all' || selectedComposer !== 'all' || selectedRole !== 'all' || selectedYear !== 'all' || selectedVenue !== 'all') && <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => {
          setSearchQuery('');
          setSelectedCategory('all');
          setSelectedComposer('all');
          setSelectedRole('all');
          setSelectedYear('all');
          setSelectedVenue('all');
        }}>
              Effacer tous les filtres
            </Button>
            <span className="text-sm text-muted-foreground">
              {filteredRepertoire.length} résultat{filteredRepertoire.length > 1 ? 's' : ''}
            </span>
          </div>}
      </div>

      {/* Repertoire list */}
      {filteredRepertoire.length === 0 ? <Card>
          <CardContent className="p-12 text-center">
            <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              {searchQuery || selectedCategory !== 'all' || selectedComposer !== 'all' || selectedRole !== 'all' || selectedYear !== 'all' || selectedVenue !== 'all' ? 'Aucune œuvre trouvée' : 'Votre répertoire est vide'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || selectedCategory !== 'all' || selectedComposer !== 'all' || selectedRole !== 'all' || selectedYear !== 'all' || selectedVenue !== 'all' ? 'Essayez de modifier vos critères de recherche' : 'Commencez par ajouter vos premières œuvres'}
            </p>
            {!(searchQuery || selectedCategory !== 'all' || selectedComposer !== 'all' || selectedRole !== 'all' || selectedYear !== 'all' || selectedVenue !== 'all') && <Button onClick={() => setShowAddForm(true)} className="mt-2">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter ma première œuvre
              </Button>}
          </CardContent>
        </Card> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRepertoire.map(item => <Card key={item.id} className="border-2 hover:border-amber-400/50 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-200 bg-gradient-to-br from-amber-900/95 to-amber-800/95 text-amber-50 border-amber-700/50">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2 mb-1 text-amber-50">
                      {item.lyrical_works?.title}
                    </CardTitle>
                    <p className="text-sm text-amber-200/80">
                      {item.lyrical_works?.composer}
                    </p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs border-amber-400/50 text-amber-200 bg-amber-800/50">
                      {item.lyrical_works?.category}
                    </Badge>
                    <Badge className={`text-xs border-amber-500/50 bg-amber-700/70 text-amber-100 ${getMasteryColor(item.mastery_level || 'intermediate')}`}>
                      {item.mastery_level}
                    </Badge>
                  </div>
                  
                  {item.work_roles && <p className="text-sm text-amber-200/90">
                      <strong className="text-amber-100">Rôle:</strong> {item.work_roles.role_name}
                    </p>}
                  
                  {item.performance_year && <p className="text-sm text-amber-200/90">
                      <strong className="text-amber-100">Année:</strong> {item.performance_year}
                    </p>}
                  
                  {item.venue && <p className="text-sm text-amber-200/90">
                      <strong className="text-amber-100">Lieu:</strong> {item.venue}
                    </p>}
                  
                  {item.notes && <p className="text-xs text-amber-200/80 line-clamp-2 mt-2">
                      {item.notes}
                    </p>}
                </div>
              </CardContent>
            </Card>)}
        </div>}
    </div>;
};
export default RepertoireManager;