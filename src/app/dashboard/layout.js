'use client';

import { useState, useEffect, Suspense } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '../../components/dashboard/Sidebar';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';

// Admin email
const ADMIN_EMAIL = 'uchtamsingh@gmail.com';

// Loading component
const Loading = () => (
  <div className="flex items-center justify-center h-screen w-full">
    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState(getActiveMenuItem(pathname));

  // Immediately redirect if no user
  useEffect(() => {
    if (!isLoading && !user) {
      console.log('Dashboard layout: No user found, redirecting');
      window.location.replace('/auth');
    }
  }, [user, isLoading]);

  // Update active menu item when pathname changes
  useEffect(() => {
    setActiveMenuItem(getActiveMenuItem(pathname));
  }, [pathname]);

  // Check if user is admin
  useEffect(() => {
    setIsAdmin(user?.email === ADMIN_EMAIL);
  }, [user]);

  if (isLoading) {
    return <Loading />;
  }

  // Extra protection against unauthorized access
  if (!user) {
    // If we somehow got here without a user, show loading and redirect
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400">Access denied. Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="bg-zinc-950 min-h-screen flex flex-col">
        <DashboardHeader userEmail={user?.email || ''} />
        <div className="flex flex-1 mt-[64px]">
          <aside className="fixed top-[64px] left-0 h-[calc(100vh-64px)] z-10">
            <Sidebar
              onMenuItemClick={setActiveMenuItem}
              activeMenuItem={activeMenuItem}
              isAdmin={isAdmin}
            />
          </aside>
          <main className="flex-1 ml-[240px] p-6 overflow-auto">
            <Suspense fallback={<Loading />}>{children}</Suspense>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

// Helper function to determine active menu item
function getActiveMenuItem(pathname) {
  if (pathname === '/dashboard') return 'Dashboard';
  if (pathname === '/dashboard/broker-auth') return 'Broker Auth';
  if (pathname.startsWith('/dashboard/trading-view')) return 'Trading View';
  if (pathname === '/dashboard/scalping-tool') return 'Scalping Tool Manage';
  if (pathname === '/dashboard/scalping-tool/scalp-tool') return 'Scalping Tool Scalp Tool';
  if (pathname === '/dashboard/copy-trading') return 'Copy Trading Manage';
  if (pathname === '/dashboard/copy-trading/strategy') return 'Copy Trading Strategy';
  if (pathname === '/dashboard/strategy') return 'Strategy';
  if (pathname === '/dashboard/strategy/pine-script') return 'Strategy Pine Script';
  if (pathname === '/dashboard/strategy/mql') return 'Strategy MQL';
  if (pathname === '/dashboard/strategy/afl') return 'Strategy AFL';
  if (pathname === '/dashboard/bots') return 'Bots My Bots';
  if (pathname === '/dashboard/bots/nse-bse') return 'Bots NSE/BSE';
  if (pathname === '/dashboard/bots/forex') return 'Bots Forex';
  if (pathname === '/dashboard/bots/crypto') return 'Bots Crypto';
  if (pathname === '/dashboard/pricing') return 'Pricing';
  if (pathname === '/dashboard/faq') return 'FAQ';
  if (pathname === '/dashboard/support') return 'Support';
  if (pathname === '/dashboard/support/contact-us') return 'Support Contact Us';
  if (pathname === '/dashboard/support/submit-ticket') return 'Support Submit Ticket';
  if (pathname === '/dashboard/support/live-chat') return 'Support Live Chat';
  return 'Dashboard'; // Default
}