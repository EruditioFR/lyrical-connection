
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const useLanguage = () => {
  const { i18n } = useTranslation();

  useEffect(() => {
    // Update HTML lang attribute when language changes
    document.documentElement.lang = i18n.language;
    
    // Update document title based on language
    const titles = {
      fr: 'Lyrical Connection - Découvrez les chanteurs lyriques',
      en: 'Lyrical Connection - Discover Opera Singers',
      de: 'Lyrical Connection - Entdecken Sie Opernsänger',
      it: 'Lyrical Connection - Scopri i cantanti lirici',
      zh: 'Lyrical Connection - 发现歌剧歌手',
      ko: 'Lyrical Connection - 오페라 가수 발견'
    };
    
    document.title = titles[i18n.language as keyof typeof titles] || titles.fr;
  }, [i18n.language]);

  return {
    currentLanguage: i18n.language,
    changeLanguage: i18n.changeLanguage,
    isLanguageLoaded: i18n.isInitialized
  };
};
