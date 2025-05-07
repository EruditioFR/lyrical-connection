import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from "@/components/ui/button";
import { PlayCircle, Search, Filter, X } from 'lucide-react';

// Données exemple pour la liste des artistes
const artistsData = [
  {
    id: '1',
    name: 'Sophia Laurent',
    voiceType: 'Soprano',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1961&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    specialty: 'Opéra classique',
    location: 'Paris, France',
    featured: true
  },
  {
    id: '2',
    name: 'Alexandre Dupont',
    voiceType: 'Ténor',
    image: 'https://images.unsplash.com/photo-1552642986-ccb41e7059e7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
    specialty: 'Opéra romantique',
    location: 'Lyon, France',
    featured: true
  },
  {
    id: '3',
    name: 'Isabelle Moreau',
    voiceType: 'Mezzo-soprano',
    image: 'https://images.unsplash.com/photo-1553267751-1c148a7280a1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
    specialty: 'Opéra baroque',
    location: 'Bordeaux, France',
    featured: false
  },
  {
    id: '4',
    name: 'Jean-Michel Bernard',
    voiceType: 'Baryton',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
    specialty: 'Opéra contemporain',
    location: 'Marseille, France',
    featured: false
  },
  {
    id: '5',
    name: 'Marie Leclerc',
    voiceType: 'Soprano dramatique',
    image: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    specialty: 'Wagner, Strauss',
    location: 'Strasbourg, France',
    featured: false
  },
  {
    id: '6',
    name: 'Luc Renaud',
    voiceType: 'Basse',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
    specialty: 'Opéra russe, oratorio',
    location: 'Lille, France',
    featured: false
  },
  {
    id: '7',
    name: 'Emma Durand',
    voiceType: 'Contralto',
    image: 'https://images.unsplash.com/photo-1554727242-741c14fa561c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
    specialty: 'Opéra français',
    location: 'Toulouse, France',
    featured: false
  },
  {
    id: '8',
    name: 'Paul Martin',
    voiceType: 'Contre-ténor',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
    specialty: 'Musique baroque',
    location: 'Nantes, France',
    featured: false
  }
];

// Types de voix pour les filtres
const voiceTypes = [
  'Soprano',
  'Mezzo-soprano',
  'Contralto',
  'Contre-ténor',
  'Ténor',
  'Baryton',
  'Basse'
];

// Spécialités pour les filtres
const specialties = [
  'Opéra classique',
  'Opéra romantique',
  'Opéra baroque',
  'Opéra contemporain',
  'Opéra français',
  'Musique baroque',
  'Opéra russe',
  'Wagner, Strauss'
];

const ArtistsList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedVoiceTypes, setSelectedVoiceTypes] = useState<string[]>([]);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);

  // Fonction pour filtrer les artistes
  const filteredArtists = artistsData.filter(artist => {
    // Filtrer par terme de recherche
    const searchMatch = artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       artist.voiceType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       artist.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       artist.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filtrer par type de voix
    const voiceTypeMatch = selectedVoiceTypes.length === 0 || selectedVoiceTypes.includes(artist.voiceType);
    
    // Filtrer par spécialité
    const specialtyMatch = selectedSpecialties.length === 0 || selectedSpecialties.includes(artist.specialty);
    
    return searchMatch && voiceTypeMatch && specialtyMatch;
  });

  // Gérer les changements de type de voix
  const handleVoiceTypeChange = (voiceType: string) => {
    setSelectedVoiceTypes(prev => 
      prev.includes(voiceType) 
        ? prev.filter(v => v !== voiceType) 
        : [...prev, voiceType]
    );
  };

  // Gérer les changements de spécialité
  const handleSpecialtyChange = (specialty: string) => {
    setSelectedSpecialties(prev => 
      prev.includes(specialty) 
        ? prev.filter(s => s !== specialty) 
        : [...prev, specialty]
    );
  };

  // Réinitialiser tous les filtres
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedVoiceTypes([]);
    setSelectedSpecialties([]);
  };

  return (
    <Layout>
      {/* En-tête de la page */}
      <section className="bg-gradient-to-b from-muted to-background py-12 md:py-20">
        <div className="container mx-auto px-4 md:px-6">
          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4 text-center">
            Découvrez nos artistes lyriques
          </h1>
          <p className="text-center text-muted-foreground max-w-3xl mx-auto mb-10">
            Explorez notre communauté de chanteurs lyriques talentueux. Filtrez par type de voix, 
            spécialité ou localisation pour trouver l'artiste parfait pour votre projet.
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
                    placeholder="Rechercher un artiste par nom, type de voix, spécialité..."
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
                  {(selectedVoiceTypes.length > 0 || selectedSpecialties.length > 0) && (
                    <span className="bg-lyrical-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {selectedVoiceTypes.length + selectedSpecialties.length}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Filtres de type de voix */}
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

                {/* Filtres de spécialité */}
                <div>
                  <h3 className="font-medium mb-3">Spécialité</h3>
                  <div className="flex flex-wrap gap-2">
                    {specialties.map(specialty => (
                      <Button
                        key={specialty}
                        variant={selectedSpecialties.includes(specialty) ? "default" : "outline"}
                        size="sm"
                        className={selectedSpecialties.includes(specialty) ? "bg-lyrical-600 hover:bg-lyrical-700" : ""}
                        onClick={() => handleSpecialtyChange(specialty)}
                      >
                        {specialty}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Liste des artistes */}
      <section className="py-12">
        <div className="container mx-auto px-4 md:px-6">
          {/* Résultats de recherche */}
          <div className="mb-8 flex justify-between items-center">
            <p className="text-muted-foreground">
              {filteredArtists.length} {filteredArtists.length === 1 ? 'artiste trouvé' : 'artistes trouvés'}
            </p>
            <div className="flex gap-3">
              <Button variant="ghost" size="sm" className="hidden md:flex">
                Trier par : Popularité
              </Button>
            </div>
          </div>

          {/* Grille d'artistes */}
          {filteredArtists.length === 0 ? (
            <div className="text-center py-20">
              <h3 className="text-xl font-serif font-semibold mb-2">Aucun artiste trouvé</h3>
              <p className="text-muted-foreground mb-6">
                Essayez de modifier vos critères de recherche ou de réinitialiser les filtres.
              </p>
              <Button onClick={resetFilters}>Réinitialiser les filtres</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
              {filteredArtists.map((artist, index) => (
                <div 
                  key={artist.id}
                  className={`group rounded-xl overflow-hidden border border-border/50 bg-card shadow-sm transition-all duration-300 hover:shadow-md hover:border-border text-appear`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img 
                      src={artist.image} 
                      alt={artist.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
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
                    {artist.featured && (
                      <div className="absolute top-3 right-3 bg-gold-500/90 text-white text-xs font-medium py-1 px-2 rounded-full">
                        En vedette
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-serif font-semibold text-lg hover:text-lyrical-700 transition-colors">
                      <Link to={`/artistes/${artist.id}`}>{artist.name}</Link>
                    </h3>
                    <p className="text-muted-foreground text-sm">{artist.voiceType}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-muted-foreground">{artist.specialty}</p>
                      <p className="text-xs text-muted-foreground">{artist.location}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default ArtistsList;
