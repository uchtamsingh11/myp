'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { supabase } from '../../src/utils/supabase';
import { getCurrentUserProfile } from '../../src/utils/auth/profile';
import { getUserCoinBalance } from '../../src/utils/coin-management';
import Sidebar from '../components/dashboard/Sidebar';
import PricingComponent from '../components/dashboard/PricingComponent';
import BrokerAuthComponent from '../components/dashboard/BrokerAuthComponent';
import AdminUserData from '../components/dashboard/AdminUserData';
import WebhookUrlComponent from '../components/dashboard/WebhookUrlComponent';
import WebhookLogsComponent from '../components/dashboard/WebhookLogsComponent';
import TradingViewManageComponent from '../components/dashboard/TradingViewManageComponent';
import TradingViewJSONComponent from '../components/dashboard/TradingViewJSONComponent';
import TradingViewSymbolComponent from '../components/dashboard/TradingViewSymbolComponent';
import ScalpingToolManageComponent from '../components/dashboard/ScalpingToolManageComponent';
import CopyTradingManageComponent from '../components/dashboard/CopyTradingManageComponent';
import BotsMyBotsComponent from '../components/dashboard/BotsMyBotsComponent';
import BotsNseBseComponent from '../components/dashboard/BotsNseBseComponent';
import BotsForexComponent from '../components/dashboard/BotsForexComponent';
import BotsCryptoComponent from '../components/dashboard/BotsCryptoComponent';
import StrategyPineScriptComponent from '../components/dashboard/StrategyPineScriptComponent';
import StrategyMQLComponent from '../components/dashboard/StrategyMQLComponent';
import StrategyAFLComponent from '../components/dashboard/StrategyAFLComponent';

// Admin email - in a real application, this would be stored in a more secure way
const ADMIN_EMAIL = 'uchtamsingh@gmail.com';

export default function Dashboard() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [coinBalance, setCoinBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeMenuItem, setActiveMenuItem] = useState('Dashboard');
  
  // State for different views
  const [tradingViewOpen, setTradingViewOpen] = useState(false);
  const [webhookUrlOpen, setWebhookUrlOpen] = useState(false);
  const [webhookLogsOpen, setWebhookLogsOpen] = useState(false);
  const [scalpingToolOpen, setScalpingToolOpen] = useState(false);
  const [scalpingToolManageOpen, setScalpingToolManageOpen] = useState(false);
  const [copyTradingOpen, setCopyTradingOpen] = useState(false);
  const [copyTradingManageOpen, setCopyTradingManageOpen] = useState(false);
  const [strategyOpen, setStrategyOpen] = useState(false);
  const [strategyPineScriptOpen, setStrategyPineScriptOpen] = useState(false);
  const [strategyMQLOpen, setStrategyMQLOpen] = useState(false);
  const [strategyAFLOpen, setStrategyAFLOpen] = useState(false);
  const [botsOpen, setBotsOpen] = useState(false);
  const [botsMyBotsOpen, setBotsMyBotsOpen] = useState(false);
  const [botsNseBseOpen, setBotsNseBseOpen] = useState(false);
  const [botsForexOpen, setBotsForexOpen] = useState(false);
  const [botsCryptoOpen, setBotsCryptoOpen] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [brokerAuthOpen, setBrokerAuthOpen] = useState(false);
  const [adminUsersOpen, setAdminUsersOpen] = useState(false);
  const [tradingViewManageOpen, setTradingViewManageOpen] = useState(false);
  const [tradingViewJSONOpen, setTradingViewJSONOpen] = useState(false);
  const [tradingViewSymbolOpen, setTradingViewSymbolOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        
        // Check if user is authenticated
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/auth');
          return;
        }
        
        // Set user email from session
        const email = session.user.email;
        setUserEmail(email);
        
        // Check if user is admin
        setIsAdmin(email === ADMIN_EMAIL);
        
        // Get user profile
        const profile = await getCurrentUserProfile();
        setUserProfile(profile);
        
        // Get the latest coin balance directly using the utility function
        if (profile && profile.id) {
          const balance = await getUserCoinBalance(profile.id);
          setCoinBalance(balance);
        }

        // Check if there's a saved menu item in sessionStorage
        if (typeof window !== 'undefined') {
          const savedMenuItem = sessionStorage.getItem('dashboardActiveMenuItem');
          if (savedMenuItem) {
            setActiveMenuItem(savedMenuItem);
            
            // Set the appropriate view state based on the saved menu item
            if (savedMenuItem === 'Pricing') {
              setPricingOpen(true);
            } else if (savedMenuItem === 'Broker Auth') {
              setBrokerAuthOpen(true);
            } else if (savedMenuItem === 'Admin Users') {
              setAdminUsersOpen(true);
            } else if (savedMenuItem === 'Trading View Webhook URL') {
              setWebhookUrlOpen(true);
            } else if (savedMenuItem === 'Trading View Trade Logs') {
              setWebhookLogsOpen(true);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
    
    // Set up a subscription to refresh profile data when changes occur
    const setupSubscription = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && userProfile) {
        const subscription = supabase
          .channel('profile-changes')
          .on('postgres_changes', 
            { 
              event: 'UPDATE', 
              schema: 'public', 
              table: 'profiles',
              filter: `id=eq.${userProfile.id}`
            }, 
            async (payload) => {
              // Update coin balance when profile is updated
              if (payload.new && payload.new.coin_balance !== undefined) {
                setCoinBalance(payload.new.coin_balance);
              } else if (userProfile && userProfile.id) {
                // Fallback to fetching balance directly if not in payload
                const balance = await getUserCoinBalance(userProfile.id);
                setCoinBalance(balance);
              }
            }
          )
          .subscribe();
          
        // Return the subscription object
        return subscription;
      }
      return null;
    };
    
    let subscription;
    setupSubscription().then(sub => {
      subscription = sub;
    });
    
    // Add a global method to activate sections when redirected from other pages
    if (typeof window !== 'undefined') {
      window.activateDashboardSection = (section) => {
        console.log('Activating section:', section);
        sessionStorage.setItem('dashboardActiveMenuItem', section);
        
        if (section === 'Broker Auth') {
          setTimeout(() => {
            setActiveMenuItem('Broker Auth');
            setBrokerAuthOpen(true);
            setPricingOpen(false);
            setAdminUsersOpen(false);
          }, 50);
        } else if (section === 'Trading View Webhook URL') {
          setTimeout(() => {
            setActiveMenuItem('Trading View Webhook URL');
            setWebhookUrlOpen(true);
            setPricingOpen(false);
            setBrokerAuthOpen(false);
            setAdminUsersOpen(false);
          }, 50);
        } else if (section === 'Trading View Trade Logs') {
          setTimeout(() => {
            setActiveMenuItem('Trading View Trade Logs');
            setWebhookLogsOpen(true);
            setPricingOpen(false);
            setBrokerAuthOpen(false);
            setAdminUsersOpen(false);
          }, 50);
        } else if (section === 'Trading View JSON') {
          setTimeout(() => {
            setActiveMenuItem('Trading View JSON');
            setTradingViewJSONOpen(true);
            setPricingOpen(false);
            setBrokerAuthOpen(false);
            setAdminUsersOpen(false);
          }, 50);
        } else if (section === 'Trading View Symbol') {
          setTimeout(() => {
            setActiveMenuItem('Trading View Symbol');
            setTradingViewSymbolOpen(true);
            setPricingOpen(false);
            setBrokerAuthOpen(false);
            setAdminUsersOpen(false);
          }, 50);
        } else if (section === 'Scalping Tool Manage') {
          setTimeout(() => {
            setActiveMenuItem('Scalping Tool Manage');
            setScalpingToolManageOpen(true);
            setPricingOpen(false);
            setBrokerAuthOpen(false);
            setAdminUsersOpen(false);
          }, 50);
        } else if (section === 'Copy Trading Manage') {
          setTimeout(() => {
            setActiveMenuItem('Copy Trading Manage');
            setCopyTradingManageOpen(true);
            setPricingOpen(false);
            setBrokerAuthOpen(false);
            setAdminUsersOpen(false);
          }, 50);
        } else if (section === 'Bots My Bots') {
          setTimeout(() => {
            setActiveMenuItem('Bots My Bots');
            setBotsMyBotsOpen(true);
            setPricingOpen(false);
            setBrokerAuthOpen(false);
            setAdminUsersOpen(false);
          }, 50);
        } else if (section === 'Bots NSE/BSE') {
          setTimeout(() => {
            setActiveMenuItem('Bots NSE/BSE');
            setBotsNseBseOpen(true);
            setPricingOpen(false);
            setBrokerAuthOpen(false);
            setAdminUsersOpen(false);
          }, 50);
        } else if (section === 'Bots Forex') {
          setTimeout(() => {
            setActiveMenuItem('Bots Forex');
            setBotsForexOpen(true);
            setPricingOpen(false);
            setBrokerAuthOpen(false);
            setAdminUsersOpen(false);
          }, 50);
        } else if (section === 'Bots Crypto') {
          setTimeout(() => {
            setActiveMenuItem('Bots Crypto');
            setBotsCryptoOpen(true);
            setPricingOpen(false);
            setBrokerAuthOpen(false);
            setAdminUsersOpen(false);
          }, 50);
        } else if (section === 'Strategy Pine Script') {
          setTimeout(() => {
            setActiveMenuItem('Strategy Pine Script');
            setStrategyPineScriptOpen(true);
            setPricingOpen(false);
            setBrokerAuthOpen(false);
            setAdminUsersOpen(false);
          }, 50);
        } else if (section === 'Strategy MQL') {
          setTimeout(() => {
            setActiveMenuItem('Strategy MQL');
            setStrategyMQLOpen(true);
            setPricingOpen(false);
            setBrokerAuthOpen(false);
            setAdminUsersOpen(false);
          }, 50);
        } else if (section === 'Strategy AFL') {
          setTimeout(() => {
            setActiveMenuItem('Strategy AFL');
            setStrategyAFLOpen(true);
            setPricingOpen(false);
            setBrokerAuthOpen(false);
            setAdminUsersOpen(false);
          }, 50);
        }
      };
    }
    
    // Cleanup the global method when component unmounts
    return () => {
      if (typeof window !== 'undefined') {
        delete window.activateDashboardSection;
      }
      
      if (subscription) {
        try {
          subscription.unsubscribe();
        } catch (error) {
          console.error('Error unsubscribing:', error);
        }
      }
    };
  }, [router]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('userProfile');
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  const handleMenuItemClick = (itemName) => {
    // Prevent redundant updates if already on the same page
    if (activeMenuItem === itemName) {
      console.log('Already on', itemName, '- skipping state updates');
      return;
    }
    
    console.log('Menu item clicked:', itemName);
    setActiveMenuItem(itemName);
    
    // Save the active menu item to sessionStorage
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('dashboardActiveMenuItem', itemName);
    }
    
    // Reset all view states first
    setPricingOpen(false);
    setBrokerAuthOpen(false);
    setAdminUsersOpen(false);
    setWebhookUrlOpen(false);
    setWebhookLogsOpen(false);
    setTradingViewManageOpen(false);
    setTradingViewJSONOpen(false);
    setTradingViewSymbolOpen(false);
    setScalpingToolManageOpen(false);
    setCopyTradingManageOpen(false);
    setBotsMyBotsOpen(false);
    setBotsNseBseOpen(false);
    setBotsForexOpen(false);
    setBotsCryptoOpen(false);
    setStrategyPineScriptOpen(false);
    setStrategyMQLOpen(false);
    setStrategyAFLOpen(false);
    
    // Then set only the relevant one to true
    // Use a small timeout to ensure the previous state updates complete
    setTimeout(() => {
      // Handle specific menu items based on exact name match
      if (itemName === 'Pricing') {
        console.log('Setting pricing open to true');
        setPricingOpen(true);
      } else if (itemName === 'Broker Auth') {
        console.log('Setting broker auth open to true');
        setBrokerAuthOpen(true);
      } else if (itemName === 'Admin Users') {
        console.log('Setting admin users open to true');
        setAdminUsersOpen(true);
      } else if (itemName === 'Trading View Webhook URL') {
        console.log('Setting webhook URL open to true');
        setWebhookUrlOpen(true);
      } else if (itemName === 'Trading View Trade Logs') {
        console.log('Setting webhook logs open to true');
        setWebhookLogsOpen(true);
      } else if (itemName === 'Trading View Manage') {
        console.log('Setting Trading View Manage open to true');
        setTradingViewManageOpen(true);
      } else if (itemName === 'Trading View JSON') {
        console.log('Setting Trading View JSON open to true');
        setTradingViewJSONOpen(true);
      } else if (itemName === 'Trading View Symbol') {
        console.log('Setting Trading View Symbol open to true');
        setTradingViewSymbolOpen(true);
      } else if (itemName === 'Scalping Tool Manage') {
        console.log('Setting Scalping Tool Manage open to true');
        setScalpingToolManageOpen(true);
      } else if (itemName === 'Copy Trading Manage') {
        console.log('Setting Copy Trading Manage open to true');
        setCopyTradingManageOpen(true);
      } else if (itemName === 'Bots My Bots') {
        console.log('Setting Bots My Bots open to true');
        setBotsMyBotsOpen(true);
      } else if (itemName === 'Bots NSE/BSE') {
        console.log('Setting Bots NSE/BSE open to true');
        setBotsNseBseOpen(true);
      } else if (itemName === 'Bots Forex') {
        console.log('Setting Bots Forex open to true');
        setBotsForexOpen(true);
      } else if (itemName === 'Bots Crypto') {
        console.log('Setting Bots Crypto open to true');
        setBotsCryptoOpen(true);
      } else if (itemName === 'Strategy Pine Script') {
        console.log('Setting Strategy Pine Script open to true');
        setStrategyPineScriptOpen(true);
      } else if (itemName === 'Strategy MQL') {
        console.log('Setting Strategy MQL open to true');
        setStrategyMQLOpen(true);
      } else if (itemName === 'Strategy AFL') {
        console.log('Setting Strategy AFL open to true');
        setStrategyAFLOpen(true);
      }
    }, 50);
  };
  
  const handlePurchase = async (plan) => {
    try {
      // Here you would implement the actual purchase logic with Coinbase
      // For now, we'll just update the local state
      alert(`Purchase initiated for ${plan.name} package with ${plan.coins} coins for $${plan.price}`);
      
      // After successful purchase, update the coin balance
      const newBalance = coinBalance + plan.coins;
      setCoinBalance(newBalance);
      
      // You would also update the balance in the database
      // const { error } = await supabase
      //   .from('profiles')
      //   .update({ coin_balance: newBalance })
      //   .eq('id', userProfile.id);
      
      // if (error) throw error;
    } catch (error) {
      console.error('Error processing purchase:', error);
    }
  };

  // Monitor state changes - only log significant changes
  useEffect(() => {
    // Only log when pricing is explicitly opened
    if (pricingOpen) {
      console.log('Pricing component opened');
    }
  }, [pricingOpen]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  // Render different content based on active menu item
  const renderContent = () => {
    console.log('Rendering content - activeMenuItem:', activeMenuItem, 'pricingOpen:', pricingOpen, 'brokerAuthOpen:', brokerAuthOpen);
    
    // Use activeMenuItem to determine content
    if (activeMenuItem === 'Pricing') {
      console.log('Returning PricingComponent based on activeMenuItem');
      return <PricingComponent key="pricing" onPurchase={handlePurchase} />;
    } else if (activeMenuItem === 'Broker Auth') {
      console.log('Returning BrokerAuthComponent based on activeMenuItem');
      return <BrokerAuthComponent key="broker-auth" />;
    } else if (activeMenuItem === 'Admin Users') {
      console.log('Returning AdminUserData based on activeMenuItem');
      return <AdminUserData key="admin-users" />;
    } else if (activeMenuItem === 'Trading View Webhook URL') {
      console.log('Returning WebhookUrlComponent based on activeMenuItem');
      return <WebhookUrlComponent key="webhook-url" />;
    } else if (activeMenuItem === 'Trading View Trade Logs') {
      console.log('Returning WebhookLogsComponent based on activeMenuItem');
      return <WebhookLogsComponent key="webhook-logs" />;
    } else if (activeMenuItem === 'Trading View Manage') {
      console.log('Returning TradingViewManageComponent based on activeMenuItem');
      return <TradingViewManageComponent key="tradingview-manage" />;
    } else if (activeMenuItem === 'Trading View JSON') {
      console.log('Returning TradingViewJSONComponent based on activeMenuItem');
      return <TradingViewJSONComponent key="tradingview-json" />;
    } else if (activeMenuItem === 'Trading View Symbol') {
      console.log('Returning TradingViewSymbolComponent based on activeMenuItem');
      return <TradingViewSymbolComponent key="tradingview-symbol" />;
    } else if (activeMenuItem === 'Scalping Tool Manage') {
      console.log('Returning ScalpingToolManageComponent based on activeMenuItem');
      return <ScalpingToolManageComponent key="scalpingtool-manage" />;
    } else if (activeMenuItem === 'Copy Trading Manage') {
      console.log('Returning CopyTradingManageComponent based on activeMenuItem');
      return <CopyTradingManageComponent key="copytrading-manage" />;
    } else if (activeMenuItem === 'Bots My Bots') {
      console.log('Returning BotsMyBotsComponent based on activeMenuItem');
      return <BotsMyBotsComponent key="bots-mybots" />;
    } else if (activeMenuItem === 'Bots NSE/BSE') {
      console.log('Returning BotsNseBseComponent based on activeMenuItem');
      return <BotsNseBseComponent key="bots-nsebse" />;
    } else if (activeMenuItem === 'Bots Forex') {
      console.log('Returning BotsForexComponent based on activeMenuItem');
      return <BotsForexComponent key="bots-forex" />;
    } else if (activeMenuItem === 'Bots Crypto') {
      console.log('Returning BotsCryptoComponent based on activeMenuItem');
      return <BotsCryptoComponent key="bots-crypto" />;
    } else if (activeMenuItem === 'Strategy Pine Script') {
      console.log('Returning StrategyPineScriptComponent based on activeMenuItem');
      return <StrategyPineScriptComponent key="strategy-pinescript" />;
    } else if (activeMenuItem === 'Strategy MQL') {
      console.log('Returning StrategyMQLComponent based on activeMenuItem');
      return <StrategyMQLComponent key="strategy-mql" />;
    } else if (activeMenuItem === 'Strategy AFL') {
      console.log('Returning StrategyAFLComponent based on activeMenuItem');
      return <StrategyAFLComponent key="strategy-afl" />;
    }
    
    console.log('Returning default dashboard content');
    // Default dashboard content
    return (
      <h2 className="text-2xl font-bold mb-4 text-left pl-2">Dashboard</h2>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-zinc-900 border-b border-zinc-800">
        <div className="container-custom mx-auto py-4 px-4 flex items-center">
          <h1 className="text-2xl font-bold">AlgoZ</h1>
          {/* Middle content can be added here */}
          <div className="flex-grow"></div>
          {isAdmin && (
            <div className="text-sm mr-4 px-3 py-1.5 rounded-md bg-purple-900 flex items-center">
              Admin
            </div>
          )}
          <div className="text-sm mr-4 px-3 py-1.5 rounded-md bg-zinc-700 flex items-center hover:bg-zinc-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">{coinBalance}</span>
            <span className="ml-1 text-xs text-zinc-300">coins</span>
          </div>
          {userEmail && (
            <div className="text-sm mr-4 px-3 py-1.5 rounded-md bg-zinc-800">
              {userEmail}
            </div>
          )}
          <button 
            onClick={handleSignOut}
            className="p-2 rounded-lg hover:bg-zinc-800 transition-colors"
            title="Logout"
          >
            <img src="/logout.svg" alt="Logout" className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content with Sidebar */}
      <div className="flex">
        {/* Import and use the Sidebar component */}
        <Sidebar 
          onMenuItemClick={handleMenuItemClick} 
          activeMenuItem={activeMenuItem} 
          isAdmin={isAdmin}
        />
        
        {/* Main Content Area */}
        <main className="flex-1 p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}