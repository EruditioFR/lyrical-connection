
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Upload, FileText } from 'lucide-react';
import { TranslationKey, Translation } from '@/hooks/useTranslations';
import { useToast } from '@/hooks/use-toast';

interface ImportExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  translationKeys: TranslationKey[];
  translations: Translation[];
}

export const ImportExportDialog: React.FC<ImportExportDialogProps> = ({
  open,
  onOpenChange,
  translationKeys,
  translations,
}) => {
  const [exportData, setExportData] = useState('');
  const [importData, setImportData] = useState('');
  const { toast } = useToast();

  const generateExportData = () => {
    const data = {
      keys: translationKeys,
      translations: translations,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };
    
    const jsonData = JSON.stringify(data, null, 2);
    setExportData(jsonData);
  };

  const downloadExport = () => {
    if (!exportData) {
      generateExportData();
      return;
    }

    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `translations-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Export terminé",
      description: "Le fichier de traductions a été téléchargé.",
    });
  };

  const handleImport = () => {
    try {
      const data = JSON.parse(importData);
      
      // Validation basique
      if (!data.keys || !data.translations) {
        throw new Error('Format de données invalide');
      }

      // TODO: Implémenter l'import réel
      toast({
        title: "Fonctionnalité en cours de développement",
        description: "L'import de traductions sera bientôt disponible.",
      });
    } catch (error) {
      toast({
        title: "Erreur d'import",
        description: "Le format des données n'est pas valide.",
        variant: "destructive",
      });
    }
  };

  const generateI18nFile = () => {
    // Générer le fichier i18n compatible avec react-i18next
    const languages = ['en', 'de', 'it', 'zh', 'ko'];
    const i18nData: any = {
      fr: {},
    };

    // Ajouter les langues
    languages.forEach(lang => {
      i18nData[lang] = {};
    });

    // Organiser les traductions par structure hiérarchique
    translationKeys.forEach(key => {
      const pathParts = key.key_path.split('.');
      
      // Créer la structure pour le français
      let frenchObj = i18nData.fr;
      for (let i = 0; i < pathParts.length - 1; i++) {
        if (!frenchObj[pathParts[i]]) {
          frenchObj[pathParts[i]] = {};
        }
        frenchObj = frenchObj[pathParts[i]];
      }
      frenchObj[pathParts[pathParts.length - 1]] = key.french_text;

      // Créer la structure pour les autres langues
      languages.forEach(lang => {
        const translation = translations.find(t => t.key_id === key.id && t.language_code === lang);
        if (translation) {
          let langObj = i18nData[lang];
          for (let i = 0; i < pathParts.length - 1; i++) {
            if (!langObj[pathParts[i]]) {
              langObj[pathParts[i]] = {};
            }
            langObj = langObj[pathParts[i]];
          }
          langObj[pathParts[pathParts.length - 1]] = translation.translated_text;
        }
      });
    });

    const i18nFileContent = `import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

const resources = ${JSON.stringify(i18nData, null, 2)};

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fr',
    debug: false,
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },

    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: false,
    },
  });

export default i18n;`;

    const blob = new Blob([i18nFileContent], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'i18n-generated.ts';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Fichier i18n généré",
      description: "Le fichier i18n a été téléchargé et peut remplacer le fichier actuel.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Import / Export des traductions</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="export" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="export">Export</TabsTrigger>
            <TabsTrigger value="import">Import</TabsTrigger>
            <TabsTrigger value="i18n">Générer i18n</TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Exportez toutes les clés de traduction et leurs traductions au format JSON.
              </p>
              <div className="flex gap-2">
                <Button onClick={generateExportData} variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Générer l'export
                </Button>
                <Button onClick={downloadExport} disabled={!exportData}>
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger
                </Button>
              </div>
            </div>
            
            {exportData && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Données d'export:</label>
                <Textarea
                  value={exportData}
                  readOnly
                  className="h-64 font-mono text-xs"
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="import" className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Importez des traductions depuis un fichier JSON exporté précédemment.
              </p>
              <label className="text-sm font-medium">Données à importer:</label>
              <Textarea
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                className="h-64 font-mono text-xs"
                placeholder="Collez le contenu JSON ici..."
              />
            </div>
            
            <DialogFooter>
              <Button onClick={handleImport} disabled={!importData}>
                <Upload className="h-4 w-4 mr-2" />
                Importer
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="i18n" className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Générez un fichier i18n compatible avec react-i18next basé sur les traductions actuelles.
              </p>
              <p className="text-xs text-amber-600">
                ⚠️ Ce fichier peut remplacer votre fichier src/i18n/index.ts actuel
              </p>
              <Button onClick={generateI18nFile}>
                <Download className="h-4 w-4 mr-2" />
                Générer et télécharger le fichier i18n
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
