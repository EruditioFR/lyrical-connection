
import React from 'react';
import { Link } from 'react-router-dom';
import { useUserType } from '@/hooks/useUserType';
import { 
  Users, 
  Briefcase, 
  Search, 
  MessageSquare,
  Calendar,
  FileText,
  User,
  BarChart3,
  Settings,
  BookOpen,
  Star,
  Zap
} from 'lucide-react';

interface MenuItem {
  label: string;
  href: string;
  icon: React.ComponentType<any>;
  description: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
  menuType: string;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export const MegaMenu = ({ isOpen, onClose, menuType, onMouseEnter, onMouseLeave }: MegaMenuProps) => {
  const { isProfessional, isArtist } = useUserType();

  // Don't render anything if not open
  if (!isOpen) {
    return null;
  }

  // Menus pour les artistes
  const artistSections: MenuSection[] = [
    {
      title: "Découvrir",
      items: [
        {
          label: "Castings",
          href: "/castings",
          icon: Star,
          description: "Explorez les opportunités de casting"
        },
        {
          label: "Événements",
          href: "/evenements",
          icon: Calendar,
          description: "Masterclass, stages et formations"
        },
        {
          label: "Artistes",
          href: "/artistes",
          icon: Users,
          description: "Découvrez d'autres artistes"
        }
      ]
    },
    {
      title: "Mon compte",
      items: [
        {
          label: "Mes candidatures",
          href: "/mes-candidatures",
          icon: FileText,
          description: "Suivez vos candidatures"
        },
        {
          label: "Mon profil",
          href: "/profil",
          icon: User,
          description: "Gérez votre profil artistique"
        },
        {
          label: "Tableau de bord",
          href: "/dashboard",
          icon: BarChart3,
          description: "Statistiques et analyses"
        }
      ]
    }
  ];

  // Menus pour les professionnels
  const professionalSections: MenuSection[] = [
    {
      title: "Gestion",
      items: [
        {
          label: "Mes castings",
          href: "/castings",
          icon: Briefcase,
          description: "Gérez vos castings"
        },
        {
          label: "Mes événements",
          href: "/mes-evenements",
          icon: Calendar,
          description: "Organisez vos événements"
        },
        {
          label: "Candidatures reçues",
          href: "/candidatures-reçues",
          icon: FileText,
          description: "Gérez les candidatures"
        }
      ]
    },
    {
      title: "Recherche",
      items: [
        {
          label: "Recherche d'artistes",
          href: "/recherche-artistes",
          icon: Search,
          description: "Trouvez les talents parfaits"
        },
        {
          label: "Artistes",
          href: "/artistes",
          icon: Users,
          description: "Parcourez les profils"
        }
      ]
    },
    {
      title: "Mon compte",
      items: [
        {
          label: "Mon profil",
          href: "/profil-professionnel",
          icon: User,
          description: "Gérez votre profil pro"
        },
        {
          label: "Tableau de bord",
          href: "/dashboard",
          icon: BarChart3,
          description: "Statistiques et analyses"
        }
      ]
    }
  ];

  // Menu par défaut pour les visiteurs non connectés
  const defaultSections: MenuSection[] = [
    {
      title: "Découvrir",
      items: [
        {
          label: "Castings",
          href: "/castings",
          icon: Star,
          description: "Explorez les opportunités"
        },
        {
          label: "Événements",
          href: "/evenements",
          icon: Calendar,
          description: "Formations et masterclass"
        },
        {
          label: "Artistes",
          href: "/artistes",
          icon: Users,
          description: "Découvrez les talents"
        }
      ]
    },
    {
      title: "À propos",
      items: [
        {
          label: "Qui sommes-nous",
          href: "/qui-sommes-nous",
          icon: BookOpen,
          description: "Notre mission et équipe"
        },
        {
          label: "Tarifs",
          href: "/pricing",
          icon: Zap,
          description: "Nos offres et prix"
        }
      ]
    }
  ];

  const sections = isProfessional ? professionalSections : isArtist ? artistSections : defaultSections;

  return (
    <div 
      className="absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sections.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              <h3 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <Link 
                      to={item.href}
                      onClick={onClose}
                      className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <item.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-900 group-hover:text-primary transition-colors">
                          {item.label}
                        </p>
                        <p className="text-sm text-gray-500">
                          {item.description}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
