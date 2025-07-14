
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Check, X, Edit, Sparkles, Copy } from 'lucide-react';
import { TranslationKey, Translation, useUpdateTranslation } from '@/hooks/useTranslations';
import { useToast } from '@/hooks/use-toast';

interface TranslationTableProps {
  translationKeys: TranslationKey[];
  translations: Translation[];
  supportedLanguages: Array<{
    code: string;
    name: string;
    flag: string;
  }>;
}

export const TranslationTable: React.FC<TranslationTableProps> = ({
  translationKeys,
  translations,
  supportedLanguages,
}) => {
  const [editingCell, setEditingCell] = useState<{ keyId: string; language: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const { toast } = useToast();

  const updateTranslation = useUpdateTranslation();

  // Obtenir la traduction pour une clé et une langue donnée
  const getTranslation = (keyId: string, languageCode: string): Translation | undefined => {
    return translations.find(t => t.key_id === keyId && t.language_code === languageCode);
  };

  const handleStartEdit = (keyId: string, language: string) => {
    const translation = getTranslation(keyId, language);
    setEditValue(translation?.translated_text || '');
    setEditingCell({ keyId, language });
  };

  const handleSaveEdit = async () => {
    if (!editingCell) return;

    try {
      await updateTranslation.mutateAsync({
        keyId: editingCell.keyId,
        languageCode: editingCell.language,
        translatedText: editValue,
        isReviewed: true,
      });
      setEditingCell(null);
      setEditValue('');
    } catch (error) {
      console.error('Error saving translation:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const handleCopyFromFrench = (keyId: string, language: string) => {
    const key = translationKeys.find(k => k.id === keyId);
    if (key) {
      setEditValue(key.french_text);
      setEditingCell({ keyId, language });
    }
  };

  const handleAITranslate = async (keyId: string, language: string) => {
    // TODO: Implémenter l'appel à l'API IA
    toast({
      title: "Fonctionnalité en cours de développement",
      description: "La traduction automatique par IA sera bientôt disponible.",
    });
  };

  const isEditing = (keyId: string, language: string) => {
    return editingCell?.keyId === keyId && editingCell?.language === language;
  };

  return (
    <div className="space-y-4">
      {translationKeys.map((key) => (
        <Card key={key.id} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">{key.key_path}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Section: {key.section}
                </p>
              </div>
              <Badge variant="outline">{key.section}</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {/* Texte français (référence) */}
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🇫🇷</span>
                <span className="font-medium">Français (référence)</span>
              </div>
              <p className="text-sm">{key.french_text}</p>
              {key.context && (
                <p className="text-xs text-gray-600 mt-2 italic">
                  Contexte: {key.context}
                </p>
              )}
            </div>

            {/* Traductions dans les autres langues */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {supportedLanguages.map((lang) => {
                const translation = getTranslation(key.id, lang.code);
                const editing = isEditing(key.id, lang.code);

                return (
                  <div key={lang.code} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{lang.flag}</span>
                        <span className="font-medium">{lang.name}</span>
                        {translation && (
                          <div className="flex gap-1">
                            {translation.is_ai_generated && (
                              <Badge variant="secondary" className="text-xs">
                                <Sparkles className="h-3 w-3 mr-1" />
                                IA
                              </Badge>
                            )}
                            {translation.is_reviewed && (
                              <Badge variant="default" className="text-xs">
                                <Check className="h-3 w-3 mr-1" />
                                Révisé
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCopyFromFrench(key.id, lang.code)}
                          title="Copier depuis le français"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleAITranslate(key.id, lang.code)}
                          title="Traduire avec l'IA"
                        >
                          <Sparkles className="h-3 w-3" />
                        </Button>
                        {!editing && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleStartEdit(key.id, lang.code)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {editing ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          placeholder="Entrez la traduction..."
                          className="min-h-[80px]"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={handleSaveEdit}
                            disabled={updateTranslation.isPending}
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Sauvegarder
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelEdit}
                          >
                            <X className="h-3 w-3 mr-1" />
                            Annuler
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="min-h-[60px] flex items-center">
                        {translation ? (
                          <p className="text-sm">{translation.translated_text}</p>
                        ) : (
                          <p className="text-sm text-gray-400 italic">
                            Traduction manquante
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}

      {translationKeys.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">Aucune clé de traduction trouvée.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
