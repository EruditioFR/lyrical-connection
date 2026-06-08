
import React, { useState, useEffect } from 'react';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AdminSidebar from '@/components/admin/AdminSidebar';
import FreeAccountsPanel from '@/components/admin/FreeAccountsPanel';
import VerificationPanel from '@/components/admin/VerificationPanel';
import UpgradeRequestManager from '@/components/admin/UpgradeRequestManager';
import PaymentManager from '@/components/admin/PaymentManager';
import NotificationCenter from '@/components/admin/NotificationCenter';
import AutomatedWorkflows from '@/components/admin/AutomatedWorkflows';
import BlogManagement from '@/components/admin/BlogManagement';
import { LyricalWorksManager } from '@/components/admin/LyricalWorksManager';
import OperaDatabaseManager from '@/components/admin/OperaDatabaseManager';
import NoticeManager from '@/components/admin/NoticeManager';
import { QuickResendInvitation } from '@/components/admin/QuickResendInvitation';
import PromoCodeManager from '@/components/admin/PromoCodeManager';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, useSearchParams, useNavigate } from 'react-router-dom';
import { Menu, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Admin = () => {
  const { userRoles, isLoading } = useUserRoles();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => searchParams.get('tab') || 'artists');

  useEffect(() => {
    const currentTab = searchParams.get('tab');
    if (currentTab && currentTab !== activeTab) {
      setActiveTab(currentTab);
    }
  }, [searchParams]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const handleProfileClick = () => {
    navigate('/admin-profile');
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Chargement...</div>;
  }

  const isAdmin = userRoles?.some(role => role.role === 'admin');

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'artists':
        return <FreeAccountsPanel accountType="artist" />;
      case 'professionals':
        return <FreeAccountsPanel accountType="professional" />;
      case 'verification':
        return <VerificationPanel />;
      case 'upgrades':
        return <UpgradeRequestManager />;
      case 'payments':
        return <PaymentManager />;
      case 'notifications':
        return <NotificationCenter />;
      case 'workflows':
        return <AutomatedWorkflows />;
      case 'invitations':
        return <QuickResendInvitation />;
      case 'promo-codes':
        return <PromoCodeManager />;
      case 'translations':
        return <div className="p-6">Translation Manager - Coming Soon</div>;
      case 'lyrical-works':
        return <LyricalWorksManager />;
      case 'blog':
        return <BlogManagement />;
      case 'opera-database':
        return <OperaDatabaseManager />;
      case 'notices':
        return <NoticeManager />;
      default:
        return <FreeAccountsPanel accountType="artist" />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar activeTab={activeTab} onTabChange={handleTabChange} />
        
        <main className="flex-1 flex flex-col">
          <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
            <div className="flex items-center">
              <SidebarTrigger className="mr-4">
                <Menu className="h-4 w-4" />
              </SidebarTrigger>
              <div>
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-600 dark:text-gold-400 mb-1">
                  <span className="h-px w-6 bg-gold-500/60" />
                  Espace privé
                </div>
                <h1 className="text-2xl md:text-3xl font-serif font-semibold tracking-tight text-foreground leading-tight">
                  Administration
                </h1>
                <div className="mt-2 h-[2px] w-12 rounded-full bg-gradient-to-r from-gold-500 to-gold-300" />
                <p className="text-muted-foreground text-sm mt-2">Gestion de la plateforme Lyrisphere</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleProfileClick}
                className="flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                Mon profil
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-2 text-muted-foreground hover:text-destructive"
              >
                <LogOut className="h-4 w-4" />
                Déconnexion
              </Button>
            </div>
          </header>

          <div className="flex-1 p-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Admin;
