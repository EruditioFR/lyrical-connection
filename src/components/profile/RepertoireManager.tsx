
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Music, User } from 'lucide-react';
import { useArtistRepertoire } from '@/hooks/useArtistRepertoire';
import { useLyricalWorks, useWorkRoles } from '@/hooks/useLyricalWorks';

interface RepertoireManagerProps {
  artistProfileId: string;
}

const masteryLevels = [
  { value: 'beginner', label: 'Débutant' },
  { value: 'intermediate', label: 'Intermédiaire' },
  { value: 'advanced', label: 'Avancé' },
  { value: 'expert', label: 'Expert' },
];

const RepertoireManager: React.FC<RepertoireManagerProps> = ({ artistProfileId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWork, setSelectedWork] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [masteryLevel, setMasteryLevel] = useState<string>('intermediate');
  const [yearsExperience, setYearsExperience] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState(false);

  const { repertoire, isLoading, addToRepertoire, deleteFromRepertoire, isAdding } = useArtistRepertoire(artistProfileId);
  const { works } = useLyricalWorks(searchTerm);

  const handleAddToRepertoire = () => {
    if (!selectedWork || !selectedRole) return;

    addToRepertoire({
      artist_profile_id: artistProfileId,
      work_id: selectedWork,
      role_id: selectedRole,
      mastery_level: masteryLevel,
      years_experience: yearsExperience,
      notes: notes || null,
    });

    // Reset form
    setSelectedWork('');
    setSelectedRole('');
    setMasteryLevel('intermediate');
    setYearsExperience(0);
    setNotes('');
    setShowAddForm(false);
  };

  const handleDeleteFromRepertoire = (id: string) => {
    deleteFromRepertoire(id);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'opera': return 'bg-purple-100 text-purple-800';
      case 'oratorio': return 'bg-blue-100 text-blue-800';
      case 'song': return 'bg-green-100 text-green-800';
      case 'operetta': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMasteryColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-yellow-100 text-yellow-800';
      case 'intermediate': return 'bg-blue-100 text-blue-800';
      case 'advanced': return 'bg-green-100 text-green-800';
      case 'expert': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Fonction pour obtenir le titre à afficher (air ou œuvre)
  const getDisplayTitle = (item: any) => {
    if (item.work_roles && item.work_roles.aria_title) {
      return item.work_roles.aria_title;
    }
    return item.lyrical_works.title;
  };

  // Fonction pour créer une liste contenant uniquement les airs
  const getAirsList = () => {
    const airsList: any[] = [];
    
    works.forEach(work => {
      // Ajouter seulement les airs de cette œuvre
      if (work.work_roles && work.work_roles.length > 0) {
        work.work_roles.forEach(role => {
          if (role.aria_title) {
            airsList.push({
              id: work.id,
              title: work.title,
              composer: work.composer,
              category: work.category,
              type: 'aria',
              displayTitle: role.aria_title,
              roleId: role.id,
              roleName: role.role_name,
              voiceType: role.voice_type
            });
          }
        });
      }
    });
    
    return airsList;
  };

  const handleAirSelection = (air: any) => {
    setSelectedWork(air.id);
    setSelectedRole(air.roleId);
    setSearchTerm(air.displayTitle);
  };

  if (isLoading) {
    return <div className="text-center py-8">Chargement du répertoire...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5" />
          Répertoire lyrique
        </CardTitle>
        <CardDescription>
          Gérez votre répertoire d'airs lyriques
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Bouton pour ajouter un air */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Mes airs ({repertoire.length})</h3>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Ajouter un air
          </Button>
        </div>

        {/* Formulaire d'ajout */}
        {showAddForm && (
          <Card className="border-2 border-dashed border-gray-300">
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="air-search">Rechercher un air</Label>
                <Input
                  id="air-search"
                  placeholder="Tapez le titre de l'air ou le compositeur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm.length > 1 && (
                  <div className="border rounded-md max-h-60 overflow-y-auto">
                    {getAirsList().map((air, index) => (
                      <div
                        key={`${air.id}-${air.roleId}-${index}`}
                        className={`p-3 cursor-pointer hover:bg-gray-100 border-b last:border-b-0 ${
                          selectedWork === air.id && selectedRole === air.roleId ? 'bg-blue-100' : ''
                        }`}
                        onClick={() => handleAirSelection(air)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Music className="h-4 w-4 text-purple-600" />
                              <span className="font-medium">{air.displayTitle}</span>
                              <Badge variant="outline" className="text-xs">
                                Air
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">{air.composer}</span>
                              <span> - {air.title} ({air.roleName})</span>
                            </div>
                            {air.voiceType && (
                              <Badge variant="outline" className="text-xs mt-1">
                                {air.voiceType}
                              </Badge>
                            )}
                          </div>
                          <Badge className={`text-xs ${getCategoryColor(air.category)}`}>
                            {air.category}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {getAirsList().length === 0 && (
                      <div className="p-3 text-center text-gray-500">
                        Aucun air trouvé
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mastery-level">Niveau de maîtrise</Label>
                  <Select value={masteryLevel} onValueChange={setMasteryLevel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {masteryLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="years-experience">Années d'expérience</Label>
                  <Input
                    id="years-experience"
                    type="number"
                    min="0"
                    value={yearsExperience}
                    onChange={(e) => setYearsExperience(parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optionnel)</Label>
                <Textarea
                  id="notes"
                  placeholder="Commentaires sur votre expérience avec cet air..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleAddToRepertoire}
                  disabled={!selectedWork || !selectedRole || isAdding}
                  className="flex-1"
                >
                  {isAdding ? 'Ajout...' : 'Ajouter au répertoire'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                >
                  Annuler
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Liste du répertoire */}
        <div className="space-y-4">
          {repertoire.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun air dans votre répertoire</p>
              <p className="text-sm">Ajoutez votre premier air pour commencer</p>
            </div>
          ) : (
            repertoire.map((item) => (
              <Card key={item.id} className="relative">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-lg">{getDisplayTitle(item)}</h4>
                        <Badge className={getCategoryColor(item.lyrical_works.category)}>
                          {item.lyrical_works.category}
                        </Badge>
                        {item.work_roles && item.work_roles.aria_title && (
                          <Badge variant="outline" className="text-xs">
                            Air
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-gray-600 mb-2">
                        <span className="font-medium">{item.lyrical_works.composer}</span>
                        {item.work_roles && item.work_roles.aria_title ? (
                          <span> - {item.lyrical_works.title}</span>
                        ) : (
                          <span> - {item.lyrical_works.title}</span>
                        )}
                      </p>
                      
                      {item.work_roles && (
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{item.work_roles.role_name}</span>
                          {item.work_roles.voice_type && (
                            <Badge variant="outline" className="text-xs">
                              {item.work_roles.voice_type}
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4 mb-2">
                        <Badge className={getMasteryColor(item.mastery_level || 'intermediate')}>
                          {masteryLevels.find(l => l.value === item.mastery_level)?.label || 'Intermédiaire'}
                        </Badge>
                        {item.years_experience > 0 && (
                          <span className="text-sm text-gray-600">
                            {item.years_experience} an{item.years_experience > 1 ? 's' : ''} d'expérience
                          </span>
                        )}
                      </div>
                      
                      {item.notes && (
                        <p className="text-sm text-gray-700 italic mt-2">{item.notes}</p>
                      )}
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteFromRepertoire(item.id)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RepertoireManager;
