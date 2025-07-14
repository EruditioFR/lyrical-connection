
import { supabase } from '@/integrations/supabase/client';

// Fonction pour extraire toutes les clés de traduction du fichier i18n
export const extractTranslationKeys = (obj: any, prefix = '', section = 'common'): Array<{ key_path: string; french_text: string; section: string; context?: string }> => {
  const keys: Array<{ key_path: string; french_text: string; section: string; context?: string }> = [];
  
  const traverse = (current: any, currentPrefix: string, currentSection: string) => {
    for (const [key, value] of Object.entries(current)) {
      const fullKey = currentPrefix ? `${currentPrefix}.${key}` : key;
      
      if (typeof value === 'string') {
        keys.push({
          key_path: fullKey,
          french_text: value,
          section: currentSection,
          context: getContextForKey(fullKey, currentSection)
        });
      } else if (typeof value === 'object' && value !== null) {
        // Si on est au premier niveau (comme 'home', 'navigation'), c'est une nouvelle section
        const newSection = currentPrefix === '' ? key : currentSection;
        traverse(value, fullKey, newSection);
      }
    }
  };
  
  traverse(obj, prefix, section);
  return keys;
};

// Fonction pour ajouter du contexte aux clés de traduction
const getContextForKey = (keyPath: string, section: string): string | undefined => {
  const contextMap: Record<string, string> = {
    'home.hero.title': 'Titre principal de la page d\'accueil',
    'home.hero.subtitle': 'Sous-titre explicatif sur la page d\'accueil',
    'home.features.title': 'Titre de la section fonctionnalités',
    'home.pricing.title': 'Titre de la section tarifs',
    'navigation.home': 'Lien de navigation vers l\'accueil',
    'navigation.artists': 'Lien de navigation vers les artistes',
    'navigation.login': 'Bouton de connexion',
    'navigation.register': 'Bouton d\'inscription',
    'common.loading': 'Message affiché pendant le chargement',
    'common.error': 'Message d\'erreur générique',
    'common.save': 'Bouton pour sauvegarder',
    'common.cancel': 'Bouton pour annuler une action'
  };
  
  return contextMap[keyPath] || `Texte de la section ${section}`;
};

// Fonction pour synchroniser les traductions avec la base de données
export const syncTranslationsToDatabase = async (frenchTranslations: any) => {
  try {
    const translationKeys = extractTranslationKeys(frenchTranslations);
    console.log('Clés de traduction extraites:', translationKeys.length);
    
    // Vérifier les clés existantes
    const { data: existingKeys } = await supabase
      .from('translation_keys')
      .select('key_path');
    
    const existingKeyPaths = new Set(existingKeys?.map(k => k.key_path) || []);
    
    // Filtrer les nouvelles clés à ajouter
    const newKeys = translationKeys.filter(key => !existingKeyPaths.has(key.key_path));
    
    if (newKeys.length > 0) {
      console.log('Nouvelles clés à ajouter:', newKeys.length);
      
      // Insérer les nouvelles clés par lots de 50
      const batchSize = 50;
      for (let i = 0; i < newKeys.length; i += batchSize) {
        const batch = newKeys.slice(i, i + batchSize);
        const { error } = await supabase
          .from('translation_keys')
          .insert(batch);
        
        if (error) {
          console.error('Erreur lors de l\'insertion du lot:', error);
          throw error;
        }
      }
      
      return { success: true, added: newKeys.length, total: translationKeys.length };
    } else {
      return { success: true, added: 0, total: translationKeys.length };
    }
  } catch (error) {
    console.error('Erreur lors de la synchronisation:', error);
    throw error;
  }
};
