import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

const resources = {
  fr: {
    common: {
      loading: 'Chargement...',
      error: 'Erreur', 
      save: 'Enregistrer',
      cancel: 'Annuler',
      delete: 'Supprimer',
      edit: 'Modifier',
      create: 'Créer',
      search: 'Rechercher',
      filter: 'Filtrer',
      close: 'Fermer',
      back: 'Retour',
      next: 'Suivant',
      previous: 'Précédent',
      yes: 'Oui',
      no: 'Non',
      submit: 'Valider'
    },
    navigation: {
      home: 'Accueil',
      artists: 'Artistes',
      castings: 'Castings',
      events: 'Événements',  
      pricing: 'Tarifs',
      about: 'Qui sommes-nous',
      contact: 'Contact',
      profile: 'Mon Profil',
      logout: 'Déconnexion',
      login: 'Se connecter',
      register: "S'inscrire",
      search: 'Recherche avancée',
      myEvents: 'Mes Événements',
      admin: 'Administration'
    },
    home: {
      hero: {
        title: 'Le réseau mondial dédié au chant lyrique',
        subtitle: 'La première plateforme dédiée aux chanteurs lyriques et aux professionnels de l\'opéra. Créez votre profil, découvrez des opportunités et développez votre carrière.',
        createProfile: 'Créer mon profil',
        discoverArtists: 'Découvrir les artistes',
        tagline: 'Artistes, professionnels, opportunités. Tout l\'univers lyrique réuni.'
      },
      features: {
        title: 'Une plateforme pensée pour tous les acteurs du lyrique',
        subtitle: 'Découvrez comment Lyrisphere révolutionne la façon dont les artistes et les professionnels interagissent dans le monde de l\'opéra',
        artists: {
          title: 'Pour les Artistes',
          subtitle: 'Développez votre carrière avec des outils professionnels de promotion et de networking',
          cta: 'Créer mon profil artiste'
        },
        professionals: {
          title: 'Pour les Professionnels',
          subtitle: 'Trouvez les talents qui correspondent exactement à vos besoins artistiques',
          cta: 'Accéder à l\'espace pro'
        }
      },
      featuredArtists: {
        title: 'Artistes en vedette',
        subtitle: 'Découvrez les artistes lyriques les plus prometteurs de notre plateforme.',
        viewAll: 'Voir tous les artistes',
        listen: 'Écouter',
        featured: 'En vedette',
        becomeArtist: {
          title: 'Vous êtes artiste lyrique ?',
          subtitle: 'Rejoignez notre communauté d\'artistes et mettez en valeur votre talent auprès de professionnels du milieu lyrique.',
          createProfile: 'Créer mon profil',
          guide: 'Guide pour les artistes'
        }
      },
      pricing: {
        title: 'Choisissez le plan qui vous correspond',
        subtitle: 'Des tarifs adaptés à vos besoins, que vous soyez artiste ou professionnel',
        monthly: 'mois',
        noCommitment: 'Sans engagement • Résiliation à tout moment',
        contact: 'Nous contacter',
        faq: 'Questions fréquentes'
      },
      cta: {
        title: 'Prêt à rejoindre la communauté de la musique lyrique ?',
        subtitle: 'Que vous soyez artiste ou professionnel, Lyrisphere vous offre les outils nécessaires pour faire avancer votre carrière.',
        createAccount: 'Créer un compte',
        viewPlans: 'Voir les abonnements'
      }
    }
  },
  en: {
    common: {
      loading: 'Loading...',
      error: 'Error',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      search: 'Search',
      filter: 'Filter',
      close: 'Close',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      yes: 'Yes',
      no: 'No',
      submit: 'Submit'
    },
    navigation: {
      home: 'Home',
      artists: 'Artists',
      castings: 'Castings',
      events: 'Events',
      pricing: 'Pricing',
      about: 'About Us',
      contact: 'Contact',
      profile: 'My Profile',
      logout: 'Logout',
      login: 'Sign In',
      register: 'Sign Up',
      search: 'Advanced Search',
      myEvents: 'My Events',
      admin: 'Administration'
    },
    home: {
      hero: {
        title: 'Connect lyrical talents to opportunities',
        subtitle: 'The first platform dedicated to opera singers and opera professionals. Create your profile, discover opportunities and develop your career.',
        createProfile: 'Create my profile',
        discoverArtists: 'Discover artists',
        tagline: 'Artists, professionals, opportunities. The entire lyrical world united.'
      },
      features: {
        title: 'A platform designed for all opera stakeholders',
        subtitle: 'Discover how Lyrisphere revolutionizes the way artists and professionals interact in the opera world',
        artists: {
          title: 'For Artists',
          subtitle: 'Develop your career with professional promotion and networking tools',
          cta: 'Create my artist profile'
        },
        professionals: {
          title: 'For Professionals',
          subtitle: 'Find talents that exactly match your artistic needs',
          cta: 'Access pro space'
        }
      },
      featuredArtists: {
        title: 'Featured Artists',
        subtitle: 'Discover the most promising opera singers on our platform.',
        viewAll: 'View all artists',
        listen: 'Listen',
        featured: 'Featured',
        becomeArtist: {
          title: 'Are you an opera singer?',
          subtitle: 'Join our community of artists and showcase your talent to opera professionals.',
          createProfile: 'Create my profile',
          guide: 'Guide for artists'
        }
      },
      pricing: {
        title: 'Choose the plan that suits you',
        subtitle: 'Pricing adapted to your needs, whether you are an artist or professional',
        monthly: 'month',
        noCommitment: 'No commitment • Cancel anytime',
        contact: 'Contact us',
        faq: 'FAQ'
      },
      cta: {
        title: 'Ready to join the opera community?',
        subtitle: 'Whether you are an artist or professional, Lyrisphere offers you the tools needed to advance your career.',
        createAccount: 'Create account',
        viewPlans: 'View subscriptions'
      }
    }
  },
  de: {
    common: {
      loading: 'Wird geladen...',
      error: 'Fehler',
      save: 'Speichern',
      cancel: 'Abbrechen',
      delete: 'Löschen',
      edit: 'Bearbeiten',
      create: 'Erstellen',
      search: 'Suchen',
      filter: 'Filtern',
      close: 'Schließen',
      back: 'Zurück',
      next: 'Weiter',
      previous: 'Vorherige',
      yes: 'Ja',
      no: 'Nein',
      submit: 'Senden'
    },
    navigation: {
      home: 'Startseite',
      artists: 'Künstler',
      castings: 'Castings',
      events: 'Veranstaltungen',
      pricing: 'Preise',
      about: 'Über uns',
      contact: 'Kontakt',
      profile: 'Mein Profil',
      logout: 'Abmelden',
      login: 'Anmelden',
      register: 'Registrieren',
      search: 'Erweiterte Suche',
      myEvents: 'Meine Veranstaltungen',
      admin: 'Administration'
    },
    home: {
      hero: {
        title: 'Verbinden Sie lyrische Talente mit Möglichkeiten',
        subtitle: 'Die erste Plattform für Opernsänger und Opernprofis. Erstellen Sie Ihr Profil, entdecken Sie Möglichkeiten und entwickeln Sie Ihre Karriere.',
        createProfile: 'Mein Profil erstellen',
        discoverArtists: 'Künstler entdecken',
        tagline: 'Künstler, Profis, Möglichkeiten. Die gesamte lyrische Welt vereint.'
      },
      features: {
        title: 'Eine Plattform für alle Akteure der Oper',
        subtitle: 'Entdecken Sie, wie Lyrisphere die Art revolutioniert, wie Künstler und Profis in der Opernwelt interagieren',
        artists: {
          title: 'Für Künstler',
          subtitle: 'Entwickeln Sie Ihre Karriere mit professionellen Promotion- und Networking-Tools',
          cta: 'Mein Künstlerprofil erstellen'
        },
        professionals: {
          title: 'Für Profis',
          subtitle: 'Finden Sie Talente, die genau Ihren künstlerischen Bedürfnissen entsprechen',
          cta: 'Profi-Bereich zugreifen'
        }
      },
      featuredArtists: {
        title: 'Empfohlene Künstler',
        subtitle: 'Entdecken Sie die vielversprechendsten Opernsänger auf unserer Plattform.',
        viewAll: 'Alle Künstler anzeigen',
        listen: 'Anhören',
        featured: 'Empfohlen',
        becomeArtist: {
          title: 'Sind Sie Opernsänger?',
          subtitle: 'Treten Sie unserer Künstlergemeinschaft bei und präsentieren Sie Ihr Talent Opernprofis.',
          createProfile: 'Mein Profil erstellen',
          guide: 'Leitfaden für Künstler'
        }
      },
      pricing: {
        title: 'Wählen Sie den passenden Plan',
        subtitle: 'Preise angepasst an Ihre Bedürfnisse, ob Sie Künstler oder Profi sind',
        monthly: 'Monat',
        noCommitment: 'Keine Verpflichtung • Jederzeit kündbar',
        contact: 'Kontaktieren Sie uns',
        faq: 'FAQ'
      },
      cta: {
        title: 'Bereit, der Operngemeinschaft beizutreten?',
        subtitle: 'Ob Sie Künstler oder Profi sind, Lyrisphere bietet Ihnen die nötigen Tools zur Karriereentwicklung.',
        createAccount: 'Konto erstellen',
        viewPlans: 'Abonnements anzeigen'
      }
    }
  },
  it: {
    common: {
      loading: 'Caricamento...',
      error: 'Errore',
      save: 'Salva',
      cancel: 'Annulla',
      delete: 'Elimina',
      edit: 'Modifica',
      create: 'Crea',
      search: 'Cerca',
      filter: 'Filtra',
      close: 'Chiudi',
      back: 'Indietro',
      next: 'Avanti',
      previous: 'Precedente',
      yes: 'Sì',
      no: 'No',
      submit: 'Invia'
    },
    navigation: {
      home: 'Home',
      artists: 'Artisti',
      castings: 'Casting',
      events: 'Eventi',
      pricing: 'Prezzi',
      about: 'Chi siamo',
      contact: 'Contatto',
      profile: 'Il mio profilo',
      logout: 'Disconnetti',
      login: 'Accedi',
      register: 'Registrati',
      search: 'Ricerca avanzata',
      myEvents: 'I miei eventi',
      admin: 'Amministrazione'
    },
    home: {
      hero: {
        title: 'Connetti i talenti lirici alle opportunità',
        subtitle: 'La prima piattaforma dedicata ai cantanti lirici e ai professionisti dell\'opera. Crea il tuo profilo, scopri opportunità e sviluppa la tua carriera.',
        createProfile: 'Crea il mio profilo',
        discoverArtists: 'Scopri gli artisti',
        tagline: 'Artisti, professionisti, opportunità. Tutto l\'universo lirico riunito.'
      },
      features: {
        title: 'Una piattaforma pensata per tutti gli attori del lirico',
        subtitle: 'Scopri come Lyrisphere rivoluziona il modo in cui artisti e professionisti interagiscono nel mondo dell\'opera',
        artists: {
          title: 'Per gli Artisti',
          subtitle: 'Sviluppa la tua carriera con strumenti professionali di promozione e networking',
          cta: 'Crea il mio profilo artista'
        },
        professionals: {
          title: 'Per i Professionisti',
          subtitle: 'Trova talenti che corrispondono esattamente alle tue esigenze artistiche',
          cta: 'Accedi allo spazio pro'
        }
      },
      featuredArtists: {
        title: 'Artisti in evidenza',
        subtitle: 'Scopri i cantanti lirici più promettenti della nostra piattaforma.',
        viewAll: 'Vedi tutti gli artisti',
        listen: 'Ascolta',
        featured: 'In evidenza',
        becomeArtist: {
          title: 'Sei un cantante lirico?',
          subtitle: 'Unisciti alla nostra comunità di artisti e metti in mostra il tuo talento ai professionisti del settore.',
          createProfile: 'Crea il mio profilo',
          guide: 'Guida per artisti'
        }
      },
      pricing: {
        title: 'Scegli il piano che fa per te',
        subtitle: 'Prezzi adattati alle tue esigenze, che tu sia artista o professionista',
        monthly: 'mese',
        noCommitment: 'Senza impegno • Cancella quando vuoi',
        contact: 'Contattaci',
        faq: 'FAQ'
      },
      cta: {
        title: 'Pronto a unirti alla comunità lirica?',
        subtitle: 'Che tu sia artista o professionista, Lyrisphere ti offre gli strumenti necessari per far avanzare la tua carriera.',
        createAccount: 'Crea account',
        viewPlans: 'Vedi abbonamenti'
      }
    }
  },
  zh: {
    common: {
      loading: '加载中...',
      error: '错误',
      save: '保存',
      cancel: '取消',
      delete: '删除',
      edit: '编辑',
      create: '创建',
      search: '搜索',
      filter: '筛选',
      close: '关闭',
      back: '返回',
      next: '下一步',
      previous: '上一步',
      yes: '是',
      no: '否',
      submit: '提交'
    },
    navigation: {
      home: '首页',
      artists: '艺术家',
      castings: '试音',
      events: '活动',
      pricing: '价格',
      about: '关于我们',
      contact: '联系',
      profile: '我的资料',
      logout: '退出',
      login: '登录',
      register: '注册',
      search: '高级搜索',
      myEvents: '我的活动',
      admin: '管理'
    },
    home: {
      hero: {
        title: '连接抒情人才与机会',
        subtitle: '首个专门为歌剧歌手和歌剧专业人士打造的平台。创建您的档案，发现机会，发展您的事业。',
        createProfile: '创建我的档案',
        discoverArtists: '发现艺术家',
        tagline: '艺术家、专业人士、机会。整个抒情世界汇聚于此。'
      },
      features: {
        title: '为歌剧界所有参与者设计的平台',
        subtitle: '了解Lyrisphere如何革命性地改变艺术家和专业人士在歌剧世界中的互动方式',
        artists: {
          title: '艺术家专区',
          subtitle: '通过专业推广和网络工具发展您的事业',
          cta: '创建我的艺术家档案'
        },
        professionals: {
          title: '专业人士专区',
          subtitle: '找到完全符合您艺术需求的人才',
          cta: '进入专业空间'
        }
      },
      featuredArtists: {
        title: '特色艺术家',
        subtitle: '发现我们平台上最有前途的歌剧歌手。',
        viewAll: '查看所有艺术家',
        listen: '收听',
        featured: '特色',
        becomeArtist: {
          title: '您是歌剧歌手吗？',
          subtitle: '加入我们的艺术家社区，向歌剧专业人士展示您的才华。',
          createProfile: '创建我的档案',
          guide: '艺术家指南'
        }
      },
      pricing: {
        title: '选择适合您的计划',
        subtitle: '无论您是艺术家还是专业人士，我们都有适合您需求的价格',
        monthly: '月',
        noCommitment: '无约束 • 随时取消',
        contact: '联系我们',
        faq: '常见问题'
      },
      cta: {
        title: '准备加入歌剧社区了吗？',
        subtitle: '无论您是艺术家还是专业人士，Lyrisphere都为您提供发展事业所需的工具。',
        createAccount: '创建账户',
        viewPlans: '查看订阅'
      }
    }
  },
  ko: {
    common: {
      loading: '로딩 중...',
      error: '오류',
      save: '저장',
      cancel: '취소',
      delete: '삭제',
      edit: '편집',
      create: '생성',
      search: '검색',
      filter: '필터',
      close: '닫기',
      back: '뒤로',
      next: '다음',
      previous: '이전',
      yes: '예',
      no: '아니오',
      submit: '제출'
    },
    navigation: {
      home: '홈',
      artists: '아티스트',
      castings: '캐스팅',
      events: '이벤트',
      pricing: '가격',
      about: '회사 소개',
      contact: '연락처',
      profile: '내 프로필',
      logout: '로그아웃',
      login: '로그인',
      register: '회원가입',
      search: '고급 검색',
      myEvents: '내 이벤트',
      admin: '관리'
    },
    home: {
      hero: {
        title: '서정적 재능을 기회와 연결하세요',
        subtitle: '오페라 가수와 오페라 전문가들을 위한 최초의 플랫폼입니다. 프로필을 만들고, 기회를 발견하고, 경력을 발전시키세요.',
        createProfile: '내 프로필 만들기',
        discoverArtists: '아티스트 발견',
        stats: {
          artists: '아티스트',
          professionals: '전문가',
          events: '이벤트'
        }
      },
      features: {
        title: '오페라계 모든 참여자를 위해 설계된 플랫폼',
        subtitle: 'Lyrisphere이 오페라 세계에서 아티스트와 전문가들의 상호작용을 어떻게 혁신하는지 알아보세요',
        artists: {
          title: '아티스트를 위한',
          subtitle: '전문적인 홍보 및 네트워킹 도구로 경력을 개발하세요',
          cta: '내 아티스트 프로필 만들기'
        },
        professionals: {
          title: '전문가를 위한',
          subtitle: '귀하의 예술적 요구에 정확히 맞는 인재를 찾으세요',
          cta: '프로 공간 접근'
        }
      },
      featuredArtists: {
        title: '주요 아티스트',
        subtitle: '우리 플랫폼에서 가장 유망한 오페라 가수들을 만나보세요.',
        viewAll: '모든 아티스트 보기',
        listen: '듣기',
        featured: '주요',
        becomeArtist: {
          title: '오페라 가수이신가요?',
          subtitle: '우리 아티스트 커뮤니티에 가입하고 오페라 전문가들에게 귀하의 재능을 선보이세요.',
          createProfile: '내 프로필 만들기',
          guide: '아티스트 가이드'
        }
      },
      pricing: {
        title: '당신에게 맞는 플랜을 선택하세요',
        subtitle: '아티스트든 전문가든, 귀하의 필요에 맞는 가격',
        monthly: '월',
        noCommitment: '약정 없음 • 언제든 취소',
        contact: '문의하기',
        faq: 'FAQ'
      },
      cta: {
        title: '오페라 커뮤니티에 참여할 준비가 되셨나요?',
        subtitle: '아티스트든 전문가든, Lyrisphere은 경력 발전에 필요한 도구를 제공합니다.',
        createAccount: '계정 만들기',
        viewPlans: '구독 보기'
      }
    }
  }
};

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

export default i18n;
