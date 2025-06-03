
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from "@/components/ui/button";
import { PlayCircle, Search, Filter, X, Loader2 } from 'lucide-react';
import { useArtists } from '@/hooks/useArtists';
import { useArtistPhotos } from '@/hooks/useArtistPhotos';

// Types de voix pour les filtres
const voiceTypes = [
  'Soprano',
  'Mezzo-soprano',
  'Contralto',
  'Contre-ténor',
  'Ténor',
  'Baryton',
  'Basse',
  'Soprano dramatique'
];

const ArtistCard = ({ artist }: { artist: any }) => {
  const { photos, getPhotoUrl } = useArtistPhotos(artist.id);
  
  // Trouver la photo de profil ou prendre la première photo
  const profilePhoto = photos?.find(photo => photo.is_profile_photo) || photos?.[0];
  const imageUrl = profilePhoto ? getPhotoUrl(profilePhoto.file_path) : artist.profile_image_url;
  
  // Image par défaut si aucune photo
  const defaultImage = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=774&q=80';
  
  return (
    <div className="group rounded-xl overflow-hidden border border-border/50 bg-card shadow-sm transition-all duration-300 hover:shadow-md hover:border-border">
      <Link to={`/artistes/${artist.id}`} className="block relative aspect-[3/4] overflow-hidden">
        <img 
          src={imageUrl || defaultImage} 
          alt={artist.stage_name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = defaultImage;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4">
          <Button 
            size="sm" 
            className="mb-4 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white gap-2"
          >
            <PlayCircle className="h-4 w-4" />
            Écouter
          </Button>
        </div>
      </Link>
      <div className="p-4">
        <h3 className="font-serif font-semibold text-lg hover:text-lyrical-700 transition-colors">
          <Link to={`/artistes/${artist.id}`}>{artist.stage_name}</Link>
        </h3>
        <p className="text-muted-foreground text-sm">{artist.voice_type || 'Non spécifié'}</p>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-muted-foreground">
            {artist.repertoire && artist.repertoire.length > 0 
              ? artist.repertoire.slice(0, 2).join(', ') 
              : 'Répertoire à découvrir'
            }
          </p>
          <p className="text-xs text-muted-foreground">{artist.location || 'France'}</p>
        </div>
      </div>
    </div>
  );
};

const ArtistsList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedVoiceTypes, setSelectedVoiceTypes] = useState<string[]>([]);
  
  const { artists, isLoading, error } = useArtists();

  // Fonction pour filtrer les artistes
  const filteredArtists = artists.filter(artist => {
    // Filtrer par terme de recherche
    const searchMatch = artist.stage_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       (artist.voice_type && artist.voice_type.toLowerCase().includes(searchQuery.toLowerCase())) ||
                       (artist.location && artist.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
                       (artist.bio && artist.bio.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Filtrer par type de voix
    const voiceTypeMatch = selectedVoiceTypes.length === 0 || 
                          (artist.voice_type && selectedVoiceTypes.includes(artist.voice_type));
    
    return searchMatch && voiceTypeMatch;
  });

  // Gérer les changements de type de voix
  const handleVoiceTypeChange = (voiceType: string) => {
    setSelectedVoiceTypes(prev => 
      prev.includes(voiceType) 
        ? prev.filter(v => v !== voiceType) 
        : [...prev, voiceType]
    );
  };

  // Réinitialiser tous les filtres
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedVoiceTypes([]);
  };

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-serif font-bold mb-4">Erreur</h1>
          <p className="text-muted-foreground">Impossible de charger la liste des artistes.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* En-tête de la page */}
      <section className="bg-gradient-to-b from-muted to-background py-12 md:py-20">
        <div className="container mx-auto px-4 md:px-6">
          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4 text-center">
            Découvrez nos artistes lyriques
          </h1>
          <p className="text-center text-muted-foreground max-w-3xl mx-auto mb-10">
            Explorez notre communauté de chanteurs lyriques talentueux. Filtrez par type de voix 
            ou localisation pour trouver l'artiste parfait pour votre projet.
          </p>

          {/* Barre de recherche */}
          <div className="relative max-w-2xl mx-auto mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-lyrical-200/20 to-gold-200/20 rounded-lg blur"></div>
            <div className="relative bg-background/80 backdrop-blur-sm rounded-lg shadow-lg p-1">
              <div className="flex items-center">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Rechercher un artiste par nom, type de voix, localisation..."
                    className="w-full pl-10 pr-4 py-3 bg-transparent border-none focus:outline-none focus:ring-0"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setSearchQuery('')}
                      aria-label="Effacer la recherche"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <Button
                  variant="outline"
                  className="ml-2 flex items-center gap-2"
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                >
                  <Filter className="h-4 w-4" />
                  Filtres
                  {selectedVoiceTypes.length > 0 && (
                    <span className="bg-lyrical-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {selectedVoiceTypes.length}
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Panneau de filtres */}
          {isFilterOpen && (
            <div className="max-w-4xl mx-auto bg-card rounded-lg shadow-md border border-border p-6 mb-8 animate-fade-in">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-serif font-semibold text-lg">Filtres avancés</h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={resetFilters}
                  className="text-sm"
                >
                  Réinitialiser
                </Button>
              </div>

              <div>
                <h3 className="font-medium mb-3">Type de voix</h3>
                <div className="flex flex-wrap gap-2">
                  {voiceTypes.map(voiceType => (
                    <Button
                      key={voiceType}
                      variant={selectedVoiceTypes.includes(voiceType) ? "default" : "outline"}
                      size="sm"
                      className={selectedVoiceTypes.includes(voiceType) ? "bg-lyrical-600 hover:bg-lyrical-700" : ""}
                      onClick={() => handleVoiceTypeChange(voiceType)}
                    >
                      {voiceType}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Liste des artistes */}
      <section className="py-12">
        <div className="container mx-auto px-4 md:px-6">
          {/* Indicateur de chargement */}
          {isLoading && (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Chargement des artistes...</span>
            </div>
          )}

          {/* Résultats de recherche */}
          {!isLoading && (
            <div className="mb-8 flex justify-between items-center">
              <p className="text-muted-foreground">
                {filteredArtists.length} {filteredArtists.length === 1 ? 'artiste trouvé' : 'artistes trouvés'}
              </p>
            </div>
          )}

          {/* Grille d'artistes */}
          {!isLoading && filteredArtists.length === 0 ? (
            <div className="text-center py-20">
              <h3 className="text-xl font-serif font-semibold mb-2">Aucun artiste trouvé</h3>
              <p className="text-muted-foreground mb-6">
                {artists.length === 0 
                  ? "Aucun artiste n'est encore inscrit sur la plateforme."
                  : "Essayez de modifier vos critères de recherche ou de réinitialiser les filtres."
                }
              </p>
              {selectedVoiceTypes.length > 0 || searchQuery && (
                <Button onClick={resetFilters}>Réinitialiser les filtres</Button>
              )}
            </div>
          ) : (
            !isLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                {filteredArtists.map((artist, index) => (
                  <div 
                    key={artist.id}
                    className="text-appear"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <ArtistCard artist={artist} />
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </section>
    </Layout>
  );
};

export default ArtistsList;
