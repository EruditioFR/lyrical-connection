
import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import NavigationBreadcrumb from './NavigationBreadcrumb';

import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  // Initialize realtime notifications
  useRealtimeNotifications();

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
