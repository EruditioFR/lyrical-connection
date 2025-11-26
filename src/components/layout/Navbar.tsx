import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LanguageSelector } from '@/components/ui/language-selector';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LogOut, User, Settings, CreditCard, Shield, ChevronDown, Menu, X, Receipt } from 'lucide-react';
import { useUserType } from '@/hooks/useUserType';
import { useUserRoles } from '@/hooks/useUserRoles';
import { MegaMenu } from './MegaMenu';
import NotificationBell from '@/components/notifications/NotificationBell';
import MailIcon from './MailIcon';
import { useIsMobile } from '@/hooks/use-mobile';

const Navbar = () => {
  const {
    t
  } = useTranslation(['navigation', 'common']);
  const {
    user,
    signOut
  } = useAuth();
  const {
    artistProfile,
    professionalProfile,
    isProfessional,
    isArtist
  } = useUserType();
  const {
    isAdmin
  } = useUserRoles();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  const getMenuItems = () => {
    if (!user) return [];

    const baseItems = [
      { href: "/", label: t('nav.home') },
      { href: "/events", label: t('nav.events') },
      { href: "/castings", label: t('nav.castings') },
      { href: "/artists", label: t('nav.artists') },
      { href: "/messages", label: "Messages" },
    ];

    return baseItems;
  };

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
    }, 150);
  };

  const handleMegaMenuMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleMegaMenuMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveMegaMenu(null);
    }, 150);
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

    return <nav className="bg-white shadow-sm border-b sticky top-0 z-50 pt-safe" ref={navRef} style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 0px)' }}>
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between min-h-[64px]">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <span className="text-2xl font-bold text-lyrical-600">Lyrisphere</span>
        </Link>

        {/* Navigation principale */}
        <div className="hidden md:flex items-center space-x-8">
          {user ? <>
              {/* Menu Artiste */}
              {isArtist && <div className="relative" onMouseEnter={() => handleMouseEnter('artist')} onMouseLeave={handleMouseLeave}>
                  <button className="flex items-center text-gray-700 hover:text-lyrical-600 font-medium transition-colors">
                    Menu
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </button>
                </div>}

              {/* Menu Professionnel */}
              {isProfessional && <div className="relative" onMouseEnter={() => handleMouseEnter('professional')} onMouseLeave={handleMouseLeave}>
                  <button className="flex items-center text-gray-700 hover:text-lyrical-600 font-medium transition-colors">
                    Menu
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </button>
                </div>}

              {/* Lien d'administration pour les admins */}
              {isAdmin && <Link to="/admin" className="text-red-600 hover:text-red-700 font-medium transition-colors flex items-center gap-1">
                  <Shield className="h-4 w-4" />
                  {t('navigation:admin')}
                </Link>}
            </> : (/* Menu pour utilisateurs non connectés */
        <div className="relative" onMouseEnter={() => handleMouseEnter('discover')} onMouseLeave={handleMouseLeave}>
              <button className="flex items-center text-gray-700 hover:text-lyrical-600 font-medium transition-colors">
                Découvrir
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>
            </div>)}
        </div>

        {/* Actions : Hamburger + Notifications + Language + Authentification / Profil */}
        <div className="flex items-center space-x-4">
          {/* Bouton hamburger mobile */}
          {isMobile && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden"
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          )}
          
          <div className="hidden md:block">
            <LanguageSelector />
          </div>
          {user && !isMobile && <MailIcon />}
          {user && isArtist && !isMobile && <NotificationBell />}
          {user ? <div className="flex items-center space-x-3">
              {!isMobile && <span className="text-sm font-medium text-gray-700">
                {getDisplayName()}
              </span>}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="mr-2 h-4 w-4" />
                    {isMobile ? <User className="h-4 w-4" /> : "Gérer mon profil"}
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
                  <DropdownMenuItem onClick={() => navigate(isArtist && artistProfile ? `/artistes/${artistProfile.id}` : isProfessional ? '/profil-professionnel' : '/profil')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>{t('navigation:profile')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/subscription')}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    <span>Abonnement</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/facturation')}>
                    <Receipt className="mr-2 h-4 w-4" />
                    <span>Mes factures</span>
                  </DropdownMenuItem>
                  {/* Lien d'administration dans le menu déroulant pour les admins */}
                  {isAdmin && <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate('/admin')}>
                        <Shield className="mr-2 h-4 w-4" />
                        <span>{t('navigation:admin')}</span>
                      </DropdownMenuItem>
                    </>}
                  {user.app_metadata.provider === 'email' && <DropdownMenuItem onClick={() => navigate('/auth/update-password')}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Changer le mot de passe</span>
                    </DropdownMenuItem>}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    {t('navigation:logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div> : <>
              <Button variant="outline" size="sm" onClick={() => navigate('/auth')}>
                {t('navigation:login')}
              </Button>
              <Button size="sm" onClick={() => navigate('/auth?tab=signup')}>
                {t('navigation:register')}
              </Button>
            </>}
        </div>
      </div>

      {/* Menu Mobile */}
      {isMobile && isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg absolute top-full left-0 right-0 z-40">
          <div className="px-4 py-3 space-y-3">
            {user ? (
              <>
                {isProfessional && (
                  <>
                    <div className="text-sm font-semibold text-gray-900 border-b pb-2">
                      Menu Professionnel
                    </div>
                    <Link
                      to="/mes-evenements"
                      className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Mes événements
                    </Link>
                    <Link
                      to="/castings"
                      className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Castings
                    </Link>
                    <Link
                      to="/casting-dashboard"
                      className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Tableau de bord casting
                    </Link>
                    <Link
                      to="/candidatures-reçues"
                      className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Candidatures reçues
                    </Link>
                    <Link
                      to="/messages"
                      className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Messages
                    </Link>
                    <Link
                      to="/artistes"
                      className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Trouver des artistes
                    </Link>
                  </>
                )}
                
                {isArtist && (
                  <>
                    <div className="text-sm font-semibold text-gray-900 border-b pb-2">
                      Menu Artiste
                    </div>
                    <Link
                      to="/evenements"
                      className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Événements
                    </Link>
                    <Link
                      to="/castings"
                      className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Castings
                    </Link>
                    <Link
                      to="/mes-candidatures"
                      className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Mes candidatures
                    </Link>
                    <Link
                      to="/messages"
                      className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Messages
                    </Link>
                    <Link
                      to="/professionnels"
                      className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Voir les professionnels
                    </Link>
                  </>
                )}

                {/* Messages et notifications sur mobile */}
                <div className="border-t pt-3 mt-3 flex items-center justify-between">
                  <MailIcon />
                  {isArtist && <NotificationBell />}
                </div>
              </>
            ) : (
              /* Menu pour visiteurs non connectés */
              <>
                <div className="text-sm font-semibold text-gray-900 border-b pb-2">
                  Découvrir Lyrisphere
                </div>
                <Link
                  to="/"
                  className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Accueil
                </Link>
                <Link
                  to="/evenements"
                  className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Événements
                </Link>
                <Link
                  to="/castings"
                  className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Castings
                </Link>
                <Link
                  to="/artistes"
                  className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Artistes
                </Link>
                <Link
                  to="/about"
                  className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  À propos
                </Link>
                <Link
                  to="/pricing"
                  className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Tarifs
                </Link>
              </>
            )}

            {/* Langue sur mobile */}
            <div className="border-t pt-3 mt-3">
              <LanguageSelector />
            </div>
          </div>
        </div>
      )}

      {/* Mega Menu Desktop */}
      {!isMobile && (
        <MegaMenu isOpen={activeMegaMenu !== null} onClose={closeMegaMenu} menuType={activeMegaMenu || 'discover'} onMouseEnter={handleMegaMenuMouseEnter} onMouseLeave={handleMegaMenuMouseLeave} />
      )}
    </nav>;
};

export default Navbar;
