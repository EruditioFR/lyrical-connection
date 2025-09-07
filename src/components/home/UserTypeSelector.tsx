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
    <section className="py-8 bg-muted/10 border-y border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex justify-center">
          {/* Toggle plus visible */}
          <div className="inline-flex bg-muted/80 rounded-full p-1 shadow-sm border border-border/30">
            <button
              onClick={() => onSelectType('artist')}
              className={cn(
                "px-6 py-3 text-base font-medium rounded-full transition-all duration-200 min-w-[120px]",
                selectedType === 'artist' || !selectedType
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              Artiste
            </button>
            <button
              onClick={() => onSelectType('professional')}
              className={cn(
                "px-6 py-3 text-base font-medium rounded-full transition-all duration-200 min-w-[120px]",
                selectedType === 'professional'
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
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