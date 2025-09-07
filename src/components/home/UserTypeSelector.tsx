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
    <section className="py-8 bg-gradient-to-b from-muted/20 to-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-lg font-medium mb-6 text-foreground">
            Quel est votre profil ?
          </h2>
          
          {/* Modern Pill Toggle */}
          <div className="relative inline-flex bg-muted/80 rounded-full p-1 shadow-inner">
            {/* Sliding Pill Background */}
            <div 
              className={cn(
                "absolute top-1 h-[calc(100%-8px)] w-[calc(50%-4px)] bg-background rounded-full shadow-sm transition-all duration-300 ease-out",
                selectedType === 'professional' ? "translate-x-[calc(100%+4px)]" : "translate-x-0"
              )}
            />
            
            {/* Toggle Buttons */}
            <button
              onClick={() => onSelectType('artist')}
              className={cn(
                "relative z-10 px-6 py-2.5 text-sm font-medium transition-colors duration-200 rounded-full min-w-[100px]",
                selectedType === 'artist' || !selectedType
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Artiste
            </button>
            <button
              onClick={() => onSelectType('professional')}
              className={cn(
                "relative z-10 px-6 py-2.5 text-sm font-medium transition-colors duration-200 rounded-full min-w-[100px]",
                selectedType === 'professional'
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Professionnel
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UserTypeSelector;