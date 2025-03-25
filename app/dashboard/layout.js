'use client';

import { useState, useEffect, Suspense, lazy } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '../../src/utils/supabase';
import { getCurrentUserProfile } from '../../src/utils/auth/profile';
import Sidebar from '../components/dashboard/Sidebar';
import DashboardHeader from '../components/dashboard/DashboardHeader';

// Admin email
const ADMIN_EMAIL = 'uchtamsingh@gmail.com';

// Loading component for suspense fallback
const Loading = () => (
  <div className="flex items-center justify-center h-screen w-full">
    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [userProfile, setUserProfile] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Determine active menu item based on pathname
  const getActiveMenuItem = () => {
    if (pathname === '/dashboard') return 'Dashboard';
    if (pathname === '/dashboard/broker-auth') return 'Broker Auth';
    
    // Trading View - single consolidated page with tabs
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
    
    if (pathname === '/dashboard/support') return 'Support';
    if (pathname === '/dashboard/support/contact-us') return 'Support Contact Us';
    if (pathname === '/dashboard/support/submit-ticket') return 'Support Submit Ticket';
    if (pathname === '/dashboard/support/live-chat') return 'Support Live Chat';
    
    return 'Dashboard'; // Default
  };

  // Set active menu item
  const [activeMenuItem, setActiveMenuItem] = useState(getActiveMenuItem());

  // Update active menu item when pathname changes
  useEffect(() => {
    setActiveMenuItem(getActiveMenuItem());
  }, [pathname]);

  // Handle menu item click
  const handleMenuItemClick = (menuItem) => {
    setActiveMenuItem(menuItem);
  };

  // Check if user is authenticated and get profile
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // If no session, redirect to auth page
          router.push('/auth');
          return;
        }
        
        // Get user email from session
        const userEmail = session.user.email;
        setUserEmail(userEmail);
        
        // Check if user is admin
        setIsAdmin(userEmail === ADMIN_EMAIL);
        
        // Get user profile
        try {
          const profile = await getCurrentUserProfile();
          setUserProfile(profile);
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
        
        // Set loading to false
        setLoading(false);
      } catch (error) {
        console.error('Error checking auth:', error);
        router.push('/auth');
      }
    };
    
    checkAuth();
  }, [router]);

  // If loading, show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-950 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-950 min-h-screen flex flex-col">
      <DashboardHeader userEmail={userEmail} />
      <div className="flex flex-1 mt-[64px]">
        <aside className="fixed top-[64px] left-0 h-[calc(100vh-64px)] z-10">
          <Sidebar 
            onMenuItemClick={handleMenuItemClick}
            activeMenuItem={activeMenuItem}
            isAdmin={isAdmin}
          />
        </aside>
        <main className="flex-1 ml-[240px] p-6 overflow-auto">
          <Suspense fallback={<Loading />}>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
}
