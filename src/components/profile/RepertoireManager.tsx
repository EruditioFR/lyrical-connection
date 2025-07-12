import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Music, User, Edit, Save, X } from 'lucide-react';
import { useArtistRepertoire } from '@/hooks/useArtistRepertoire';
import { useLyricalWorks } from '@/hooks/useLyricalWorks';
import { useVenues, useSearchVenues } from '@/hooks/useVenues';

interface RepertoireManagerProps {
  artistProfileId: string;
}

const RepertoireManager: React.FC<RepertoireManagerProps> = ({ artistProfileId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWork, setSelectedWork] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [performanceYear, setPerformanceYear] = useState<number | null>(null);
  const [venue, setVenue] = useState<string>('');
  const [venueSearch, setVenueSearch] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);

  // États pour l'édition
  const [editPerformanceYear, setEditPerformanceYear] = useState<number | null>(null);
  const [editVenue, setEditVenue] = useState<string>('');
  const [editVenueSearch, setEditVenueSearch] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');

  const { repertoire, isLoading, addToRepertoire, updateRepertoire, deleteFromRepertoire, isAdding, isUpdating } = useArtistRepertoire(artistProfileId);
  const { works } = useLyricalWorks(searchTerm);
  const { data: venues = [] } = useSearchVenues(venueSearch);
  const { data: editVenues = [] } = useSearchVenues(editVenueSearch);

  const handleAddToRepertoire = () => {
    if (!selectedWork || !selectedRole) return;

    addToRepertoire({
      artist_profile_id: artistProfileId,
      work_id: selectedWork,
      role_id: selectedRole,
      performance_year: performanceYear,
      venue: venue || null,
      notes: notes || null,
    });

    // Reset form
    setSelectedWork('');
    setSelectedRole('');
    setPerformanceYear(null);
    setVenue('');
    setVenueSearch('');
    setNotes('');
    setShowAddForm(false);
  };

  const handleEditStart = (item: any) => {
    setEditingItem(item.id);
    setEditPerformanceYear(item.performance_year || null);
    setEditVenue(item.venue || '');
    setEditVenueSearch(item.venue || '');
    setEditNotes(item.notes || '');
  };

  const handleEditSave = (id: string) => {
    updateRepertoire({
      id,
      performance_year: editPerformanceYear,
      venue: editVenue || null,
      notes: editNotes || null,
    });
    setEditingItem(null);
  };

  const handleEditCancel = () => {
    setEditingItem(null);
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

  const getDisplayTitle = (item: any) => {
    if (item.work_roles && item.work_roles.aria_title) {
      return item.work_roles.aria_title;
    }
    return item.lyrical_works.title;
  };

  const getAirsList = () => {
    const airsList: any[] = [];
    
    works.forEach(work => {
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

  const handleVenueSelection = (selectedVenue: any, isEdit = false) => {
    const venueText = `${selectedVenue.name}${selectedVenue.city ? `, ${selectedVenue.city}` : ''}`;
    if (isEdit) {
      setEditVenue(venueText);
      setEditVenueSearch(venueText);
    } else {
      setVenue(venueText);
      setVenueSearch(venueText);
    }
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
                  <Label htmlFor="performance-year">Année de représentation</Label>
                  <Input
                    id="performance-year"
                    type="number"
                    min="1900"
                    max={new Date().getFullYear()}
                    placeholder="ex: 2023"
                    value={performanceYear || ''}
                    onChange={(e) => setPerformanceYear(e.target.value ? parseInt(e.target.value) : null)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="venue-search">Lieu (opéra/festival)</Label>
                  <Input
                    id="venue-search"
                    placeholder="Rechercher un lieu..."
                    value={venueSearch}
                    onChange={(e) => setVenueSearch(e.target.value)}
                  />
                  {venueSearch.length > 1 && venues.length > 0 && (
                    <div className="border rounded-md max-h-40 overflow-y-auto bg-white">
                      {venues.map((venueItem) => (
                        <div
                          key={venueItem.id}
                          className="p-2 cursor-pointer hover:bg-gray-100 border-b last:border-b-0"
                          onClick={() => handleVenueSelection(venueItem)}
                        >
                          <div className="font-medium">{venueItem.name}</div>
                          {venueItem.city && (
                            <div className="text-sm text-gray-600">
                              {venueItem.city}{venueItem.country && `, ${venueItem.country}`}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
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

                      {editingItem === item.id ? (
                        // Mode édition
                        <div className="space-y-4 mt-4 p-4 bg-gray-50 rounded-lg">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Année de représentation</Label>
                              <Input
                                type="number"
                                min="1900"
                                max={new Date().getFullYear()}
                                placeholder="ex: 2023"
                                value={editPerformanceYear || ''}
                                onChange={(e) => setEditPerformanceYear(e.target.value ? parseInt(e.target.value) : null)}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Lieu</Label>
                              <Input
                                placeholder="Rechercher un lieu..."
                                value={editVenueSearch}
                                onChange={(e) => setEditVenueSearch(e.target.value)}
                              />
                              {editVenueSearch.length > 1 && editVenues.length > 0 && (
                                <div className="border rounded-md max-h-40 overflow-y-auto bg-white">
                                  {editVenues.map((venueItem) => (
                                    <div
                                      key={venueItem.id}
                                      className="p-2 cursor-pointer hover:bg-gray-100 border-b last:border-b-0"
                                      onClick={() => handleVenueSelection(venueItem, true)}
                                    >
                                      <div className="font-medium">{venueItem.name}</div>
                                      {venueItem.city && (
                                        <div className="text-sm text-gray-600">
                                          {venueItem.city}{venueItem.country && `, ${venueItem.country}`}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Notes</Label>
                            <Textarea
                              placeholder="Commentaires..."
                              value={editNotes}
                              onChange={(e) => setEditNotes(e.target.value)}
                              rows={3}
                            />
                          </div>

                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleEditSave(item.id)}
                              disabled={isUpdating}
                              size="sm"
                              className="flex items-center gap-2"
                            >
                              <Save className="h-4 w-4" />
                              {isUpdating ? 'Sauvegarde...' : 'Sauvegarder'}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={handleEditCancel}
                              size="sm"
                              className="flex items-center gap-2"
                            >
                              <X className="h-4 w-4" />
                              Annuler
                            </Button>
                          </div>
                        </div>
                      ) : (
                        // Mode affichage
                        <div>
                          {(item.performance_year || item.venue) && (
                            <div className="flex items-center gap-4 mb-2 text-sm text-gray-600">
                              {item.performance_year && (
                                <span>Année: {item.performance_year}</span>
                              )}
                              {item.venue && (
                                <span>Lieu: {item.venue}</span>
                              )}
                            </div>
                          )}
                          
                          {item.notes && (
                            <p className="text-sm text-gray-700 italic mt-2">{item.notes}</p>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      {editingItem !== item.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditStart(item)}
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteFromRepertoire(item.id)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
