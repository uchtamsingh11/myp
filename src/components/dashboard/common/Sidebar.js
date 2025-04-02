'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { supabase } from '../../../utils/supabase';
import { useAuth } from '../../../contexts/AuthContext';

export default function Sidebar({ onMenuItemClick, activeMenuItem, isAdmin = false }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { signOut } = useAuth();

  // State for tracking which menu is open
  const [tradingViewOpen, setTradingViewOpen] = useState(false);
  const [scalpingToolOpen, setScalpingToolOpen] = useState(false);
  const [copyTradingOpen, setCopyTradingOpen] = useState(false);
  const [marketplaceOpen, setMarketplaceOpen] = useState(false);
  const [backTestOpen, setBackTestOpen] = useState(false);
  const [optimizationOpen, setOptimizationOpen] = useState(false);
  const [myDeveloperOpen, setMyDeveloperOpen] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  // State for tracking which menu item is active
  const [activeItem, setActiveItem] = useState(
    activeMenuItem ||
    (typeof window !== 'undefined' && sessionStorage.getItem('dashboardActiveMenuItem')) ||
    'Dashboard'
  );

  // Set active menu item based on current pathname when page loads/refreshes
  useEffect(() => {
    // This will run when the component mounts or pathname changes
    if (pathname) {
      const tab = searchParams.get('tab');
      const newActiveItem = getActiveMenuItemFromPath(pathname, tab);
      console.log('Path changed, setting active item to:', newActiveItem, 'Path:', pathname, 'Tab:', tab);

      // CRITICAL FIX: Force immediate update for Trading View pages with tab parameters
      if (pathname.startsWith('/dashboard/trading-view')) {
        let forcedActiveItem;

        if (tab === 'manage') forcedActiveItem = 'Trading View: Manage';
        else if (tab === 'webhook') forcedActiveItem = 'Trading View: Webhook URL';
        else if (tab === 'json') forcedActiveItem = 'Trading View: JSON Generator';
        else if (tab === 'symbol') forcedActiveItem = 'Trading View: Symbol';
        else if (tab === 'logs') forcedActiveItem = 'Trading View: Trade Logs';
        else forcedActiveItem = 'Trading View';

        console.log('FORCE UPDATING to:', forcedActiveItem);
        setActiveItem(forcedActiveItem);

        // Force update session storage too
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('dashboardActiveMenuItem', forcedActiveItem);
        }

        // Auto-expand the menu 
        setTradingViewOpen(true);
        return;
      }

      setActiveItem(newActiveItem);

      // Auto-expand submenus based on the current path
      if (newActiveItem.includes('Trading View')) {
        setTradingViewOpen(true);
      } else if (newActiveItem.includes('Scalping Tool')) {
        setScalpingToolOpen(true);
      } else if (newActiveItem.includes('Copy Trading')) {
        setCopyTradingOpen(true);
      } else if (newActiveItem.includes('Marketplace')) {
        setMarketplaceOpen(true);
      } else if (newActiveItem.includes('Back Test')) {
        setBackTestOpen(true);
      } else if (newActiveItem.includes('Optimization')) {
        setOptimizationOpen(true);
      } else if (newActiveItem.includes('My Developer')) {
        setMyDeveloperOpen(true);
      } else if (newActiveItem.includes('Admin')) {
        setAdminOpen(true);
      }

      // Store it in session storage
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('dashboardActiveMenuItem', newActiveItem);
      }
    }
  }, [pathname, searchParams]);

  // Sync activeItem with the prop when it changes
  useEffect(() => {
    if (activeMenuItem && activeMenuItem !== activeItem) {
      setActiveItem(activeMenuItem);

      // Auto-expand submenus based on activeMenuItem
      if (activeMenuItem.includes('Trading View')) {
        setTradingViewOpen(true);
      } else if (activeMenuItem.includes('Scalping Tool')) {
        setScalpingToolOpen(true);
      } else if (activeMenuItem.includes('Copy Trading')) {
        setCopyTradingOpen(true);
      } else if (activeMenuItem.includes('Marketplace')) {
        setMarketplaceOpen(true);
      } else if (activeMenuItem.includes('Back Test')) {
        setBackTestOpen(true);
      } else if (activeMenuItem.includes('Optimization')) {
        setOptimizationOpen(true);
      } else if (activeMenuItem.includes('My Developer')) {
        setMyDeveloperOpen(true);
      } else if (activeMenuItem.includes('Admin')) {
        setAdminOpen(true);
      }
    }
  }, [activeMenuItem, activeItem]);

  // Function to handle menu item click - completely rewritten to fix menu activation issues
  const handleMenuItemClick = useCallback(
    (itemName, route) => {
      // The order matters here - set the active item last to avoid race conditions

      // Store the active menu item in sessionStorage to preserve it across page refreshes
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('dashboardActiveMenuItem', itemName);
      }

      // Pass the active item to the parent component if needed
      if (onMenuItemClick) {
        onMenuItemClick(itemName);
      }

      // The key fix: set active item *before* navigation to ensure it doesn't get reset
      setActiveItem(itemName);

      // Then navigate to the route if provided
      if (route) {
        router.push(route);
      }

      // Close the sidebar on mobile after clicking a menu item
      if (window.innerWidth < 768) {
        const sidebar = document.querySelector('.sidebar-mobile');
        if (sidebar) {
          sidebar.classList.add('hidden');
        }
      }
    },
    [onMenuItemClick, router]
  );

  // Function to determine if a menu item is active - simplified to make behavior more consistent
  const isActive = useCallback((itemName) => {
    // Special explicit handling for TradingView items
    if (itemName === 'Trading View') {
      // Parent item is ONLY active when it's exactly Trading View with no colon
      return activeItem === 'Trading View' && !activeItem.includes(':');
    }

    // For Trading View submenu items, strict exact match required
    if (itemName.startsWith('Trading View:')) {
      return itemName === activeItem;
    }

    // Special cases for FAQ, Support, Pricing
    if (itemName === 'FAQ' && (activeItem === 'FAQ' || pathname?.includes('/dashboard/faq'))) {
      return true;
    }

    if (itemName === 'Support' && (activeItem === 'Support' || pathname?.includes('/dashboard/support'))) {
      return true;
    }

    if (itemName === 'Pricing' && (activeItem === 'Pricing' || pathname?.includes('/dashboard/pricing'))) {
      return true;
    }

    // For Dashboard, only match exactly
    if (itemName === 'Dashboard') {
      return activeItem === 'Dashboard' && pathname === '/dashboard';
    }

    // For everything else, just do exact match
    return itemName === activeItem;
  }, [activeItem, pathname]);

  // Function to toggle a menu's open state and close others
  const toggleMenu = menuName => {
    switch (menuName) {
      case 'Trading View':
        setTradingViewOpen(!tradingViewOpen);
        break;
      case 'Scalping Tool':
        setScalpingToolOpen(!scalpingToolOpen);
        break;
      case 'Copy Trading':
        setCopyTradingOpen(!copyTradingOpen);
        break;
      case 'Marketplace':
        setMarketplaceOpen(!marketplaceOpen);
        break;
      case 'Back Test':
        setBackTestOpen(!backTestOpen);
        break;
      case 'Optimization':
        setOptimizationOpen(!optimizationOpen);
        break;
      case 'My Developer':
        setMyDeveloperOpen(!myDeveloperOpen);
        break;
      case 'Pricing':
        setPricingOpen(!pricingOpen);
        break;
      case 'FAQ':
        setFaqOpen(!faqOpen);
        break;
      case 'Support':
        setSupportOpen(!supportOpen);
        break;
      case 'Admin':
        setAdminOpen(!adminOpen);
        break;
    }
  };

  // Function to render the sidebar content (used by both desktop and mobile views)
  function renderSidebarContent() {
    return (
      <div className="h-full flex flex-col bg-zinc-950 border-r border-zinc-800 w-[240px] text-white overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-indigo-600 scrollbar-track-zinc-900">
        <ul className="space-y-1 p-3 flex-grow w-full">
          <li className="w-full">
            <a
              href="#"
              className={`flex items-center p-2 rounded-lg transition-colors w-full ${isActive('Dashboard')
                ? 'bg-zinc-800 text-white'
                : 'hover:bg-zinc-800 text-zinc-300'
                }`}
              onClick={e => {
                e.preventDefault();
                handleMenuItemClick('Dashboard', '/dashboard');
              }}
            >
              <img src="/window.svg" alt="Dashboard" className="w-5 h-5 mr-3" />
              <span>Dashboard</span>
            </a>
          </li>
          <hr className="my-2 border-zinc-800" />
          <li className="w-full">
            <a
              href="#"
              className={`flex items-center p-2 rounded-lg transition-colors w-full ${isActive('Broker Auth')
                ? 'bg-zinc-800 text-white'
                : 'hover:bg-zinc-800 text-zinc-300'
                }`}
              onClick={e => {
                e.preventDefault();
                handleMenuItemClick('Broker Auth', '/dashboard/broker-auth');
              }}
            >
              <img src="/lock.svg" alt="Broker Auth" className="w-5 h-5 mr-3" />
              <span>Broker Auth</span>
            </a>
          </li>

          {/* Admin section - only shown to admin users */}
          {isAdmin && (
            <li className="w-full">
              <div className="relative w-full">
                <button
                  onClick={() => toggleMenu('Admin')}
                  className={`flex items-center w-full p-2 rounded-lg transition-colors w-full ${isActive('Admin') || isActive('Admin Users')
                    ? 'bg-zinc-800 text-white'
                    : 'hover:bg-zinc-800 text-zinc-300'
                    }`}
                >
                  <div
                    className="flex items-center w-full"
                    onClick={e => {
                      e.stopPropagation();
                      // handleMenuItemClick('Admin');
                      toggleMenu('Admin');
                    }}
                  >
                    <img src="/admin.svg" alt="Admin" className="w-5 h-5 mr-3" />
                    <span>Admin</span>
                  </div>
                </button>

                {adminOpen && (
                  <ul className="pl-8 mt-1 space-y-1 w-full">
                    <li className="w-full">
                      <a
                        href="/dashboard/admin/users"
                        className={`flex items-center p-2 text-sm rounded-lg transition-colors w-full ${isActive('Admin Users')
                          ? 'bg-zinc-800 text-white'
                          : 'hover:bg-zinc-800 text-zinc-300'
                          }`}
                        onClick={e => {
                          e.preventDefault();
                          handleMenuItemClick('Admin Users', '/dashboard/admin/users');
                        }}
                      >
                        <span>Users</span>
                      </a>
                    </li>
                  </ul>
                )}
              </div>
            </li>
          )}

          <li className="w-full">
            <div className="relative w-full">
              <button
                onClick={() => toggleMenu('Trading View')}
                className={`flex items-center justify-between w-full p-2 rounded-lg transition-colors w-full ${
                  // Only highlight Trading View parent when *exactly* Trading View with no colons
                  activeItem === 'Trading View' && !activeItem.includes(':')
                    ? 'bg-zinc-800 text-white'
                    : 'hover:bg-zinc-800 text-zinc-300'
                  }`}
              >
                <div
                  className="flex items-center w-full"
                  onClick={e => {
                    e.stopPropagation();
                    // When clicking the parent menu, redirect to the Manage tab instead
                    const itemName = 'Trading View: Manage';
                    setActiveItem(itemName);
                    if (typeof window !== 'undefined') {
                      sessionStorage.setItem('dashboardActiveMenuItem', itemName);
                    }
                    if (onMenuItemClick) onMenuItemClick(itemName);
                    router.push('/dashboard/trading-view?tab=manage');
                    toggleMenu('Trading View');
                  }}
                >
                  <img src="/chart.svg" alt="Trading View" className="w-5 h-5 mr-3" />
                  <span>Trading View</span>
                </div>
                {tradingViewOpen ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>

              {tradingViewOpen && (
                <ul className="py-2 ml-4 pl-2 border-l border-zinc-800 w-full">
                  <li className="w-full">
                    <a
                      href="#"
                      className={`flex items-center p-2 rounded-lg transition-colors w-full ${activeItem === 'Trading View: Manage'
                        ? 'bg-zinc-800 text-white'
                        : 'hover:bg-zinc-800 text-zinc-300'
                        }`}
                      onClick={e => {
                        e.preventDefault();
                        // Cleaner approach to set active item
                        const itemName = 'Trading View: Manage';
                        setActiveItem(itemName);
                        if (typeof window !== 'undefined') {
                          sessionStorage.setItem('dashboardActiveMenuItem', itemName);
                        }
                        // Force active state in parent component if needed
                        if (onMenuItemClick) onMenuItemClick(itemName);
                        router.push('/dashboard/trading-view?tab=manage');
                      }}
                    >
                      <span>Manage</span>
                    </a>
                  </li>
                  <li className="w-full">
                    <a
                      href="#"
                      className={`flex items-center p-2 rounded-lg transition-colors w-full ${activeItem === 'Trading View: Webhook URL'
                        ? 'bg-zinc-800 text-white'
                        : 'hover:bg-zinc-800 text-zinc-300'
                        }`}
                      onClick={e => {
                        e.preventDefault();
                        // Cleaner approach to set active item
                        const itemName = 'Trading View: Webhook URL';
                        setActiveItem(itemName);
                        if (typeof window !== 'undefined') {
                          sessionStorage.setItem('dashboardActiveMenuItem', itemName);
                        }
                        // Force active state in parent component if needed
                        if (onMenuItemClick) onMenuItemClick(itemName);
                        router.push('/dashboard/trading-view?tab=webhook');
                      }}
                    >
                      <span>Webhook URL</span>
                    </a>
                  </li>
                  <li className="w-full">
                    <a
                      href="#"
                      className={`flex items-center p-2 rounded-lg transition-colors w-full ${activeItem === 'Trading View: JSON Generator'
                        ? 'bg-zinc-800 text-white'
                        : 'hover:bg-zinc-800 text-zinc-300'
                        }`}
                      onClick={e => {
                        e.preventDefault();
                        // Cleaner approach to set active item
                        const itemName = 'Trading View: JSON Generator';
                        setActiveItem(itemName);
                        if (typeof window !== 'undefined') {
                          sessionStorage.setItem('dashboardActiveMenuItem', itemName);
                        }
                        // Force active state in parent component if needed
                        if (onMenuItemClick) onMenuItemClick(itemName);
                        router.push('/dashboard/trading-view?tab=json');
                      }}
                    >
                      <span>JSON Generator</span>
                    </a>
                  </li>
                  <li className="w-full">
                    <a
                      href="#"
                      className={`flex items-center p-2 rounded-lg transition-colors w-full ${activeItem === 'Trading View: Symbol'
                        ? 'bg-zinc-800 text-white'
                        : 'hover:bg-zinc-800 text-zinc-300'
                        }`}
                      onClick={e => {
                        e.preventDefault();
                        // Cleaner approach to set active item
                        const itemName = 'Trading View: Symbol';
                        setActiveItem(itemName);
                        if (typeof window !== 'undefined') {
                          sessionStorage.setItem('dashboardActiveMenuItem', itemName);
                        }
                        // Force active state in parent component if needed
                        if (onMenuItemClick) onMenuItemClick(itemName);
                        router.push('/dashboard/trading-view?tab=symbol');
                      }}
                    >
                      <span>Symbol</span>
                    </a>
                  </li>
                  <li className="w-full">
                    <a
                      href="#"
                      className={`flex items-center p-2 rounded-lg transition-colors w-full ${activeItem === 'Trading View: Trade Logs'
                        ? 'bg-zinc-800 text-white'
                        : 'hover:bg-zinc-800 text-zinc-300'
                        }`}
                      onClick={e => {
                        e.preventDefault();
                        // Cleaner approach to set active item
                        const itemName = 'Trading View: Trade Logs';
                        setActiveItem(itemName);
                        if (typeof window !== 'undefined') {
                          sessionStorage.setItem('dashboardActiveMenuItem', itemName);
                        }
                        // Force active state in parent component if needed
                        if (onMenuItemClick) onMenuItemClick(itemName);
                        router.push('/dashboard/trading-view?tab=logs');
                      }}
                    >
                      <span>Trade Logs</span>
                    </a>
                  </li>
                </ul>
              )}
            </div>
          </li>
          <li className="w-full">
            <div className="relative w-full">
              <button
                onClick={() => toggleMenu('Scalping Tool')}
                className={`flex items-center justify-between w-full p-2 rounded-lg transition-colors w-full ${
                  // Only highlight Scalping Tool parent when exactly that with no spaces
                  activeItem === 'Scalping Tool' && !activeItem.includes(' ')
                    ? 'bg-zinc-800 text-white'
                    : 'hover:bg-zinc-800 text-zinc-300'
                  }`}
              >
                <div
                  className="flex items-center w-full"
                  onClick={e => {
                    e.stopPropagation();
                    // When clicking the parent menu, redirect to the Manage tab
                    const itemName = 'Scalping Tool Manage';
                    setActiveItem(itemName);
                    if (typeof window !== 'undefined') {
                      sessionStorage.setItem('dashboardActiveMenuItem', itemName);
                    }
                    if (onMenuItemClick) onMenuItemClick(itemName);
                    router.push('/dashboard/scalping-tool?tab=manage');
                    toggleMenu('Scalping Tool');
                  }}
                >
                  <img src="/scalping.svg" alt="Scalping Tool" className="w-5 h-5 mr-3" />
                  <span>Scalping Tool</span>
                </div>
                {scalpingToolOpen ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>

              {scalpingToolOpen && (
                <ul className="pl-8 mt-1 space-y-1 w-full">
                  <li className="w-full">
                    <a
                      href="/dashboard/scalping-tool"
                      className={`flex items-center p-2 text-sm rounded-lg transition-colors w-full ${isActive('Scalping Tool Manage')
                        ? 'bg-zinc-800 text-white'
                        : 'hover:bg-zinc-800 text-zinc-300'
                        }`}
                      onClick={(e) => {
                        e.preventDefault();
                        handleMenuItemClick('Scalping Tool Manage', '/dashboard/scalping-tool?tab=manage');
                      }}
                    >
                      <span>Manage</span>
                    </a>
                  </li>
                </ul>
              )}
            </div>
          </li>
          <li className="w-full">
            <div className="relative w-full">
              <button
                onClick={() => toggleMenu('Copy Trading')}
                className={`flex items-center justify-between w-full p-2 rounded-lg transition-colors w-full ${
                  // Only highlight Copy Trading parent when exactly that with no spaces
                  activeItem === 'Copy Trading' && !activeItem.includes(' ')
                    ? 'bg-zinc-800 text-white'
                    : 'hover:bg-zinc-800 text-zinc-300'
                  }`}
              >
                <div
                  className="flex items-center w-full"
                  onClick={e => {
                    e.stopPropagation();
                    // handleMenuItemClick('Copy Trading');
                    toggleMenu('Copy Trading');
                  }}
                >
                  <img src="/copy-trading.svg" alt="Copy Trading" className="w-5 h-5 mr-3" />
                  <span>Copy Trading</span>
                </div>
                {copyTradingOpen ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>

              {copyTradingOpen && (
                <ul className="pl-8 mt-1 space-y-1 w-full">
                  <li className="w-full">
                    <a
                      href="/dashboard/copy-trading"
                      className={`flex items-center p-2 text-sm rounded-lg transition-colors w-full ${isActive('Copy Trading Manage')
                        ? 'bg-zinc-800 text-white'
                        : 'hover:bg-zinc-800 text-zinc-300'
                        }`}
                      onClick={() =>
                        handleMenuItemClick('Copy Trading Manage', '/dashboard/copy-trading')
                      }
                    >
                      <span>Manage</span>
                    </a>
                  </li>
                </ul>
              )}
            </div>
          </li>
          <li className="w-full">
            <div className="relative w-full">
              <button
                onClick={e => {
                  e.preventDefault();
                  handleMenuItemClick('Marketplace', '/dashboard/marketplace');
                }}
                className={`flex items-center w-full p-2 rounded-lg transition-colors w-full ${isActive('Marketplace')
                  ? 'bg-zinc-800 text-white'
                  : 'hover:bg-zinc-800 text-zinc-300'
                  }`}
              >
                <div className="flex items-center w-full">
                  <img src="/market.svg" alt="Marketplace" className="w-5 h-5 mr-3" />
                  <span>Marketplace</span>
                </div>
              </button>
            </div>
          </li>
          <li className="w-full">
            <div className="relative w-full">
              <button
                onClick={e => {
                  e.preventDefault();
                  handleMenuItemClick('Back Test', '/dashboard/backtest');
                }}
                className={`flex items-center w-full p-2 rounded-lg transition-colors w-full ${isActive('Back Test')
                  ? 'bg-zinc-800 text-white'
                  : 'hover:bg-zinc-800 text-zinc-300'
                  }`}
              >
                <div className="flex items-center w-full">
                  <img src="/chart.svg" alt="Back Test" className="w-5 h-5 mr-3" />
                  <span>Back Test</span>
                </div>
              </button>
            </div>
          </li>
          <li className="w-full">
            <div className="relative w-full">
              <button
                onClick={e => {
                  e.preventDefault();
                  handleMenuItemClick('Optimization', '/dashboard/optimization');
                }}
                className={`flex items-center w-full p-2 rounded-lg transition-colors w-full ${isActive('Optimization')
                  ? 'bg-zinc-800 text-white'
                  : 'hover:bg-zinc-800 text-zinc-300'
                  }`}
              >
                <div className="flex items-center w-full">
                  <img src="/settings.svg" alt="Optimization" className="w-5 h-5 mr-3" />
                  <span>Optimization</span>
                </div>
              </button>
            </div>
          </li>
          <li className="w-full">
            <div className="relative w-full">
              <button
                onClick={e => {
                  e.preventDefault();
                  handleMenuItemClick('My Developer', '/dashboard/developer');
                }}
                className={`flex items-center w-full p-2 rounded-lg transition-colors w-full ${isActive('My Developer')
                  ? 'bg-zinc-800 text-white'
                  : 'hover:bg-zinc-800 text-zinc-300'
                  }`}
              >
                <div className="flex items-center w-full">
                  <img src="/developer.svg" alt="My Developer" className="w-5 h-5 mr-3" />
                  <span>My Developer</span>
                </div>
              </button>
            </div>
          </li>
          <li className="w-full">
            <div className="relative w-full">
              <button
                onClick={e => {
                  e.preventDefault();
                  handleMenuItemClick('Pricing', '/dashboard/pricing');
                }}
                className={`flex items-center w-full p-2 rounded-lg transition-colors w-full ${isActive('Pricing')
                  ? 'bg-zinc-800 text-white'
                  : 'hover:bg-zinc-800 text-zinc-300'
                  }`}
              >
                <div className="flex items-center">
                  <img src="/file.svg" alt="Pricing" className="w-5 h-5 mr-3" />
                  <span>Pricing</span>
                </div>
              </button>
            </div>
          </li>
          <hr className="my-2 border-zinc-800" />
          <li className="w-full">
            <a
              href="/dashboard/faq"
              className={`flex items-center p-2 rounded-lg transition-colors w-full ${isActive('FAQ')
                ? 'bg-zinc-800 text-white'
                : 'hover:bg-zinc-800 text-zinc-300'
                }`}
              onClick={(e) => {
                e.preventDefault();
                // Explicitly set active item to FAQ
                setActiveItem('FAQ');
                if (typeof window !== 'undefined') {
                  sessionStorage.setItem('dashboardActiveMenuItem', 'FAQ');
                }
                handleMenuItemClick('FAQ', '/dashboard/faq');
              }}
            >
              <img src="/faq.svg" alt="FAQ" className="w-5 h-5 mr-3" />
              <span>FAQ</span>
            </a>
          </li>
          <li className="w-full">
            <a
              href="/dashboard/support"
              className={`flex items-center p-2 rounded-lg transition-colors w-full ${isActive('Support')
                ? 'bg-zinc-800 text-white'
                : 'hover:bg-zinc-800 text-zinc-300'
                }`}
              onClick={(e) => {
                e.preventDefault();
                // Explicitly set active item to Support
                setActiveItem('Support');
                if (typeof window !== 'undefined') {
                  sessionStorage.setItem('dashboardActiveMenuItem', 'Support');
                }
                handleMenuItemClick('Support', '/dashboard/support');
              }}
            >
              <img src="/support.svg" alt="Support" className="w-5 h-5 mr-3" />
              <span>Support</span>
            </a>
          </li>
          <hr className="my-2 border-zinc-800" />
          <li className="w-full">
            <a
              href="#"
              className={`flex items-center p-2 text-zinc-300 rounded-lg hover:bg-zinc-800 transition-colors w-full ${isActive('Logout')
                ? 'bg-zinc-800 text-white'
                : ''
                }`}
              onClick={e => {
                e.preventDefault();
                signOut();
              }}
            >
              <img src="/logout.svg" alt="Logout" className="w-5 h-5 mr-3" />
              <span>Logout</span>
            </a>
          </li>
        </ul>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-64 md:min-w-[16rem] bg-zinc-950 border-r border-zinc-800 min-h-[calc(100vh-64px)] transition-all duration-300 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-indigo-600 max-h-[calc(100vh-64px)] hidden md:block">
        <nav className="p-4 w-full">{renderSidebarContent()}</nav>
      </aside>

      {/* Mobile Sidebar - Fix for bottom scrollbar */}
      <div className="md:hidden w-full bg-zinc-950 overflow-hidden">
        <nav className="w-full overflow-x-hidden">{renderSidebarContent()}</nav>
      </div>
    </>
  );
}

// Helper function to determine active menu item from pathname
function getActiveMenuItemFromPath(path, tab = null) {
  // Special handling for specific pages to ensure they're exclusively highlighted
  if (path === '/dashboard/faq' || path.includes('/dashboard/faq/')) {
    return 'FAQ';
  }

  if (path === '/dashboard/support' || path.includes('/dashboard/support/')) {
    return 'Support';
  }

  if (path === '/dashboard/pricing') {
    return 'Pricing';
  }

  // Only return Dashboard for the exact dashboard path
  if (path === '/dashboard') {
    return 'Dashboard';
  }

  // Other paths
  if (path === '/dashboard/broker-auth') return 'Broker Auth';

  // Special case for Trading View to ensure submenus are properly selected
  if (path.startsWith('/dashboard/trading-view')) {
    // Check for tab query parameter - MUST prioritize submenu items
    if (tab === 'manage') return 'Trading View: Manage';
    else if (tab === 'webhook') return 'Trading View: Webhook URL';
    else if (tab === 'json') return 'Trading View: JSON Generator';
    else if (tab === 'symbol') return 'Trading View: Symbol';
    else if (tab === 'logs') return 'Trading View: Trade Logs';
    // Only return this if no valid submenu is active
    else return 'Trading View';
  }

  if (path.startsWith('/dashboard/scalping-tool')) {
    // Check for tab query parameter - similar to Trading View
    if (tab === 'manage') return 'Scalping Tool Manage';
    // Add more tabs here as they're created
    // Only return this if no valid submenu is active
    else return 'Scalping Tool';
  }

  if (path.startsWith('/dashboard/copy-trading')) {
    if (path.includes('/strategy')) return 'Copy Trading Strategy';
    return 'Copy Trading Manage';
  }

  if (path.startsWith('/dashboard/marketplace')) return 'Marketplace';
  if (path.startsWith('/dashboard/backtest')) return 'Back Test';
  if (path.startsWith('/dashboard/optimization')) return 'Optimization';
  if (path.startsWith('/dashboard/developer')) return 'My Developer';
  if (path.startsWith('/dashboard/admin')) return 'Admin Users';

  // If nothing else matches, return empty string to avoid default Dashboard highlighting
  return '';
}
