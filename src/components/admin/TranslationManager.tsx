import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, Download, Upload, Sparkles } from 'lucide-react';
import { TranslationTable } from './TranslationTable';
import { TranslationSuggestions } from './TranslationSuggestions';
import { ImportExportDialog } from './ImportExportDialog';
import { CreateTranslationKeyDialog } from './CreateTranslationKeyDialog';
import { TranslationSyncPanel } from './TranslationSyncPanel';
import { useTranslationKeys, useTranslations, useTranslationSuggestions } from '@/hooks/useTranslations';

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'Anglais', flag: '🇬🇧' },
  { code: 'de', name: 'Allemand', flag: '🇩🇪' },
  { code: 'it', name: 'Italien', flag: '🇮🇹' },
  { code: 'zh', name: 'Chinois', flag: '🇨🇳' },
  { code: 'ko', name: 'Coréen', flag: '🇰🇷' },
];

export const TranslationManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showImportExportDialog, setShowImportExportDialog] = useState(false);

  const { data: translationKeys = [], isLoading: keysLoading, refetch: refetchKeys } = useTranslationKeys();
  const { data: translations = [], isLoading: translationsLoading } = useTranslations();
  const { data: suggestions = [], isLoading: suggestionsLoading } = useTranslationSuggestions();

  // Calculer les statistiques
  const stats = useMemo(() => {
    const totalKeys = translationKeys.length;
    const totalTranslations = totalKeys * SUPPORTED_LANGUAGES.length;
    const completedTranslations = translations.length;
    const completionPercentage = totalKeys > 0 ? (completedTranslations / totalTranslations) * 100 : 0;

    const languageStats = SUPPORTED_LANGUAGES.map(lang => {
      const langTranslations = translations.filter(t => t.language_code === lang.code);
      const completion = totalKeys > 0 ? (langTranslations.length / totalKeys) * 100 : 0;
      return {
        ...lang,
        completed: langTranslations.length,
        total: totalKeys,
        percentage: completion,
      };
    });

    return {
      totalKeys,
      totalTranslations,
      completedTranslations,
      completionPercentage,
      languageStats,
      pendingSuggestions: suggestions.length,
    };
  }, [translationKeys, translations, suggestions]);

  // Filtrer les clés
  const filteredKeys = useMemo(() => {
    return translationKeys.filter(key => {
      const matchesSearch = searchTerm === '' || 
        key.key_path.toLowerCase().includes(searchTerm.toLowerCase()) ||
        key.french_text.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSection = selectedSection === 'all' || key.section === selectedSection;
      
      return matchesSearch && matchesSection;
    });
  }, [translationKeys, searchTerm, selectedSection]);

  // Obtenir les sections uniques
  const sections = useMemo(() => {
    const uniqueSections = [...new Set(translationKeys.map(key => key.section))];
    return uniqueSections.sort();
  }, [translationKeys]);

  if (keysLoading || translationsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Chargement des traductions...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.totalKeys}</div>
            <div className="text-sm text-muted-foreground">Clés de traduction</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.completedTranslations}</div>
            <div className="text-sm text-muted-foreground">Traductions complétées</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{Math.round(stats.completionPercentage)}%</div>
            <div className="text-sm text-muted-foreground">Taux de completion</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{stats.pendingSuggestions}</div>
            <div className="text-sm text-muted-foreground">Suggestions en attente</div>
          </CardContent>
        </Card>
      </div>

      {/* Progression par langue */}
      <Card>
        <CardHeader>
          <CardTitle>Progression par langue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {stats.languageStats.map(lang => (
              <div key={lang.code} className="text-center">
                <div className="text-2xl mb-2">{lang.flag}</div>
                <div className="font-medium">{lang.name}</div>
                <div className="text-sm text-muted-foreground">
                  {lang.completed}/{lang.total}
                </div>
                <div className="mt-2 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${lang.percentage}%` }}
                  />
                </div>
                <div className="text-xs mt-1">{Math.round(lang.percentage)}%</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Onglets principaux */}
      <Tabs defaultValue="translations" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="translations">Traductions</TabsTrigger>
          <TabsTrigger value="suggestions" className="relative">
            Suggestions IA
            {stats.pendingSuggestions > 0 && (
              <Badge variant="destructive" className="ml-2 text-xs">
                {stats.pendingSuggestions}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="sync">Synchronisation</TabsTrigger>
        </TabsList>

        <TabsContent value="translations" className="space-y-4">
          {/* Barre d'outils */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex flex-1 gap-4 items-center">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Rechercher une clé ou un texte..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <select
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    className="px-3 py-2 border rounded-md"
                  >
                    <option value="all">Toutes les sections</option>
                    {sections.map(section => (
                      <option key={section} value={section}>{section}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowImportExportDialog(true)}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Import/Export
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setShowCreateDialog(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nouvelle clé
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tableau des traductions */}
          <TranslationTable
            translationKeys={filteredKeys}
            translations={translations}
            supportedLanguages={SUPPORTED_LANGUAGES}
          />
        </TabsContent>

        <TabsContent value="suggestions">
          <TranslationSuggestions
            suggestions={suggestions}
            translationKeys={translationKeys}
            supportedLanguages={SUPPORTED_LANGUAGES}
          />
        </TabsContent>

        <TabsContent value="sync">
          <TranslationSyncPanel />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CreateTranslationKeyDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        sections={sections}
      />

      <ImportExportDialog
        open={showImportExportDialog}
        onOpenChange={setShowImportExportDialog}
        translationKeys={translationKeys}
        translations={translations}
      />
    </div>
  );
};
