import React from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  Calendar, 
  Search, 
  MessageSquare, 
  CreditCard,
  Settings,
  Users,
  Briefcase,
  Star,
  MapPin,
  Camera,
  Music,
  Heart,
  Shield,
  HelpCircle,
  BookOpen,
  Lightbulb,
  Trophy,
  Building2,
  UserCheck,
  Mail,
  Bell,
  Target,
  Bookmark,
  Phone,
  UserPlus
} from 'lucide-react';
import { useUserType } from '@/hooks/useUserType';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useTranslation } from 'react-i18next';

interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
  menuType: string;
}

const MegaMenu: React.FC<MegaMenuProps> = ({ isOpen, onClose, menuType }) => {
  const { t } = useTranslation(['navigation', 'common']);
  const { isProfessional, isArtist } = useUserType();
  const { isAdmin } = useUserRoles();

  if (!isOpen) return null;

  const renderDiscoverMenu = () => (
    <div className="grid grid-cols-3 gap-8 p-8">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Building2 className="h-5 w-5 text-lyrical-600" />
          À propos
        </h3>
        <div className="space-y-3">
          <Link to="/qui-sommes-nous" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors" onClick={onClose}>
            <Heart className="h-4 w-4 text-red-500" />
            <div>
              <p className="font-medium text-gray-900">Notre histoire</p>
              <p className="text-sm text-gray-500">Découvrez Lyrical</p>
            </div>
          </Link>
          <Link to="/pricing" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors" onClick={onClose}>
            <CreditCard className="h-4 w-4 text-green-500" />
            <div>
              <p className="font-medium text-gray-900">Tarifs</p>
              <p className="text-sm text-gray-500">Plans et abonnements</p>
            </div>
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          Pour les Artistes
        </h3>
        <div className="space-y-3">
          <Link to="/artistes" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors" onClick={onClose}>
            <Users className="h-4 w-4 text-blue-500" />
            <div>
              <p className="font-medium text-gray-900">Parcourir les profils</p>
              <p className="text-sm text-gray-500">Découvrez nos talents</p>
            </div>
          </Link>
          <Link to="/auth" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors" onClick={onClose}>
            <UserCheck className="h-4 w-4 text-purple-500" />
            <div>
              <p className="font-medium text-gray-900">Devenir artiste</p>
              <p className="text-sm text-gray-500">Rejoignez la communauté</p>
            </div>
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-indigo-500" />
          Pour les Professionnels
        </h3>
        <div className="space-y-3">
          <Link to="/castings" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors" onClick={onClose}>
            <Calendar className="h-4 w-4 text-orange-500" />
            <div>
              <p className="font-medium text-gray-900">Castings & Événements</p>
              <p className="text-sm text-gray-500">Trouvez des talents</p>
            </div>
          </Link>
          <Link to="/auth" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors" onClick={onClose}>
            <Building2 className="h-4 w-4 text-teal-500" />
            <div>
              <p className="font-medium text-gray-900">Devenir professionnel</p>
              <p className="text-sm text-gray-500">Créez votre compte pro</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );

  const renderArtistMenu = () => (
    <div className="grid grid-cols-4 gap-6 p-8">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <User className="h-5 w-5 text-lyrical-600" />
          Mon Profil
        </h3>
        <div className="space-y-3">
          <Link to="/profil" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors" onClick={onClose}>
            <Settings className="h-4 w-4 text-gray-500" />
            <div>
              <p className="font-medium text-gray-900">Gérer mon profil</p>
              <p className="text-sm text-gray-500">Informations personnelles</p>
            </div>
          </Link>
          <Link to="/profil" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors" onClick={onClose}>
            <Camera className="h-4 w-4 text-pink-500" />
            <div>
              <p className="font-medium text-gray-900">Photos & Vidéos</p>
              <p className="text-sm text-gray-500">Galerie multimédia</p>
            </div>
          </Link>
          <Link to="/profil" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors" onClick={onClose}>
            <Music className="h-4 w-4 text-green-500" />
            <div>
              <p className="font-medium text-gray-900">Répertoire</p>
              <p className="text-sm text-gray-500">Mes œuvres maîtrisées</p>
            </div>
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Target className="h-5 w-5 text-orange-500" />
          Opportunités
        </h3>
        <div className="space-y-3">
          <Link to="/castings" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors" onClick={onClose}>
            <Trophy className="h-4 w-4 text-yellow-500" />
            <div>
              <p className="font-medium text-gray-900">Castings</p>
              <p className="text-sm text-gray-500">Offres de casting</p>
            </div>
          </Link>
          <Link to="/evenements" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors" onClick={onClose}>
            <Calendar className="h-4 w-4 text-blue-500" />
            <div>
              <p className="font-medium text-gray-900">Événements</p>
              <p className="text-sm text-gray-500">Concerts et spectacles</p>
            </div>
          </Link>
          <Link to="/mes-candidatures" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors" onClick={onClose}>
            <Bookmark className="h-4 w-4 text-purple-500" />
            <div>
              <p className="font-medium text-gray-900">Mes candidatures</p>
              <p className="text-sm text-gray-500">Suivi des postulations</p>
            </div>
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-blue-500" />
          Réseau
        </h3>
        <div className="space-y-3">
          <Link to="/messages" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors" onClick={onClose}>
            <Mail className="h-4 w-4 text-blue-500" />
            <div>
              <p className="font-medium text-gray-900">Messages</p>
              <p className="text-sm text-gray-500">Conversations</p>
            </div>
          </Link>
          <Link to="/artistes" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors" onClick={onClose}>
            <Users className="h-4 w-4 text-green-500" />
            <div>
              <p className="font-medium text-gray-900">Autres artistes</p>
              <p className="text-sm text-gray-500">Communauté</p>
            </div>
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-indigo-500" />
          Ressources
        </h3>
        <div className="space-y-3">
          <Link to="/pricing" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors" onClick={onClose}>
            <CreditCard className="h-4 w-4 text-green-500" />
            <div>
              <p className="font-medium text-gray-900">Abonnement</p>
              <p className="text-sm text-gray-500">Gérer mon plan</p>
            </div>
          </Link>
          <a href="#" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors" onClick={onClose}>
            <HelpCircle className="h-4 w-4 text-orange-500" />
            <div>
              <p className="font-medium text-gray-900">Aide</p>
              <p className="text-sm text-gray-500">Support et FAQ</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );

  const renderProfessionalMenu = () => (
    <div className="grid grid-cols-5 gap-6 p-8">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-lyrical-600" />
          Mes Projets
        </h3>
        <div className="space-y-3">
          <Link to="/mes-evenements" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors" onClick={onClose}>
            <Calendar className="h-4 w-4 text-blue-500" />
            <div>
              <p className="font-medium text-gray-900">Mes événements</p>
              <p className="text-sm text-gray-500">Gestion des événements</p>
            </div>
          </Link>
          <Link to="/castings/nouveau" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors" onClick={onClose}>
            <Trophy className="h-4 w-4 text-yellow-500" />
            <div>
              <p className="font-medium text-gray-900">Créer un casting</p>
              <p className="text-sm text-gray-500">Nouvelle audition</p>
            </div>
          </Link>
          <Link to="/candidatures-reçues" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors" onClick={onClose}>
            <Bell className="h-4 w-4 text-orange-500" />
            <div>
              <p className="font-medium text-gray-900">Candidatures reçues</p>
              <p className="text-sm text-gray-500">Gestion des postulations</p>
            </div>
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Search className="h-5 w-5 text-green-500" />
          Recherche
        </h3>
        <div className="space-y-3">
          <Link to="/recherche-artistes" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors" onClick={onClose}>
            <Users className="h-4 w-4 text-blue-500" />
            <div>
              <p className="font-medium text-gray-900">Trouver des artistes</p>
              <p className="text-sm text-gray-500">Base de talents</p>
            </div>
          </Link>
          <Link to="/recherche-artistes" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors" onClick={onClose}>
            <Bookmark className="h-4 w-4 text-purple-500" />
            <div>
              <p className="font-medium text-gray-900">Recherches sauvegardées</p>
              <p className="text-sm text-gray-500">Mes critères favoris</p>
            </div>
          </Link>
          <Link to="/artistes" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors" onClick={onClose}>
            <Star className="h-4 w-4 text-yellow-500" />
            <div>
              <p className="font-medium text-gray-900">Artistes favoris</p>
              <p className="text-sm text-gray-500">Talents suivis</p>
            </div>
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Settings className="h-5 w-5 text-gray-600" />
          Gestion
        </h3>
        <div className="space-y-3">
          <Link to="/profil-professionnel" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors" onClick={onClose}>
            <User className="h-4 w-4 text-gray-500" />
            <div>
              <p className="font-medium text-gray-900">Mon profil pro</p>
              <p className="text-sm text-gray-500">Informations entreprise</p>
            </div>
          </Link>
          <Link to="/subscription" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors" onClick={onClose}>
            <CreditCard className="h-4 w-4 text-green-500" />
            <div>
              <p className="font-medium text-gray-900">Abonnement</p>
              <p className="text-sm text-gray-500">Plan et facturation</p>
            </div>
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Phone className="h-5 w-5 text-blue-600" />
          Contacts
        </h3>
        <div className="space-y-3">
          <Link to="/messages" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors" onClick={onClose}>
            <MessageSquare className="h-4 w-4 text-blue-500" />
            <div>
              <p className="font-medium text-gray-900">Messages</p>
              <p className="text-sm text-gray-500">Conversations</p>
            </div>
          </Link>
          <Link to="/contacts-artistes" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors" onClick={onClose}>
            <UserPlus className="h-4 w-4 text-green-500" />
            <div>
              <p className="font-medium text-gray-900">Mes contacts artistes</p>
              <p className="text-sm text-gray-500">Réseau professionnel</p>
            </div>
          </Link>
          <Link to="/invitations" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors" onClick={onClose}>
            <Mail className="h-4 w-4 text-purple-500" />
            <div>
              <p className="font-medium text-gray-900">Invitations envoyées</p>
              <p className="text-sm text-gray-500">Suivi des demandes</p>
            </div>
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          Ressources
        </h3>
        <div className="space-y-3">
          <a href="#" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors" onClick={onClose}>
            <HelpCircle className="h-4 w-4 text-orange-500" />
            <div>
              <p className="font-medium text-gray-900">Centre d'aide</p>
              <p className="text-sm text-gray-500">Support et guides</p>
            </div>
          </a>
          <a href="#" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors" onClick={onClose}>
            <BookOpen className="h-4 w-4 text-indigo-500" />
            <div>
              <p className="font-medium text-gray-900">Outils pro</p>
              <p className="text-sm text-gray-500">Ressources métier</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );

  const renderAdminMenu = () => (
    <div className="grid grid-cols-6 gap-6 p-8">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-lyrical-600" />
          Mes Projets
        </h3>
        <div className="space-y-3">
          <Link to="/mes-evenements" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors" onClick={onClose}>
            <Calendar className="h-4 w-4 text-blue-500" />
            <div>
              <p className="font-medium text-gray-900">Mes événements</p>
              <p className="text-sm text-gray-500">Gestion des événements</p>
            </div>
          </Link>
          <Link to="/castings/nouveau" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors" onClick={onClose}>
            <Trophy className="h-4 w-4 text-yellow-500" />
            <div>
              <p className="font-medium text-gray-900">Créer un casting</p>
              <p className="text-sm text-gray-500">Nouvelle audition</p>
            </div>
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Search className="h-5 w-5 text-green-500" />
          Recherche
        </h3>
        <div className="space-y-3">
          <Link to="/recherche-artistes" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors" onClick={onClose}>
            <Users className="h-4 w-4 text-blue-500" />
            <div>
              <p className="font-medium text-gray-900">Trouver des artistes</p>
              <p className="text-sm text-gray-500">Base de talents</p>
            </div>
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Settings className="h-5 w-5 text-gray-600" />
          Gestion
        </h3>
        <div className="space-y-3">
          <Link to="/profil-professionnel" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors" onClick={onClose}>
            <User className="h-4 w-4 text-gray-500" />
            <div>
              <p className="font-medium text-gray-900">Mon profil pro</p>
              <p className="text-sm text-gray-500">Informations entreprise</p>
            </div>
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Phone className="h-5 w-5 text-blue-600" />
          Contacts
        </h3>
        <div className="space-y-3">
          <Link to="/messages" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors" onClick={onClose}>
            <MessageSquare className="h-4 w-4 text-blue-500" />
            <div>
              <p className="font-medium text-gray-900">Messages</p>
              <p className="text-sm text-gray-500">Conversations</p>
            </div>
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          Ressources
        </h3>
        <div className="space-y-3">
          <a href="#" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors" onClick={onClose}>
            <HelpCircle className="h-4 w-4 text-orange-500" />
            <div>
              <p className="font-medium text-gray-900">Centre d'aide</p>
              <p className="text-sm text-gray-500">Support et guides</p>
            </div>
          </a>
        </div>
      </div>

      <div className="space-y-4 border-l border-gray-200 pl-6">
        <h3 className="text-lg font-semibold text-red-600 flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Administration
        </h3>
        <div className="space-y-3">
          <Link to="/admin" className="flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 transition-colors" onClick={onClose}>
            <Shield className="h-4 w-4 text-red-500" />
            <div>
              <p className="font-medium text-gray-900">Panneau admin</p>
              <p className="text-sm text-gray-500">Gestion plateforme</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );

  const renderMenuContent = () => {
    switch (menuType) {
      case 'discover':
        return renderDiscoverMenu();
      case 'artist':
        return isArtist ? renderArtistMenu() : renderDiscoverMenu();
      case 'professional':
        return isProfessional ? (isAdmin ? renderAdminMenu() : renderProfessionalMenu()) : renderDiscoverMenu();
      default:
        return renderDiscoverMenu();
    }
  };

  return (
    <div className="absolute top-full left-0 w-full bg-white shadow-xl border-t z-50">
      {renderMenuContent()}
    </div>
  );
};

export default MegaMenu;
