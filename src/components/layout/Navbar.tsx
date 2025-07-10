
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Search, Menu, X, User, LogIn, LogOut, Briefcase } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();

  // Detect if user is professional based on metadata
  const isProUser = user?.user_metadata?.user_type === 'professional';

  // Effet pour détecter le défilement
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Ferme le menu mobile lorsque la page change de taille
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-background/95 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo et Titre */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl md:text-2xl font-serif font-bold bg-clip-text text-transparent bg-gradient-to-r from-lyrical-700 to-gold-500">
              Lyrical Connection
            </span>
          </Link>

          {/* Navigation sur desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/artistes" className="text-foreground/80 hover:text-foreground transition-colors">
              Artistes
            </Link>
            <Link to="/evenements" className="text-foreground/80 hover:text-foreground transition-colors">
              Événements
            </Link>
            <Link to="/a-propos" className="text-foreground/80 hover:text-foreground transition-colors">
              À propos
            </Link>
            <Link to="/contact" className="text-foreground/80 hover:text-foreground transition-colors">
              Contact
            </Link>
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="icon" aria-label="Rechercher">
              <Search className="h-5 w-5" />
            </Button>
            
            {user ? (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" className="flex items-center space-x-2" asChild>
                  <Link to={isProUser ? "/profil-pro" : "/profil"}>
                    {isProUser ? <Briefcase className="h-5 w-5" /> : <User className="h-5 w-5" />}
                    <span>{isProUser ? 'Profil Pro' : 'Mon profil'}</span>
                  </Link>
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={handleSignOut}
                  className="flex items-center space-x-2"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Déconnexion</span>
                </Button>
              </div>
            ) : (
              <>
                <Button variant="ghost" className="flex items-center space-x-2" asChild>
                  <Link to="/auth">
                    <LogIn className="h-5 w-5 mr-1" />
                    <span>Connexion</span>
                  </Link>
                </Button>
                <Button className="bg-gradient-to-r from-lyrical-600 to-gold-500 hover:from-lyrical-700 hover:to-gold-600 text-white" asChild>
                  <Link to="/auth">Inscription</Link>
                </Button>
              </>
            )}
          </div>

          {/* Bouton menu mobile */}
          <div className="flex md:hidden">
            <Button
              variant="ghost"
              size="icon"
              aria-label={isMobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 inset-x-0 bg-background/95 backdrop-blur-md shadow-md animate-fade-in">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col space-y-4">
              <Link 
                to="/artistes" 
                className="text-foreground/80 hover:text-foreground py-2 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Artistes
              </Link>
              <Link 
                to="/evenements" 
                className="text-foreground/80 hover:text-foreground py-2 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Événements
              </Link>
              <Link 
                to="/a-propos" 
                className="text-foreground/80 hover:text-foreground py-2 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                À propos
              </Link>
              <Link 
                to="/contact" 
                className="text-foreground/80 hover:text-foreground py-2 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </Link>
              
              {user ? (
                <div className="pt-2 space-y-2">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link to={isProUser ? "/profil-pro" : "/profil"} onClick={() => setIsMobileMenuOpen(false)}>
                      {isProUser ? <Briefcase className="h-4 w-4 mr-2" /> : <User className="h-4 w-4 mr-2" />}
                      {isProUser ? 'Profil Pro' : 'Mon profil'}
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Déconnexion
                  </Button>
                </div>
              ) : (
                <div className="pt-2 flex space-x-4">
                  <Button variant="outline" className="flex-1" asChild>
                    <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                      Connexion
                    </Link>
                  </Button>
                  <Button className="flex-1 bg-gradient-to-r from-lyrical-600 to-gold-500 hover:from-lyrical-700 hover:to-gold-600 text-white" asChild>
                    <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                      Inscription
                    </Link>
                  </Button>
                </div>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
