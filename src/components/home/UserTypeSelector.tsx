import React from 'react';
import { Button } from "@/components/ui/button";
import { Mic, Globe, ArrowLeft } from 'lucide-react';
import { cn } from "@/lib/utils";

interface UserTypeSelectorProps {
  selectedType: 'artist' | 'professional' | null;
  onSelectType: (type: 'artist' | 'professional') => void;
  onBack?: () => void;
}

const UserTypeSelector = ({ selectedType, onSelectType, onBack }: UserTypeSelectorProps) => {
  if (selectedType) {
    return (
      <div className="py-6 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="flex items-center space-x-2 text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Changer</span>
            </Button>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>Vous êtes :</span>
              <span className="font-semibold text-foreground">
                {selectedType === 'artist' ? 'Artiste' : 'Professionnel'}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="py-12 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-xl md:text-2xl font-serif font-bold mb-3">
            Quel est votre profil ?
          </h2>
          <p className="text-muted-foreground mb-8 text-base">
            Découvrez les fonctionnalités adaptées à vos besoins
          </p>
          
          {/* Toggle Switch */}
          <div className="inline-flex bg-muted rounded-xl p-1 max-w-sm mx-auto">
            <button
              onClick={() => onSelectType('artist')}
              className={cn(
                "flex-1 flex items-center justify-center px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                selectedType === 'artist' || !selectedType
                  ? "bg-white shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Mic className="h-4 w-4 mr-2" />
              Artiste
            </button>
            <button
              onClick={() => onSelectType('professional')}
              className={cn(
                "flex-1 flex items-center justify-center px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                selectedType === 'professional'
                  ? "bg-white shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Globe className="h-4 w-4 mr-2" />
              Professionnel
            </button>
          </div>
          
          <p className="text-xs text-muted-foreground mt-4">
            Choisissez votre profil pour voir les fonctionnalités dédiées
          </p>
        </div>
      </div>
    </section>
  );
};

export default UserTypeSelector;