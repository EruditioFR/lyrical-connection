
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Sparkles } from 'lucide-react';
import { TranslationSuggestion, TranslationKey, useAcceptSuggestion } from '@/hooks/useTranslations';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface TranslationSuggestionsProps {
  suggestions: TranslationSuggestion[];
  translationKeys: TranslationKey[];
  supportedLanguages: Array<{
    code: string;
    name: string;
    flag: string;
  }>;
}

export const TranslationSuggestions: React.FC<TranslationSuggestionsProps> = ({
  suggestions,
  translationKeys,
  supportedLanguages,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const acceptSuggestion = useAcceptSuggestion();

  const getLanguageInfo = (code: string) => {
    return supportedLanguages.find(lang => lang.code === code);
  };

  const getTranslationKey = (keyId: string) => {
    return translationKeys.find(key => key.id === keyId);
  };

  const handleRejectSuggestion = async (suggestionId: string) => {
    try {
      const { error } = await supabase
        .from('translation_suggestions')
        .update({ status: 'rejected' })
        .eq('id', suggestionId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['translation-suggestions'] });
      toast({
        title: "Suggestion rejetée",
        description: "La suggestion a été marquée comme rejetée.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de rejeter la suggestion.",
        variant: "destructive",
      });
    }
  };

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return 'bg-gray-200';
    if (confidence >= 0.8) return 'bg-green-500';
    if (confidence >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getConfidenceLabel = (confidence?: number) => {
    if (!confidence) return 'Inconnue';
    if (confidence >= 0.8) return 'Élevée';
    if (confidence >= 0.6) return 'Moyenne';
    return 'Faible';
  };

  if (suggestions.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Aucune suggestion en attente</h3>
          <p className="text-gray-500">
            Les suggestions de traduction générées par l'IA apparaîtront ici.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">
          Suggestions de traduction ({suggestions.length})
        </h3>
        <Badge variant="outline">
          <Sparkles className="h-3 w-3 mr-1" />
          Générées par IA
        </Badge>
      </div>

      {suggestions.map((suggestion) => {
        const key = getTranslationKey(suggestion.key_id);
        const languageInfo = getLanguageInfo(suggestion.language_code);

        if (!key || !languageInfo) return null;

        return (
          <Card key={suggestion.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">{key.key_path}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Section: {key.section}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <div 
                      className={`w-2 h-2 rounded-full ${getConfidenceColor(suggestion.ai_confidence)}`}
                    />
                    <span className="text-xs text-gray-600">
                      Confiance: {getConfidenceLabel(suggestion.ai_confidence)}
                    </span>
                  </div>
                  {suggestion.ai_confidence && (
                    <Badge variant="secondary" className="text-xs">
                      {Math.round(suggestion.ai_confidence * 100)}%
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {/* Texte original en français */}
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🇫🇷</span>
                  <span className="font-medium">Français (original)</span>
                </div>
                <p className="text-sm">{key.french_text}</p>
              </div>

              {/* Suggestion de traduction */}
              <div className="mb-4 p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{languageInfo.flag}</span>
                  <span className="font-medium">{languageInfo.name} (suggestion IA)</span>
                  <Badge variant="outline" className="text-xs">
                    <Sparkles className="h-3 w-3 mr-1" />
                    IA
                  </Badge>
                </div>
                <p className="text-sm font-medium">{suggestion.suggested_text}</p>
              </div>

              {/* Contexte utilisé */}
              {suggestion.context_used && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Contexte fourni à l'IA:</p>
                  <p className="text-xs italic">{suggestion.context_used}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => acceptSuggestion.mutate(suggestion.id)}
                  disabled={acceptSuggestion.isPending}
                  className="flex-1"
                >
                  <Check className="h-3 w-3 mr-2" />
                  Accepter
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRejectSuggestion(suggestion.id)}
                  className="flex-1"
                >
                  <X className="h-3 w-3 mr-2" />
                  Rejeter
                </Button>
              </div>

              {/* Métadonnées */}
              <div className="mt-3 pt-3 border-t text-xs text-gray-500">
                Créé le {new Date(suggestion.created_at).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
