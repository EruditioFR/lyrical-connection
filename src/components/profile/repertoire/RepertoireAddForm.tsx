
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Music } from 'lucide-react';
import { useLyricalWorks } from '@/hooks/useLyricalWorks';
import { useSearchVenues } from '@/hooks/useVenues';
import { useArtistRepertoire } from '@/hooks/useArtistRepertoire';

interface RepertoireAddFormProps {
  artistProfileId: string;
  onClose: () => void;
}

const RepertoireAddForm: React.FC<RepertoireAddFormProps> = ({ artistProfileId, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWork, setSelectedWork] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [performanceYear, setPerformanceYear] = useState<number | null>(null);
  const [venue, setVenue] = useState<string>('');
  const [venueSearch, setVenueSearch] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const { works } = useLyricalWorks(searchTerm);
  const { data: venues = [] } = useSearchVenues(venueSearch);
  const { addToRepertoire, isAdding } = useArtistRepertoire(artistProfileId);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'opera': return 'bg-purple-100 text-purple-800';
      case 'oratorio': return 'bg-blue-100 text-blue-800';
      case 'song': return 'bg-green-100 text-green-800';
      case 'operetta': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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

  const handleVenueSelection = (selectedVenue: any) => {
    const venueText = `${selectedVenue.name}${selectedVenue.city ? `, ${selectedVenue.city}` : ''}`;
    setVenue(venueText);
    setVenueSearch(venueText);
  };

  const handleAdd = async () => {
    if (!selectedWork || !selectedRole) return;

    try {
      await addToRepertoire({
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
      setSearchTerm('');
      onClose();
    } catch (error) {
      console.error('Error adding to repertoire:', error);
    }
  };

  return (
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
            onClick={handleAdd}
            disabled={!selectedWork || !selectedRole || isAdding}
            className="flex-1"
          >
            {isAdding ? 'Ajout...' : 'Ajouter au répertoire'}
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
          >
            Annuler
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RepertoireAddForm;
