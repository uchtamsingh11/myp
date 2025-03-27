'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../../contexts/AuthContext';

export default function Sidebar({ onMenuItemClick, activeMenuItem, isAdmin = false }) {
  const router = useRouter();
  const pathname = usePathname();
  const { signOut } = useAuth();

  // State for tracking which menu is open
  const [tradingViewOpen, setTradingViewOpen] = useState(false);
  const [scalpingToolOpen, setScalpingToolOpen] = useState(false);
  const [copyTradingOpen, setCopyTradingOpen] = useState(false);
  const [strategyOpen, setStrategyOpen] = useState(false);
  const [botsOpen, setBotsOpen] = useState(false);
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
      } else if (activeMenuItem.includes('Strategy')) {
        setStrategyOpen(true);
      } else if (activeMenuItem.includes('Bots')) {
        setBotsOpen(true);
      } else if (activeMenuItem.includes('Admin')) {
        setAdminOpen(true);
      }
    }
  }, [activeMenuItem, activeItem]);

  // Function to handle menu item click
  const handleMenuItemClick = useCallback(
    (itemName, route) => {
      setActiveItem(itemName);

      // Store the active menu item in sessionStorage to preserve it across page refreshes
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('dashboardActiveMenuItem', itemName);
      }

      // Pass the active item to the parent component
      if (onMenuItemClick) {
        onMenuItemClick(itemName);
      }

      // Navigate to the route if provided
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

  // Function to determine if a menu item is active
  const isActive = itemName => activeItem === itemName;

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
      case 'Strategy':
        setStrategyOpen(!strategyOpen);
        break;
      case 'Bots':
        setBotsOpen(!botsOpen);
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
      <div className="h-full flex flex-col bg-zinc-900 border-r border-zinc-800 w-[240px] text-white overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700">
        <ul className="space-y-1 p-3 flex-grow">
          <li>
            <a
              href="#"
              className={`flex items-center p-2 rounded-lg transition-colors ${isActive('Dashboard') ? 'bg-blue-600 text-white' : 'hover:bg-zinc-800 text-zinc-300'}`}
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
          <li>
            <a
              href="#"
              className={`flex items-center p-2 rounded-lg transition-colors ${isActive('Broker Auth') ? 'bg-blue-600 text-white' : 'hover:bg-zinc-800 text-zinc-300'}`}
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
            <li>
              <div className="relative">
                <button
                  onClick={() => toggleMenu('Admin')}
                  className={`flex items-center justify-between w-full p-2 rounded-lg transition-colors ${isActive('Admin') || isActive('Admin Users') ? 'bg-blue-600 text-white' : 'hover:bg-zinc-800 text-zinc-300'}`}
                >
                  <div
                    className="flex items-center"
                    onClick={e => {
                      e.stopPropagation();
                      handleMenuItemClick('Admin');
                      toggleMenu('Admin');
                    }}
                  >
                    <img src="/admin.svg" alt="Admin" className="w-5 h-5 mr-3" />
                    <span>Admin</span>
                  </div>
                  {adminOpen ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>

                {adminOpen && (
                  <ul className="pl-8 mt-1 space-y-1">
                    <li>
                      <a
                        href="/dashboard/admin/users"
                        className={`flex items-center p-2 text-sm rounded-lg transition-colors ${isActive('Admin Users') ? 'bg-blue-600 text-white' : 'hover:bg-zinc-800 text-zinc-300'}`}
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

          <li>
            <div className="relative">
              <button
                onClick={() => toggleMenu('Trading View')}
                className={`flex items-center justify-between w-full p-2 rounded-lg transition-colors ${isActive('Trading View') ? 'bg-blue-600 text-white' : 'hover:bg-zinc-800 text-zinc-300'}`}
              >
                <div
                  className="flex items-center"
                  onClick={e => {
                    e.stopPropagation();
                    handleMenuItemClick('Trading View', '/dashboard/trading-view');
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
                <ul className="py-2 ml-4 pl-2 border-l border-zinc-800">
                  <li>
                    <a
                      href="#"
                      className="flex items-center p-2 text-zinc-300 rounded-lg hover:bg-zinc-800 transition-colors"
                      onClick={e => {
                        e.preventDefault();
                        handleMenuItemClick(
                          'Trading View: Manage',
                          '/dashboard/trading-view?tab=manage'
                        );
                      }}
                    >
                      <span>Manage</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="flex items-center p-2 text-zinc-300 rounded-lg hover:bg-zinc-800 transition-colors"
                      onClick={e => {
                        e.preventDefault();
                        handleMenuItemClick(
                          'Trading View: Webhook URL',
                          '/dashboard/trading-view?tab=webhook'
                        );
                      }}
                    >
                      <span>Webhook URL</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="flex items-center p-2 text-zinc-300 rounded-lg hover:bg-zinc-800 transition-colors"
                      onClick={e => {
                        e.preventDefault();
                        handleMenuItemClick(
                          'Trading View: JSON Generator',
                          '/dashboard/trading-view?tab=json'
                        );
                      }}
                    >
                      <span>JSON Generator</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="flex items-center p-2 text-zinc-300 rounded-lg hover:bg-zinc-800 transition-colors"
                      onClick={e => {
                        e.preventDefault();
                        handleMenuItemClick(
                          'Trading View: Symbol',
                          '/dashboard/trading-view?tab=symbol'
                        );
                      }}
                    >
                      <span>Symbol</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="flex items-center p-2 text-zinc-300 rounded-lg hover:bg-zinc-800 transition-colors"
                      onClick={e => {
                        e.preventDefault();
                        handleMenuItemClick(
                          'Trading View: Trade Logs',
                          '/dashboard/trading-view?tab=logs'
                        );
                      }}
                    >
                      <span>Trade Logs</span>
                    </a>
                  </li>
                </ul>
              )}
            </div>
          </li>
          <li>
            <div className="relative">
              <button
                onClick={() => toggleMenu('Scalping Tool')}
                className={`flex items-center justify-between w-full p-2 rounded-lg transition-colors ${isActive('Scalping Tool') ? 'bg-blue-600 text-white' : 'hover:bg-zinc-800 text-zinc-300'}`}
              >
                <div
                  className="flex items-center"
                  onClick={e => {
                    e.stopPropagation();
                    handleMenuItemClick('Scalping Tool');
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
                <ul className="pl-8 mt-1 space-y-1">
                  <li>
                    <a
                      href="/dashboard/scalping-tool"
                      className={`flex items-center p-2 text-sm rounded-lg transition-colors ${isActive('Scalping Tool Manage') ? 'bg-blue-600 text-white' : 'hover:bg-zinc-800 text-zinc-300'}`}
                      onClick={() =>
                        handleMenuItemClick('Scalping Tool Manage', '/dashboard/scalping-tool')
                      }
                    >
                      <span>Manage</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="/dashboard/scalping-tool/scalp-tool"
                      className={`flex items-center p-2 text-sm rounded-lg transition-colors ${isActive('Scalping Tool Scalp Tool') ? 'bg-blue-600 text-white' : 'hover:bg-zinc-800 text-zinc-300'}`}
                      onClick={() =>
                        handleMenuItemClick(
                          'Scalping Tool Scalp Tool',
                          '/dashboard/scalping-tool/scalp-tool'
                        )
                      }
                    >
                      <span>Scalp Tool</span>
                    </a>
                  </li>
                </ul>
              )}
            </div>
          </li>
          <li>
            <div className="relative">
              <button
                onClick={() => toggleMenu('Copy Trading')}
                className={`flex items-center justify-between w-full p-2 rounded-lg transition-colors ${isActive('Copy Trading') ? 'bg-blue-600 text-white' : 'hover:bg-zinc-800 text-zinc-300'}`}
              >
                <div
                  className="flex items-center"
                  onClick={e => {
                    e.stopPropagation();
                    handleMenuItemClick('Copy Trading');
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
                <ul className="pl-8 mt-1 space-y-1">
                  <li>
                    <a
                      href="/dashboard/copy-trading"
                      className={`flex items-center p-2 text-sm rounded-lg transition-colors ${isActive('Copy Trading Manage') ? 'bg-blue-600 text-white' : 'hover:bg-zinc-800 text-zinc-300'}`}
                      onClick={() =>
                        handleMenuItemClick('Copy Trading Manage', '/dashboard/copy-trading')
                      }
                    >
                      <span>Manage</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="/dashboard/copy-trading/strategy"
                      className={`flex items-center p-2 text-sm rounded-lg transition-colors ${isActive('Copy Trading Strategy') ? 'bg-blue-600 text-white' : 'hover:bg-zinc-800 text-zinc-300'}`}
                      onClick={() =>
                        handleMenuItemClick(
                          'Copy Trading Strategy',
                          '/dashboard/copy-trading/strategy'
                        )
                      }
                    >
                      <span>Strategy</span>
                    </a>
                  </li>
                </ul>
              )}
            </div>
          </li>
          <li>
            <div className="relative">
              <button
                onClick={() => toggleMenu('Strategy')}
                className={`flex items-center justify-between w-full p-2 rounded-lg transition-colors ${isActive('Strategy') ? 'bg-blue-600 text-white' : 'hover:bg-zinc-800 text-zinc-300'}`}
              >
                <div
                  className="flex items-center"
                  onClick={e => {
                    e.stopPropagation();
                    handleMenuItemClick('Strategy');
                    toggleMenu('Strategy');
                  }}
                >
                  <img src="/strategy.svg" alt="Strategy" className="w-5 h-5 mr-3" />
                  <span>Strategy</span>
                </div>
                {strategyOpen ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>

              {strategyOpen && (
                <ul className="pl-8 mt-1 space-y-1">
                  <li>
                    <a
                      href="/dashboard/strategy/pine-script"
                      className={`flex items-center p-2 text-sm rounded-lg transition-colors ${isActive('Strategy Pine Script') ? 'bg-blue-600 text-white' : 'hover:bg-zinc-800 text-zinc-300'}`}
                      onClick={() =>
                        handleMenuItemClick(
                          'Strategy Pine Script',
                          '/dashboard/strategy/pine-script'
                        )
                      }
                    >
                      <span>Pine Script</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="/dashboard/strategy/mql"
                      className={`flex items-center p-2 text-sm rounded-lg transition-colors ${isActive('Strategy MQL') ? 'bg-blue-600 text-white' : 'hover:bg-zinc-800 text-zinc-300'}`}
                      onClick={() => handleMenuItemClick('Strategy MQL', '/dashboard/strategy/mql')}
                    >
                      <span>MQL</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="/dashboard/strategy/afl"
                      className={`flex items-center p-2 text-sm rounded-lg transition-colors ${isActive('Strategy AFL') ? 'bg-blue-600 text-white' : 'hover:bg-zinc-800 text-zinc-300'}`}
                      onClick={() => handleMenuItemClick('Strategy AFL', '/dashboard/strategy/afl')}
                    >
                      <span>AFL</span>
                    </a>
                  </li>
                </ul>
              )}
            </div>
          </li>
          <li>
            <div className="relative">
              <button
                onClick={() => toggleMenu('Bots')}
                className={`flex items-center justify-between w-full p-2 rounded-lg transition-colors ${isActive('Bots') ? 'bg-blue-600 text-white' : 'hover:bg-zinc-800 text-zinc-300'}`}
              >
                <div
                  className="flex items-center"
                  onClick={e => {
                    e.stopPropagation();
                    handleMenuItemClick('Bots');
                    toggleMenu('Bots');
                  }}
                >
                  <img src="/bot.svg" alt="Bots" className="w-5 h-5 mr-3" />
                  <span>Bots</span>
                </div>
                {botsOpen ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>

              {botsOpen && (
                <ul className="pl-8 mt-1 space-y-1">
                  <li>
                    <a
                      href="/dashboard/bots"
                      className={`flex items-center p-2 text-sm rounded-lg transition-colors ${isActive('Bots My Bots') ? 'bg-blue-600 text-white' : 'hover:bg-zinc-800 text-zinc-300'}`}
                      onClick={() => handleMenuItemClick('Bots My Bots', '/dashboard/bots')}
                    >
                      <span>My Bots</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="/dashboard/bots/nse-bse"
                      className={`flex items-center p-2 text-sm rounded-lg transition-colors ${isActive('Bots NSE/BSE') ? 'bg-blue-600 text-white' : 'hover:bg-zinc-800 text-zinc-300'}`}
                      onClick={() => handleMenuItemClick('Bots NSE/BSE', '/dashboard/bots/nse-bse')}
                    >
                      <span>NSE/BSE</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="/dashboard/bots/forex"
                      className={`flex items-center p-2 text-sm rounded-lg transition-colors ${isActive('Bots Forex') ? 'bg-blue-600 text-white' : 'hover:bg-zinc-800 text-zinc-300'}`}
                      onClick={() => handleMenuItemClick('Bots Forex', '/dashboard/bots/forex')}
                    >
                      <span>Forex</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="/dashboard/bots/crypto"
                      className={`flex items-center p-2 text-sm rounded-lg transition-colors ${isActive('Bots Crypto') ? 'bg-blue-600 text-white' : 'hover:bg-zinc-800 text-zinc-300'}`}
                      onClick={() => handleMenuItemClick('Bots Crypto', '/dashboard/bots/crypto')}
                    >
                      <span>Crypto</span>
                    </a>
                  </li>
                </ul>
              )}
            </div>
          </li>
          <li>
            <div className="relative">
              <button
                onClick={e => {
                  e.preventDefault();
                  handleMenuItemClick('Pricing', '/dashboard/pricing');
                }}
                className={`flex items-center w-full p-2 rounded-lg transition-colors ${isActive('Pricing') ? 'bg-blue-600 text-white' : 'hover:bg-zinc-800 text-zinc-300'}`}
              >
                <div className="flex items-center">
                  <img src="/file.svg" alt="Pricing" className="w-5 h-5 mr-3" />
                  <span>Pricing</span>
                </div>
              </button>
            </div>
          </li>
          <hr className="my-2 border-zinc-800" />
          <li>
            <div className="relative">
              <button
                onClick={() => toggleMenu('FAQ')}
                className={`flex items-center justify-between w-full p-2 rounded-lg transition-colors ${isActive('FAQ') ? 'bg-blue-600 text-white' : 'hover:bg-zinc-800 text-zinc-300'}`}
              >
                <div
                  className="flex items-center"
                  onClick={e => {
                    e.stopPropagation();
                    handleMenuItemClick('FAQ');
                    toggleMenu('FAQ');
                  }}
                >
                  <img src="/faq.svg" alt="FAQ" className="w-5 h-5 mr-3" />
                  <span>FAQ</span>
                </div>
                {faqOpen ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>

              {faqOpen && (
                <ul className="pl-8 mt-1 space-y-1">
                  <li>
                    <a
                      href="/dashboard/faq/general"
                      className={`flex items-center p-2 text-sm rounded-lg transition-colors ${isActive('FAQ General') ? 'bg-blue-600 text-white' : 'hover:bg-zinc-800 text-zinc-300'}`}
                      onClick={() => handleMenuItemClick('FAQ General', '/dashboard/faq/general')}
                    >
                      <span>General</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="/dashboard/faq/trading"
                      className={`flex items-center p-2 text-sm rounded-lg transition-colors ${isActive('FAQ Trading') ? 'bg-blue-600 text-white' : 'hover:bg-zinc-800 text-zinc-300'}`}
                      onClick={() => handleMenuItemClick('FAQ Trading', '/dashboard/faq/trading')}
                    >
                      <span>Trading</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="/dashboard/faq/billing"
                      className={`flex items-center p-2 text-sm rounded-lg transition-colors ${isActive('FAQ Billing') ? 'bg-blue-600 text-white' : 'hover:bg-zinc-800 text-zinc-300'}`}
                      onClick={() => handleMenuItemClick('FAQ Billing', '/dashboard/faq/billing')}
                    >
                      <span>Billing</span>
                    </a>
                  </li>
                </ul>
              )}
            </div>
          </li>
          <li>
            <div className="relative">
              <button
                onClick={() => toggleMenu('Support')}
                className={`flex items-center justify-between w-full p-2 rounded-lg transition-colors ${isActive('Support') ? 'bg-blue-600 text-white' : 'hover:bg-zinc-800 text-zinc-300'}`}
              >
                <div
                  className="flex items-center"
                  onClick={e => {
                    e.stopPropagation();
                    handleMenuItemClick('Support');
                    toggleMenu('Support');
                  }}
                >
                  <img src="/support.svg" alt="Support" className="w-5 h-5 mr-3" />
                  <span>Support</span>
                </div>
                {supportOpen ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>

              {supportOpen && (
                <ul className="pl-8 mt-1 space-y-1">
                  <li>
                    <a
                      href="/dashboard/support/contact-us"
                      className={`flex items-center p-2 text-sm rounded-lg transition-colors ${isActive('Support Contact Us') ? 'bg-blue-600 text-white' : 'hover:bg-zinc-800 text-zinc-300'}`}
                      onClick={() =>
                        handleMenuItemClick('Support Contact Us', '/dashboard/support/contact-us')
                      }
                    >
                      <span>Contact Us</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="/dashboard/support/submit-ticket"
                      className={`flex items-center p-2 text-sm rounded-lg transition-colors ${isActive('Support Submit Ticket') ? 'bg-blue-600 text-white' : 'hover:bg-zinc-800 text-zinc-300'}`}
                      onClick={() =>
                        handleMenuItemClick(
                          'Support Submit Ticket',
                          '/dashboard/support/submit-ticket'
                        )
                      }
                    >
                      <span>Submit Ticket</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="/dashboard/support/live-chat"
                      className={`flex items-center p-2 text-sm rounded-lg transition-colors ${isActive('Support Live Chat') ? 'bg-blue-600 text-white' : 'hover:bg-zinc-800 text-zinc-300'}`}
                      onClick={() =>
                        handleMenuItemClick('Support Live Chat', '/dashboard/support/live-chat')
                      }
                    >
                      <span>Live Chat</span>
                    </a>
                  </li>
                </ul>
              )}
            </div>
          </li>
          <hr className="my-2 border-zinc-800" />
          <li>
            <a
              href="#"
              className="flex items-center p-2 text-zinc-300 rounded-lg hover:bg-zinc-800 transition-colors"
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
      <aside className="w-64 md:min-w-[16rem] bg-zinc-900 border-r border-zinc-800 min-h-[calc(100vh-64px)] transition-all duration-300 overflow-y-auto max-h-[calc(100vh-64px)] hidden md:block">
        <nav className="p-4">{renderSidebarContent()}</nav>
      </aside>

      {/* Mobile Sidebar - This is just a placeholder div for the dashboard page to target */}
      <div className="md:hidden">
        <nav className="p-4">{renderSidebarContent()}</nav>
      </div>
    </>
  );
}
