import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Music, Search, ArrowLeft } from 'lucide-react';
import { useLyricalWorks } from '@/hooks/useLyricalWorks';
import { useSearchVenues } from '@/hooks/useVenues';
import { useArtistRepertoire } from '@/hooks/useArtistRepertoire';

interface RepertoireAddFormProps {
  artistProfileId: string;
  onClose: () => void;
}

const RepertoireAddForm: React.FC<RepertoireAddFormProps> = ({ artistProfileId, onClose }) => {
  const [step, setStep] = useState<'select' | 'details'>('select');
  const [titleFilter, setTitleFilter] = useState('');
  const [composerFilter, setComposerFilter] = useState('');
  const [selectedAir, setSelectedAir] = useState<any>(null);
  const [performanceYear, setPerformanceYear] = useState<number | null>(null);
  const [venue, setVenue] = useState<string>('');
  const [venueSearch, setVenueSearch] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const { works } = useLyricalWorks();
  const { data: venues = [] } = useSearchVenues(venueSearch);
  const { addToRepertoire, isAdding, checkDuplicate, repertoire } = useArtistRepertoire(artistProfileId);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'opera': return 'bg-purple-100 text-purple-800';
      case 'oratorio': return 'bg-blue-100 text-blue-800';
      case 'song': return 'bg-green-100 text-green-800';
      case 'operetta': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAirsList = useMemo(() => {
    const airsList: any[] = [];
    
    works.forEach(work => {
      if (work.work_roles && work.work_roles.length > 0) {
        work.work_roles.forEach(role => {
          if (role.aria_title) {
            // Filtrage par titre et compositeur
            const titleMatch = titleFilter === '' || 
              role.aria_title.toLowerCase().includes(titleFilter.toLowerCase()) ||
              work.title.toLowerCase().includes(titleFilter.toLowerCase());
            
            const composerMatch = composerFilter === '' || 
              work.composer.toLowerCase().includes(composerFilter.toLowerCase());

            if (titleMatch && composerMatch) {
              const existingCount = repertoire?.filter(item => 
                item.work_id === work.id && item.role_id === role.id
              ).length || 0;

              airsList.push({
                id: work.id,
                title: work.title,
                composer: work.composer,
                category: work.category,
                type: 'aria',
                displayTitle: role.aria_title,
                roleId: role.id,
                roleName: role.role_name,
                voiceType: role.voice_type,
                existingCount: existingCount
              });
            }
          }
        });
      }
    });
    
    return airsList.sort((a, b) => a.composer.localeCompare(b.composer));
  }, [works, titleFilter, composerFilter, repertoire]);

  const handleAirSelection = (air: any) => {
    setSelectedAir(air);
    setStep('details');
  };

  const handleVenueSelection = (selectedVenue: any) => {
    const venueText = `${selectedVenue.name}${selectedVenue.city ? `, ${selectedVenue.city}` : ''}`;
    setVenue(venueText);
    setVenueSearch(venueText);
  };

  const handleAdd = async () => {
    if (!selectedAir) return;

    // Vérification préventive des doublons
    const isDuplicate = checkDuplicate(selectedAir.id, selectedAir.roleId, performanceYear, venue || null);

    if (isDuplicate) {
      alert("Cette œuvre avec la même année et le même lieu existe déjà dans votre répertoire. Modifiez l'année ou le lieu pour ajouter une nouvelle interprétation.");
      return;
    }

    try {
      await addToRepertoire({
        artist_profile_id: artistProfileId,
        work_id: selectedAir.id,
        role_id: selectedAir.roleId,
        performance_year: performanceYear,
        venue: venue || null,
        notes: notes || null,
      });

      // Reset form
      setSelectedAir(null);
      setPerformanceYear(null);
      setVenue('');
      setVenueSearch('');
      setNotes('');
      setTitleFilter('');
      setComposerFilter('');
      setStep('select');
      onClose();
    } catch (error) {
      console.error('Error adding to repertoire:', error);
    }
  };

  const handleBack = () => {
    setStep('select');
    setSelectedAir(null);
    setPerformanceYear(null);
    setVenue('');
    setVenueSearch('');
    setNotes('');
  };

  if (step === 'details' && selectedAir) {
    return (
      <Card className="border-2 border-dashed border-gray-300">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="p-1 h-auto"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-lg">Détails de l'interprétation</CardTitle>
          </div>
          <div className="bg-muted p-3 rounded-md">
            <div className="flex items-center gap-2 mb-1">
              <Music className="h-4 w-4 text-purple-600" />
              <span className="font-medium">{selectedAir.displayTitle}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">{selectedAir.composer}</span>
              <span> - {selectedAir.title} ({selectedAir.roleName})</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
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
                <div className="border rounded-md max-h-40 overflow-y-auto bg-background z-50 absolute w-full">
                  {venues.map((venueItem) => (
                    <div
                      key={venueItem.id}
                      className="p-2 cursor-pointer hover:bg-muted border-b last:border-b-0"
                      onClick={() => handleVenueSelection(venueItem)}
                    >
                      <div className="font-medium">{venueItem.name}</div>
                      {venueItem.city && (
                        <div className="text-sm text-muted-foreground">
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
              disabled={isAdding}
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
  }

  return (
    <Card className="border-2 border-dashed border-gray-300">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Sélectionner un air</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title-filter">
              <Search className="h-4 w-4 inline mr-1" />
              Filtrer par titre
            </Label>
            <Input
              id="title-filter"
              placeholder="Titre de l'air ou de l'œuvre..."
              value={titleFilter}
              onChange={(e) => setTitleFilter(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="composer-filter">Filtrer par compositeur</Label>
            <Input
              id="composer-filter"
              placeholder="Nom du compositeur..."
              value={composerFilter}
              onChange={(e) => setComposerFilter(e.target.value)}
            />
          </div>
        </div>

        <div className="border rounded-md max-h-96 overflow-y-auto">
          {getAirsList.map((air, index) => (
            <div
              key={`${air.id}-${air.roleId}-${index}`}
              className="group p-3 border-b last:border-b-0 hover:bg-muted/50 transition-colors relative"
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
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">{air.composer}</span>
                    <span> - {air.title} ({air.roleName})</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {air.voiceType && (
                      <Badge variant="outline" className="text-xs">
                        {air.voiceType}
                      </Badge>
                    )}
                    <Badge className={`text-xs ${getCategoryColor(air.category)}`}>
                      {air.category}
                    </Badge>
                    {air.existingCount > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {air.existingCount} interprétation{air.existingCount > 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleAirSelection(air)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter
                </Button>
              </div>
            </div>
          ))}
          {getAirsList.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              {titleFilter || composerFilter ? 'Aucun air ne correspond aux filtres.' : 'Aucun air disponible.'}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RepertoireAddForm;