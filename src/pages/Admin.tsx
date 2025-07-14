
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FreeAccountsPanel } from '@/components/admin/FreeAccountsPanel';
import { VerificationPanel } from '@/components/admin/VerificationPanel';
import { UpgradeRequestManager } from '@/components/admin/UpgradeRequestManager';
import { PaymentManager } from '@/components/admin/PaymentManager';
import { NotificationCenter } from '@/components/admin/NotificationCenter';
import { AutomatedWorkflows } from '@/components/admin/AutomatedWorkflows';
import { TranslationManager } from '@/components/admin/TranslationManager';
import { useUserRoles } from '@/hooks/useUserRoles';
import { Navigate } from 'react-router-dom';

const Admin = () => {
  const { data: userRoles, isLoading } = useUserRoles();

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
          <p className="text-gray-600 mt-2">Gestion de la plateforme Lyrical Connection</p>
        </div>

        <Tabs defaultValue="accounts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="accounts">Comptes</TabsTrigger>
            <TabsTrigger value="verification">Vérification</TabsTrigger>
            <TabsTrigger value="upgrades">Upgrades</TabsTrigger>
            <TabsTrigger value="payments">Paiements</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="workflows">Workflows</TabsTrigger>
            <TabsTrigger value="translations">Traductions</TabsTrigger>
          </TabsList>

          <TabsContent value="accounts" className="space-y-6">
            <FreeAccountsPanel />
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
