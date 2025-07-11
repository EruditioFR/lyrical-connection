
import React from 'react';
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
import { LogOut, User, Settings, CreditCard, Shield } from 'lucide-react';
import { useUserType } from '@/hooks/useUserType';
import { useUserRoles } from '@/hooks/useUserRoles';

const Navbar = () => {
  const { t } = useTranslation(['navigation', 'common']);
  const { user, signOut } = useAuth();
  const { artistProfile, professionalProfile } = useUserType();
  const { isAdmin } = useUserRoles();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  // Déterminer le nom d'affichage selon le type de profil
  const getDisplayName = () => {
    if (professionalProfile?.company_name) {
      return professionalProfile.company_name;
    }
    if (artistProfile?.stage_name) {
      return artistProfile.stage_name;
    }
    // Fallback sur le nom d'utilisateur ou email
    return user?.user_metadata?.full_name || user?.email?.split('@')[0];
  };

  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo et titre */}
        <Link to="/" className="flex items-center text-xl font-semibold text-gray-900">
          Lyrical
        </Link>

        {/* Navigation principale */}
        <div className="hidden md:flex items-center space-x-8">
          {user ? (
            <>
              <Link 
                to="/artistes" 
                className="text-gray-700 hover:text-lyrical-600 font-medium transition-colors"
              >
                {t('navigation:artists')}
              </Link>
              <Link 
                to="/castings" 
                className="text-gray-700 hover:text-lyrical-600 font-medium transition-colors"
              >
                {t('navigation:castings')}
              </Link>
              <Link 
                to="/pricing" 
                className="text-gray-700 hover:text-lyrical-600 font-medium transition-colors"
              >
                {t('navigation:pricing')}
              </Link>
              {/* Liens pour les professionnels */}
              <Link 
                to="/recherche-artistes" 
                className="text-gray-700 hover:text-lyrical-600 font-medium transition-colors"
              >
                {t('navigation:search')}
              </Link>
              <Link 
                to="/mes-evenements" 
                className="text-gray-700 hover:text-lyrical-600 font-medium transition-colors"
              >
                {t('navigation:myEvents')}
              </Link>
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
            <>
              <Link 
                to="/" 
                className="text-gray-700 hover:text-lyrical-600 font-medium transition-colors"
              >
                {t('navigation:home')}
              </Link>
              <Link 
                to="/qui-sommes-nous" 
                className="text-gray-700 hover:text-lyrical-600 font-medium transition-colors"
              >
                {t('navigation:about')}
              </Link>
              <Link 
                to="/pricing" 
                className="text-gray-700 hover:text-lyrical-600 font-medium transition-colors"
              >
                {t('navigation:pricing')}
              </Link>
            </>
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
    </nav>
  );
};

export default Navbar;
