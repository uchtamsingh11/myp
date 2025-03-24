'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

export default function Sidebar({ onMenuItemClick, activeMenuItem, isAdmin = false }) {
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
  const [activeItem, setActiveItem] = useState(activeMenuItem || (typeof window !== 'undefined' && sessionStorage.getItem('dashboardActiveMenuItem')) || 'Dashboard');
  
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
  const handleMenuItemClick = (itemName) => {
    setActiveItem(itemName);
    
    // Store the active menu item in sessionStorage to preserve it across page refreshes
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('dashboardActiveMenuItem', itemName);
    }
    
    // Pass the active item to the parent component
    if (onMenuItemClick) {
      onMenuItemClick(itemName);
    }
    
    // Close the sidebar on mobile after clicking a menu item
    if (window.innerWidth < 768) {
      const sidebar = document.querySelector('.sidebar-mobile');
      if (sidebar) {
        sidebar.classList.add('hidden');
      }
    }
  };

  // Function to determine if a menu item is active
  const isActive = (itemName) => activeItem === itemName;

  // Function to toggle a menu's open state and close others
  const toggleMenu = (menuName) => {
    switch(menuName) {
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
      <ul className="space-y-2">
        <li>
          <a 
            href="#" 
            className={`flex items-center p-2 rounded-lg transition-colors ${isActive('Dashboard') ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-800 text-zinc-300'}`}
            onClick={() => handleMenuItemClick('Dashboard')}
          >
            <img src="/window.svg" alt="Dashboard" className="w-5 h-5 mr-3" />
            <span>Dashboard</span>
          </a>
        </li>
        <hr className="my-2 border-zinc-800" />
        <li>
          <a 
            href="#" 
            className={`flex items-center p-2 rounded-lg transition-colors ${isActive('Broker Auth') ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-800 text-zinc-300'}`}
            onClick={() => handleMenuItemClick('Broker Auth')}
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
                className={`flex items-center justify-between w-full p-2 rounded-lg transition-colors ${isActive('Admin') || isActive('Admin Users') ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-800 text-zinc-300'}`}
              >
                <div className="flex items-center" onClick={(e) => {
                  e.stopPropagation();
                  handleMenuItemClick('Admin');
                  toggleMenu('Admin');
                }}>
                  <img src="/admin.svg" alt="Admin" className="w-5 h-5 mr-3" />
                  <span>Admin</span>
                </div>
                {adminOpen ? 
                  <ChevronDown className="w-4 h-4" /> : 
                  <ChevronRight className="w-4 h-4" />}
              </button>
              
              {adminOpen && (
                <ul className="pl-8 mt-1 space-y-1">
                  <li>
                    <a 
                      href="#" 
                      className={`flex items-center p-2 text-sm rounded-lg transition-colors ${isActive('Admin Users') ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-800 text-zinc-300'}`}
                      onClick={() => handleMenuItemClick('Admin Users')}
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
              className={`flex items-center justify-between w-full p-2 rounded-lg transition-colors ${isActive('Trading View') ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-800 text-zinc-300'}`}
            >
              <div className="flex items-center" onClick={(e) => {
                e.stopPropagation();
                handleMenuItemClick('Trading View');
                toggleMenu('Trading View');
              }}>
                <img src="/chart.svg" alt="Trading View" className="w-5 h-5 mr-3" />
                <span>Trading View</span>
              </div>
              {tradingViewOpen ? 
                <ChevronDown className="w-4 h-4" /> : 
                <ChevronRight className="w-4 h-4" />}
            </button>
            
            {tradingViewOpen && (
              <ul className="pl-8 mt-1 space-y-1">
                <li>
                  <a 
                    href="#" 
                    className={`flex items-center p-2 text-sm rounded-lg transition-colors ${isActive('Trading View Manage') ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-800 text-zinc-300'}`}
                    onClick={() => handleMenuItemClick('Trading View Manage')}
                  >
                    <span>Manage</span>
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    className={`flex items-center p-2 text-sm rounded-lg transition-colors ${isActive('Trading View Webhook URL') ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-800 text-zinc-300'}`}
                    onClick={() => handleMenuItemClick('Trading View Webhook URL')}
                  >
                    <span>Webhook URL</span>
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    className={`flex items-center p-2 text-sm rounded-lg transition-colors ${isActive('Trading View JSON') ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-800 text-zinc-300'}`}
                    onClick={() => handleMenuItemClick('Trading View JSON')}
                  >
                    <span>JSON</span>
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    className={`flex items-center p-2 text-sm rounded-lg transition-colors ${isActive('Trading View Symbol') ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-800 text-zinc-300'}`}
                    onClick={() => handleMenuItemClick('Trading View Symbol')}
                  >
                    <span>Symbol</span>
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    className={`flex items-center p-2 text-sm rounded-lg transition-colors ${isActive('Trading View Trade Logs') ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-800 text-zinc-300'}`}
                    onClick={() => handleMenuItemClick('Trading View Trade Logs')}
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
              className={`flex items-center justify-between w-full p-2 rounded-lg transition-colors ${isActive('Scalping Tool') ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-800 text-zinc-300'}`}
            >
              <div className="flex items-center" onClick={(e) => {
                e.stopPropagation();
                handleMenuItemClick('Scalping Tool');
                toggleMenu('Scalping Tool');
              }}>
                <img src="/scalping.svg" alt="Scalping Tool" className="w-5 h-5 mr-3" />
                <span>Scalping Tool</span>
              </div>
              {scalpingToolOpen ? 
                <ChevronDown className="w-4 h-4" /> : 
                <ChevronRight className="w-4 h-4" />}
            </button>
            
            {scalpingToolOpen && (
              <ul className="pl-8 mt-1 space-y-1">
                <li>
                  <a 
                    href="#" 
                    className={`flex items-center p-2 text-sm rounded-lg transition-colors ${isActive('Scalping Tool Manage') ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-800 text-zinc-300'}`}
                    onClick={() => handleMenuItemClick('Scalping Tool Manage')}
                  >
                    <span>Manage</span>
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    className={`flex items-center p-2 text-sm rounded-lg transition-colors ${isActive('Scalping Tool Scalp Tool') ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-800 text-zinc-300'}`}
                    onClick={() => handleMenuItemClick('Scalping Tool Scalp Tool')}
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
              className={`flex items-center justify-between w-full p-2 rounded-lg transition-colors ${isActive('Copy Trading') ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-800 text-zinc-300'}`}
            >
              <div className="flex items-center" onClick={(e) => {
                e.stopPropagation();
                handleMenuItemClick('Copy Trading');
                toggleMenu('Copy Trading');
              }}>
                <img src="/copy-trading.svg" alt="Copy Trading" className="w-5 h-5 mr-3" />
                <span>Copy Trading</span>
              </div>
              {copyTradingOpen ? 
                <ChevronDown className="w-4 h-4" /> : 
                <ChevronRight className="w-4 h-4" />}
            </button>
            
            {copyTradingOpen && (
              <ul className="pl-8 mt-1 space-y-1">
                <li>
                  <a 
                    href="#" 
                    className={`flex items-center p-2 text-sm rounded-lg transition-colors ${isActive('Copy Trading Manage') ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-800 text-zinc-300'}`}
                    onClick={() => handleMenuItemClick('Copy Trading Manage')}
                  >
                    <span>Manage</span>
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    className={`flex items-center p-2 text-sm rounded-lg transition-colors ${isActive('Copy Trading Strategy') ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-800 text-zinc-300'}`}
                    onClick={() => handleMenuItemClick('Copy Trading Strategy')}
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
              className={`flex items-center justify-between w-full p-2 rounded-lg transition-colors ${isActive('Strategy') ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-800 text-zinc-300'}`}
            >
              <div className="flex items-center" onClick={(e) => {
                e.stopPropagation();
                handleMenuItemClick('Strategy');
                toggleMenu('Strategy');
              }}>
                <img src="/strategy.svg" alt="Strategy" className="w-5 h-5 mr-3" />
                <span>Strategy</span>
              </div>
              {strategyOpen ? 
                <ChevronDown className="w-4 h-4" /> : 
                <ChevronRight className="w-4 h-4" />}
            </button>
            
            {strategyOpen && (
              <ul className="pl-8 mt-1 space-y-1">
                <li>
                  <a 
                    href="#" 
                    className={`flex items-center p-2 text-sm rounded-lg transition-colors ${isActive('Strategy Pine Script') ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-800 text-zinc-300'}`}
                    onClick={() => handleMenuItemClick('Strategy Pine Script')}
                  >
                    <span>Pine Script</span>
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    className={`flex items-center p-2 text-sm rounded-lg transition-colors ${isActive('Strategy MQL') ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-800 text-zinc-300'}`}
                    onClick={() => handleMenuItemClick('Strategy MQL')}
                  >
                    <span>MQL</span>
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    className={`flex items-center p-2 text-sm rounded-lg transition-colors ${isActive('Strategy AFL') ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-800 text-zinc-300'}`}
                    onClick={() => handleMenuItemClick('Strategy AFL')}
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
              className={`flex items-center justify-between w-full p-2 rounded-lg transition-colors ${isActive('Bots') ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-800 text-zinc-300'}`}
            >
              <div className="flex items-center" onClick={(e) => {
                e.stopPropagation();
                handleMenuItemClick('Bots');
                toggleMenu('Bots');
              }}>
                <img src="/bot.svg" alt="Bots" className="w-5 h-5 mr-3" />
                <span>Bots</span>
              </div>
              {botsOpen ? 
                <ChevronDown className="w-4 h-4" /> : 
                <ChevronRight className="w-4 h-4" />}
            </button>
            
            {botsOpen && (
              <ul className="pl-8 mt-1 space-y-1">
                <li>
                  <a 
                    href="#" 
                    className={`flex items-center p-2 text-sm rounded-lg transition-colors ${isActive('Bots My Bots') ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-800 text-zinc-300'}`}
                    onClick={() => handleMenuItemClick('Bots My Bots')}
                  >
                    <span>My Bots</span>
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    className={`flex items-center p-2 text-sm rounded-lg transition-colors ${isActive('Bots NSE/BSE') ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-800 text-zinc-300'}`}
                    onClick={() => handleMenuItemClick('Bots NSE/BSE')}
                  >
                    <span>NSE/BSE</span>
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    className={`flex items-center p-2 text-sm rounded-lg transition-colors ${isActive('Bots Forex') ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-800 text-zinc-300'}`}
                    onClick={() => handleMenuItemClick('Bots Forex')}
                  >
                    <span>Forex</span>
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    className={`flex items-center p-2 text-sm rounded-lg transition-colors ${isActive('Bots Crypto') ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-800 text-zinc-300'}`}
                    onClick={() => handleMenuItemClick('Bots Crypto')}
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
              onClick={(e) => {
                e.preventDefault();
                handleMenuItemClick('Pricing');
              }}
              className={`flex items-center w-full p-2 rounded-lg transition-colors ${isActive('Pricing') ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-800 text-zinc-300'}`}
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
              className={`flex items-center justify-between w-full p-2 rounded-lg transition-colors ${isActive('FAQ') ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-800 text-zinc-300'}`}
            >
              <div className="flex items-center" onClick={(e) => {
                e.stopPropagation();
                handleMenuItemClick('FAQ');
                toggleMenu('FAQ');
              }}>
                <img src="/faq.svg" alt="FAQ" className="w-5 h-5 mr-3" />
                <span>FAQ</span>
              </div>
              {faqOpen ? 
                <ChevronDown className="w-4 h-4" /> : 
                <ChevronRight className="w-4 h-4" />}
            </button>
            
            {faqOpen && (
              <ul className="pl-8 mt-1 space-y-1">
                <li>
                  <a 
                    href="#" 
                    className={`flex items-center p-2 text-sm rounded-lg transition-colors ${isActive('FAQ General') ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-800 text-zinc-300'}`}
                    onClick={() => handleMenuItemClick('FAQ General')}
                  >
                    <span>General</span>
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    className={`flex items-center p-2 text-sm rounded-lg transition-colors ${isActive('FAQ Trading') ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-800 text-zinc-300'}`}
                    onClick={() => handleMenuItemClick('FAQ Trading')}
                  >
                    <span>Trading</span>
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    className={`flex items-center p-2 text-sm rounded-lg transition-colors ${isActive('FAQ Billing') ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-800 text-zinc-300'}`}
                    onClick={() => handleMenuItemClick('FAQ Billing')}
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
              className={`flex items-center justify-between w-full p-2 rounded-lg transition-colors ${isActive('Support') ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-800 text-zinc-300'}`}
            >
              <div className="flex items-center" onClick={(e) => {
                e.stopPropagation();
                handleMenuItemClick('Support');
                toggleMenu('Support');
              }}>
                <img src="/support.svg" alt="Support" className="w-5 h-5 mr-3" />
                <span>Support</span>
              </div>
              {supportOpen ? 
                <ChevronDown className="w-4 h-4" /> : 
                <ChevronRight className="w-4 h-4" />}
            </button>
            
            {supportOpen && (
              <ul className="pl-8 mt-1 space-y-1">
                <li>
                  <a 
                    href="#" 
                    className={`flex items-center p-2 text-sm rounded-lg transition-colors ${isActive('Support Contact Us') ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-800 text-zinc-300'}`}
                    onClick={() => handleMenuItemClick('Support Contact Us')}
                  >
                    <span>Contact Us</span>
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    className={`flex items-center p-2 text-sm rounded-lg transition-colors ${isActive('Support Submit Ticket') ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-800 text-zinc-300'}`}
                    onClick={() => handleMenuItemClick('Support Submit Ticket')}
                  >
                    <span>Submit Ticket</span>
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    className={`flex items-center p-2 text-sm rounded-lg transition-colors ${isActive('Support Live Chat') ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-800 text-zinc-300'}`}
                    onClick={() => handleMenuItemClick('Support Live Chat')}
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
            className={`flex items-center p-2 rounded-lg transition-colors text-zinc-300 hover:bg-zinc-800`}
          >
            <img src="/logout.svg" alt="Logout" className="w-5 h-5 mr-3" />
            <span>Logout</span>
          </a>
        </li>
      </ul>
    );
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-64 md:min-w-[16rem] bg-zinc-900 border-r border-zinc-800 min-h-[calc(100vh-64px)] transition-all duration-300 overflow-y-auto max-h-[calc(100vh-64px)] hidden md:block">
        <nav className="p-4">
          {renderSidebarContent()}
        </nav>
      </aside>

      {/* Mobile Sidebar - This is just a placeholder div for the dashboard page to target */}
      <div className="md:hidden">
        <nav className="p-4">
          {renderSidebarContent()}
        </nav>
      </div>
    </>
  );
}