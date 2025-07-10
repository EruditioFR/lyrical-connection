
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, Settings } from 'lucide-react';

const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
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
          <Link 
            to="/artistes" 
            className="text-gray-700 hover:text-lyrical-600 font-medium transition-colors"
          >
            Artistes
          </Link>
          <Link 
            to="/castings" 
            className="text-gray-700 hover:text-lyrical-600 font-medium transition-colors"
          >
            Castings
          </Link>
          {user && (
            <>
              {/* Liens pour les professionnels */}
              <Link 
                to="/recherche-artistes" 
                className="text-gray-700 hover:text-lyrical-600 font-medium transition-colors"
              >
                Recherche avancée
              </Link>
              <Link 
                to="/mes-evenements" 
                className="text-gray-700 hover:text-lyrical-600 font-medium transition-colors"
              >
                Mes Événements
              </Link>
            </>
          )}
        </div>

        {/* Actions : Authentification / Profil */}
        <div className="flex items-center space-x-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.full_name} />
                    <AvatarFallback>{user.user_metadata?.full_name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.user_metadata?.full_name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profil')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profil</span>
                </DropdownMenuItem>
                {user.app_metadata.provider === 'email' && (
                  <DropdownMenuItem onClick={() => navigate('/auth/update-password')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Changer le mot de passe</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => navigate('/auth/sign-in')}>
                Se connecter
              </Button>
              <Button size="sm" onClick={() => navigate('/auth/sign-up')}>
                S'inscrire
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
