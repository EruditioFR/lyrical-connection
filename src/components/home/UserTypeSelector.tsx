import React from 'react';
import { Button } from "@/components/ui/button";
import { Mic, Globe, ArrowLeft } from 'lucide-react';

interface UserTypeSelectorProps {
  selectedType: 'artist' | 'professional' | null;
  onSelectType: (type: 'artist' | 'professional') => void;
  onBack?: () => void;
}

const UserTypeSelector = ({ selectedType, onSelectType, onBack }: UserTypeSelectorProps) => {
  if (selectedType) {
    return (
      <div className="py-8 bg-muted/50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Changer de profil</span>
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
    <section className="py-16 bg-gradient-to-b from-muted/50 to-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-serif font-bold mb-4">
            Quel est votre profil ?
          </h2>
          <p className="text-muted-foreground mb-12 text-lg">
            Découvrez les fonctionnalités adaptées à vos besoins
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Artist Card */}
            <Button
              variant="outline"
              className="h-auto p-8 border-2 hover:border-lyrical-200 hover:bg-lyrical-50/50 transition-all duration-300 group"
              onClick={() => onSelectType('artist')}
            >
              <div className="text-center space-y-4">
                <div className="bg-lyrical-100 p-4 rounded-xl inline-block group-hover:bg-lyrical-200 transition-colors">
                  <Mic className="h-8 w-8 text-lyrical-700" />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-semibold mb-2">Je suis un Artiste</h3>
                  <p className="text-sm text-muted-foreground">
                    Chanteur lyrique, étudiant en chant, ou artiste professionnel
                  </p>
                </div>
              </div>
            </Button>

            {/* Professional Card */}
            <Button
              variant="outline"
              className="h-auto p-8 border-2 hover:border-gold-200 hover:bg-gold-50/50 transition-all duration-300 group"
              onClick={() => onSelectType('professional')}
            >
              <div className="text-center space-y-4">
                <div className="bg-gold-100 p-4 rounded-xl inline-block group-hover:bg-gold-200 transition-colors">
                  <Globe className="h-8 w-8 text-gold-700" />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-semibold mb-2">Je suis un Professionnel</h3>
                  <p className="text-sm text-muted-foreground">
                    Directeur artistique, agent, organisateur d'événements
                  </p>
                </div>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UserTypeSelector;