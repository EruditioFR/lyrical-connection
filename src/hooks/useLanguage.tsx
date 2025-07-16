
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const useLanguage = () => {
  const { i18n } = useTranslation();

  useEffect(() => {
    // Update HTML lang attribute when language changes
    document.documentElement.lang = i18n.language;
    
    // Update document title based on language
    const titles = {
      fr: 'Lyrisphere - Découvrez les chanteurs lyriques',
      en: 'Lyrisphere - Discover Opera Singers',
      de: 'Lyrisphere - Entdecken Sie Opernsänger',
      it: 'Lyrisphere - Scopri i cantanti lirici',
      zh: 'Lyrisphere - 发现歌剧歌手',
      ko: 'Lyrisphere - 오페라 가수 발견'
    };
    
    document.title = titles[i18n.language as keyof typeof titles] || titles.fr;
  }, [i18n.language]);

  return {
    currentLanguage: i18n.language,
    changeLanguage: i18n.changeLanguage,
    isLanguageLoaded: i18n.isInitialized
  };
};
