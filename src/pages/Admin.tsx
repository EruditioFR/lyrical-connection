
import React, { useState } from 'react';
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
import { useUserRoles } from '@/hooks/useUserRoles';
import { Navigate } from 'react-router-dom';
import { Menu } from 'lucide-react';

const Admin = () => {
  const { userRoles, isLoading } = useUserRoles();
  const [activeTab, setActiveTab] = useState('artists');

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
        <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        
        <main className="flex-1 flex flex-col">
          <header className="h-16 border-b border-border bg-card flex items-center px-6">
            <SidebarTrigger className="mr-4">
              <Menu className="h-4 w-4" />
            </SidebarTrigger>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Administration</h1>
              <p className="text-muted-foreground text-sm">Gestion de la plateforme Lyrisphere</p>
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
