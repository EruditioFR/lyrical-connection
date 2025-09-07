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
    <section className="py-6">
      <div className="container mx-auto px-4">
        <div className="flex justify-center">
          {/* Ultra Simple Toggle */}
          <div className="inline-flex bg-muted rounded-full p-0.5">
            <button
              onClick={() => onSelectType('artist')}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-full transition-all duration-200",
                selectedType === 'artist' || !selectedType
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Artiste
            </button>
            <button
              onClick={() => onSelectType('professional')}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-full transition-all duration-200",
                selectedType === 'professional'
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Pro
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UserTypeSelector;