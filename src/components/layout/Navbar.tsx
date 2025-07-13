
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LanguageSelector } from '@/components/ui/language-selector';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, Settings, CreditCard, Shield, ChevronDown } from 'lucide-react';
import { useUserType } from '@/hooks/useUserType';
import { useUserRoles } from '@/hooks/useUserRoles';
import MegaMenu from './MegaMenu';

const Navbar = () => {
  const { t } = useTranslation(['navigation', 'common']);
  const { user, signOut } = useAuth();
  const { artistProfile, professionalProfile, isProfessional, isArtist } = useUserType();
  const { isAdmin } = useUserRoles();
  const navigate = useNavigate();
  
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const getDisplayName = () => {
    if (professionalProfile?.company_name) {
      return professionalProfile.company_name;
    }
    if (artistProfile?.stage_name) {
      return artistProfile.stage_name;
    }
    return user?.user_metadata?.full_name || user?.email?.split('@')[0];
  };

  const handleMouseEnter = (menuType: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setActiveMegaMenu(menuType);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveMegaMenu(null);
    }, 200);
  };

  const closeMegaMenu = () => {
    setActiveMegaMenu(null);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <nav className="bg-white shadow-sm border-b relative">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center text-xl font-semibold text-gray-900">
          Lyrical
        </Link>

        {/* Navigation principale */}
        <div className="hidden md:flex items-center space-x-8">
          {user ? (
            <>
              {/* Menu Artiste */}
              {isArtist && (
                <div 
                  className="relative"
                  onMouseEnter={() => handleMouseEnter('artist')}
                  onMouseLeave={handleMouseLeave}
                >
                  <button className="flex items-center text-gray-700 hover:text-lyrical-600 font-medium transition-colors">
                    Mon Espace
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Menu Professionnel */}
              {isProfessional && (
                <div 
                  className="relative"
                  onMouseEnter={() => handleMouseEnter('professional')}
                  onMouseLeave={handleMouseLeave}
                >
                  <button className="flex items-center text-gray-700 hover:text-lyrical-600 font-medium transition-colors">
                    Mes Projets
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Liens directs pour tous */}
              <Link 
                to="/artistes" 
                className="text-gray-700 hover:text-lyrical-600 font-medium transition-colors"
              >
                {t('navigation:artists')}
              </Link>
              
              {!isProfessional && (
                <Link 
                  to="/castings" 
                  className="text-gray-700 hover:text-lyrical-600 font-medium transition-colors"
                >
                  {t('navigation:castings')}
                </Link>
              )}

              {/* Lien d'administration pour les admins */}
              {isAdmin && (
                <Link 
                  to="/admin" 
                  className="text-red-600 hover:text-red-700 font-medium transition-colors flex items-center gap-1"
                >
                  <Shield className="h-4 w-4" />
                  {t('navigation:admin')}
                </Link>
              )}
            </>
          ) : (
            /* Menu pour utilisateurs non connectés */
            <div 
              className="relative"
              onMouseEnter={() => handleMouseEnter('discover')}
              onMouseLeave={handleMouseLeave}
            >
              <button className="flex items-center text-gray-700 hover:text-lyrical-600 font-medium transition-colors">
                Découvrir
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Actions : Language + Authentification / Profil */}
        <div className="flex items-center space-x-4">
          <LanguageSelector />
          {user ? (
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-700">
                {getDisplayName()}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="mr-2 h-4 w-4" />
                    Gérer mon profil
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{getDisplayName()}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profil')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>{t('navigation:profile')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/subscription')}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    <span>Abonnement</span>
                  </DropdownMenuItem>
                  {/* Lien d'administration dans le menu déroulant pour les admins */}
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate('/admin')}>
                        <Shield className="mr-2 h-4 w-4" />
                        <span>{t('navigation:admin')}</span>
                      </DropdownMenuItem>
                    </>
                  )}
                  {user.app_metadata.provider === 'email' && (
                    <DropdownMenuItem onClick={() => navigate('/auth/update-password')}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Changer le mot de passe</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    {t('navigation:logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => navigate('/auth')}>
                {t('navigation:login')}
              </Button>
              <Button size="sm" onClick={() => navigate('/auth')}>
                {t('navigation:register')}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Mega Menu */}
      <MegaMenu 
        isOpen={activeMegaMenu !== null} 
        onClose={closeMegaMenu}
        menuType={activeMegaMenu || 'discover'}
      />
    </nav>
  );
};

export default Navbar;
