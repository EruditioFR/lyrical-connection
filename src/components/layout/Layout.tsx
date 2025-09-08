
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import Navbar from './Navbar';
import Footer from './Footer';
import NavigationBreadcrumb from './NavigationBreadcrumb';
import AccountDeactivatedMessage from '@/components/auth/AccountDeactivatedMessage';

import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, isAccountActive } = useAuth();
  
  // Initialize realtime notifications
  useRealtimeNotifications();

  // If user is authenticated but account is deactivated, show deactivation message
  if (user && !isAccountActive) {
    return <AccountDeactivatedMessage />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <NavigationBreadcrumb />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
