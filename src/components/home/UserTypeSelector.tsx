import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, Globe, ArrowLeft, Clock } from 'lucide-react';
import { cn } from "@/lib/utils";

interface UserTypeSelectorProps {
  selectedType: 'artist' | 'professional' | null;
  onSelectType: (type: 'artist' | 'professional') => void;
  onBack?: () => void;
}

const UserTypeSelector = ({ selectedType, onSelectType, onBack }: UserTypeSelectorProps) => {

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
            <div className="relative px-6 py-3 text-base font-medium rounded-full min-w-[120px] text-muted-foreground/60 cursor-not-allowed flex items-center justify-center gap-2">
              Professionnel
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 bg-muted text-muted-foreground">
                <Clock className="h-2.5 w-2.5 mr-0.5" />
                Prochainement
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UserTypeSelector;