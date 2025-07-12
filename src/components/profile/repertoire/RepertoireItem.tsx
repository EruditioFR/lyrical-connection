
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, Save, X, User } from 'lucide-react';
import { useSearchVenues } from '@/hooks/useVenues';

interface RepertoireItemProps {
  item: any;
  onUpdate: (id: string, data: {
    performance_year: number | null;
    venue: string | null;
    notes: string | null;
  }) => void;
  onDelete: (id: string) => void;
  isUpdating: boolean;
}

const RepertoireItem: React.FC<RepertoireItemProps> = ({ item, onUpdate, onDelete, isUpdating }) => {
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editPerformanceYear, setEditPerformanceYear] = useState<number | null>(null);
  const [editVenue, setEditVenue] = useState<string>('');
  const [editVenueSearch, setEditVenueSearch] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');

  const { data: editVenues = [] } = useSearchVenues(editVenueSearch);

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

  const handleEditStart = (item: any) => {
    setEditingItem(item.id);
    setEditPerformanceYear(item.performance_year || null);
    setEditVenue(item.venue || '');
    setEditVenueSearch(item.venue || '');
    setEditNotes(item.notes || '');
  };

  const handleEditSave = (id: string) => {
    onUpdate(id, {
      performance_year: editPerformanceYear,
      venue: editVenue || null,
      notes: editNotes || null,
    });
    setEditingItem(null);
  };

  const handleEditCancel = () => {
    setEditingItem(null);
  };

  const handleVenueSelection = (selectedVenue: any) => {
    const venueText = `${selectedVenue.name}${selectedVenue.city ? `, ${selectedVenue.city}` : ''}`;
    setEditVenue(venueText);
    setEditVenueSearch(venueText);
  };

  return (
    <Card key={item.id}>
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
              onClick={() => onDelete(item.id)}
              className="text-red-600 hover:text-red-800 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RepertoireItem;
