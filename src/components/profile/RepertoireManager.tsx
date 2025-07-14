
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

export const RepertoireManager: React.FC<RepertoireManagerProps> = ({ artistProfileId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);

  const { repertoire = [], isLoading } = useArtistRepertoire(artistProfileId);
  const { works = [] } = useLyricalWorks();

  const categories = Array.from(new Set(works.map(work => work.category)));

  const filteredRepertoire = repertoire.filter(item => {
    const matchesSearch = item.lyrical_works?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.lyrical_works?.composer?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.lyrical_works?.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getMasteryColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-red-100 text-red-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-green-100 text-green-800';
      case 'expert': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <Music className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Mon Répertoire</h3>
          <Badge variant="secondary">{repertoire.length} œuvres</Badge>
        </div>
        
        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Ajouter une œuvre
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Ajouter une œuvre au répertoire
              </DialogTitle>
            </DialogHeader>
            <RepertoireAddForm 
              artistProfileId={artistProfileId}
              onClose={handleCloseForm}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par œuvre ou compositeur..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            {categories.map((category: string) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Repertoire list */}
      {filteredRepertoire.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              {searchQuery || selectedCategory !== 'all' 
                ? 'Aucune œuvre trouvée' 
                : 'Votre répertoire est vide'
              }
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || selectedCategory !== 'all'
                ? 'Essayez de modifier vos critères de recherche'
                : 'Commencez par ajouter vos premières œuvres'
              }
            </p>
            {!searchQuery && selectedCategory === 'all' && (
              <Button onClick={() => setShowAddForm(true)} className="mt-2">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter ma première œuvre
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRepertoire.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2 mb-1">
                      {item.lyrical_works?.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {item.lyrical_works?.composer}
                    </p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {item.lyrical_works?.category}
                    </Badge>
                    <Badge className={`text-xs ${getMasteryColor(item.mastery_level || 'intermediate')}`}>
                      {item.mastery_level}
                    </Badge>
                  </div>
                  
                  {item.work_roles && (
                    <p className="text-sm text-muted-foreground">
                      <strong>Rôle:</strong> {item.work_roles.role_name}
                    </p>
                  )}
                  
                  {item.performance_year && (
                    <p className="text-sm text-muted-foreground">
                      <strong>Année:</strong> {item.performance_year}
                    </p>
                  )}
                  
                  {item.venue && (
                    <p className="text-sm text-muted-foreground">
                      <strong>Lieu:</strong> {item.venue}
                    </p>
                  )}
                  
                  {item.notes && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-2">
                      {item.notes}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default RepertoireManager;
