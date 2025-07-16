
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FreeAccountsPanel from '@/components/admin/FreeAccountsPanel';
import VerificationPanel from '@/components/admin/VerificationPanel';
import UpgradeRequestManager from '@/components/admin/UpgradeRequestManager';
import PaymentManager from '@/components/admin/PaymentManager';
import NotificationCenter from '@/components/admin/NotificationCenter';
import AutomatedWorkflows from '@/components/admin/AutomatedWorkflows';
import { TranslationManager } from '@/components/admin/TranslationManager';
import { useUserRoles } from '@/hooks/useUserRoles';
import { Navigate } from 'react-router-dom';
import { Users, Building2, CheckCircle, CreditCard, Bell, Settings, Languages } from 'lucide-react';

const Admin = () => {
  const { userRoles, isLoading } = useUserRoles();

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Chargement...</div>;
  }

  const isAdmin = userRoles?.some(role => role.role === 'admin');

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Administration</h1>
          <p className="text-gray-600 mt-2">Gestion de la plateforme Lyrisphere</p>
        </div>

        <Tabs defaultValue="artists" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="artists" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Artistes
            </TabsTrigger>
            <TabsTrigger value="professionals" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Professionnels
            </TabsTrigger>
            <TabsTrigger value="verification" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Vérification
            </TabsTrigger>
            <TabsTrigger value="upgrades" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Upgrades
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Paiements
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="workflows" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Workflows
            </TabsTrigger>
            <TabsTrigger value="translations" className="flex items-center gap-2">
              <Languages className="h-4 w-4" />
              Traductions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="artists" className="space-y-6">
            <FreeAccountsPanel accountType="artist" />
          </TabsContent>

          <TabsContent value="professionals" className="space-y-6">
            <FreeAccountsPanel accountType="professional" />
          </TabsContent>

          <TabsContent value="verification" className="space-y-6">
            <VerificationPanel />
          </TabsContent>

          <TabsContent value="upgrades" className="space-y-6">
            <UpgradeRequestManager />
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <PaymentManager />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <NotificationCenter />
          </TabsContent>

          <TabsContent value="workflows" className="space-y-6">
            <AutomatedWorkflows />
          </TabsContent>

          <TabsContent value="translations" className="space-y-6">
            <TranslationManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
