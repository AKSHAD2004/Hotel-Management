import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { NotificationProvider } from './context/NotificationContext';
import { OrderProvider } from './context/OrderContext';

import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Login } from './components/Login';
import { NotificationToast } from './components/NotificationToast';

import { WaiterDashboard } from './views/WaiterDashboard';
import { ChefDashboard } from './views/ChefDashboard';
import { OwnerDashboard } from './views/OwnerDashboard';
import { OrderHistoryView } from './views/OrderHistoryView';
import { TableManagementView } from './views/TableManagementView';
import { ReportsView } from './views/ReportsView';
import { ProfileView } from './views/ProfileView';

const MainContent = () => {
  const { user, isAuthenticated } = useAuth();
  const [activeView, setActiveView] = useState('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  if (!isAuthenticated) {
    return <Login />;
  }

  // Render view based on active tab and user role
  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        if (user.role === 'waiter') return <WaiterDashboard />;
        if (user.role === 'chef') return <ChefDashboard />;
        if (user.role === 'owner') return <OwnerDashboard setActiveView={setActiveView} />;
        return <WaiterDashboard />;
      case 'new_order':
      case 'active_orders':
        return <WaiterDashboard />;
      case 'incoming_orders':
      case 'waiting_orders':
      case 'completed_orders':
        return <ChefDashboard />;
      case 'payment_pending':
      case 'payment_history':
        return <OwnerDashboard setActiveView={setActiveView} />;
      case 'order_history':
        return <OrderHistoryView />;
      case 'tables':
        return <TableManagementView />;
      case 'reports':
        return <ReportsView />;
      case 'profile':
        return <ProfileView />;
      default:
        return <WaiterDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Header Navbar */}
      <Navbar
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        isMobileSidebarOpen={isMobileSidebarOpen}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Navigation Sidebar */}
        <Sidebar
          activeView={activeView}
          setActiveView={setActiveView}
          isMobileOpen={isMobileSidebarOpen}
          setIsMobileOpen={setIsMobileSidebarOpen}
        />

        {/* Dynamic View Workspace */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto pb-24 lg:pb-8">
          {renderView()}
        </main>
      </div>

      {/* Global Real-Time Toast Notifications */}
      <NotificationToast />
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <NotificationProvider>
        <AuthProvider>
          <OrderProvider>
            <MainContent />
          </OrderProvider>
        </AuthProvider>
      </NotificationProvider>
    </LanguageProvider>
  );
}
