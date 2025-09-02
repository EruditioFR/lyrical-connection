import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface BreadcrumbItem {
  label: string;
  path: string;
  icon?: React.ComponentType<any>;
}

const NavigationBreadcrumb: React.FC = () => {
  const location = useLocation();

  const breadcrumbs = useMemo(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const crumbs: BreadcrumbItem[] = [{ label: 'Accueil', path: '/', icon: Home }];

    // Configuration des routes et leurs labels
    const routeLabels: Record<string, string> = {
      'auth': 'Connexion',
      'recherche-artistes': 'Recherche d\'artistes',
      'professionnels': 'Professionnels',
      'artistes': 'Artistes',
      'evenements': 'Événements',
      'castings': 'Castings',
      'profil': 'Mon profil',
      'dashboard': 'Tableau de bord',
      'messages': 'Messages',
      'notifications': 'Notifications',
      'abonnement': 'Abonnement',
      'candidatures': 'Mes candidatures',
      'candidatures-recues': 'Candidatures reçues',
      'candidatures-casting': 'Candidatures casting',
      'candidatures-evenements': 'Candidatures événements',
      'mes-evenements': 'Mes événements',
      'admin': 'Administration',
      'contact': 'Contact',
      'about': 'À propos',
      'pricing': 'Tarifs',
      'features': 'Fonctionnalités',
      'blog': 'Blog',
      'faq': 'FAQ',
      'legal': 'Mentions légales',
      'privacy': 'Politique de confidentialité',
      'terms': 'Conditions d\'utilisation',
      'cookies': 'Politique des cookies',
      'creer-evenement': 'Créer un événement',
      'creer-casting': 'Créer un casting',
      'modifier-mot-de-passe': 'Modifier le mot de passe'
    };

    let currentPath = '';

    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Si c'est un ID (UUID), on utilise un label générique basé sur le segment parent
      if (segment.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        const parentSegment = pathSegments[index - 1];
        let label = 'Détail';
        
        if (parentSegment === 'artistes') {
          label = 'Profil artiste';
        } else if (parentSegment === 'professionnels') {
          label = 'Profil professionnel';
        } else if (parentSegment === 'evenements') {
          label = 'Événement';
        } else if (parentSegment === 'castings') {
          label = 'Casting';
        }
        
        crumbs.push({
          label,
          path: currentPath
        });
      } else {
        // Routes normales
        const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
        crumbs.push({
          label,
          path: currentPath
        });
      }
    });

    return crumbs;
  }, [location.pathname]);

  // Ne pas afficher le breadcrumb sur la page d'accueil
  if (location.pathname === '/') {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.path}>
              <BreadcrumbItem>
                {index === breadcrumbs.length - 1 ? (
                  <BreadcrumbPage className="flex items-center gap-2">
                    {crumb.icon && <crumb.icon className="h-4 w-4" />}
                    {crumb.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={crumb.path} className="flex items-center gap-2">
                      {crumb.icon && <crumb.icon className="h-4 w-4" />}
                      {crumb.label}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};

export default NavigationBreadcrumb;