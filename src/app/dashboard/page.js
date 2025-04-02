'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { supabase } from '../../utils/supabase';
import Image from 'next/image';
import { Activity, TrendingUp, BarChart2, PieChart, DollarSign, Users, Briefcase, ArrowUpRight, LineChart, Clock, RefreshCw, ChevronRight } from 'lucide-react';

// Import broker icons from the broker auth page
const BrokerIcons = {
  alice_blue: <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>,
  angel_broking: <svg className="w-6 h-6 text-amber-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5z"></path><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998a12.078 12.078 0 01.665-6.479L12 14z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998a12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"></path></svg>,
  binance: <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 16L6 10 7.4 8.6 12 13.2 16.6 8.6 18 10z"></path><path d="M12 8L6 14 7.4 15.4 12 10.8 16.6 15.4 18 14z"></path><path d="M13.5 5.5L12 4 10.5 5.5 12 7z"></path><path d="M13.5 18.5L12 20 10.5 18.5 12 17z"></path></svg>,
  default: <svg className="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 24 24"><path d="M21 17h-2v-2h-2v2h-2v2h2v2h2v-2h2v-2zm-9-7a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h4a2 2 0 012 2v4zm6 0a2 2 0 01-2 2h-2a2 2 0 01-2-2V6a2 2 0 012-2h2a2 2 0 012 2v4zm-6 8a2 2 0 01-2 2H6a2 2 0 01-2-2v-4a2 2 0 012-2h4a2 2 0 012 2v4z"></path></svg>,
  zerodha: <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>,
  interactive_brokers: <svg className="w-6 h-6 text-red-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>,
  fidelity: <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 24 24"><path d="M21 7v10h-2V7h2zm-6 10V7h-2v10h2zm-6 0V7H7v10h2zM3 7v10h2V7H3z"/></svg>,
  charles_schwab: <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg>,
  angelone: <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>,
};

// Broker name mapping
const brokerNameMapping = {
  alice_blue: 'Alice Blue',
  angel_broking: 'Angel Broking',
  binance: 'Binance',
  zerodha: 'Zerodha',
  interactive_brokers: 'Interactive Brokers',
  fidelity: 'Fidelity Investments',
  charles_schwab: 'Charles Schwab',
  angelone: 'AngelOne',
  delta_exchange: 'Delta Exchange',
  dhan: 'Dhan',
  finvisia: 'Finvisia',
  fyers: 'Fyers',
  icici_direct: 'ICICI Direct',
  iifl: 'IIFL',
  kotak_neo: 'Kotak Neo',
  metatrader4: 'MetaTrader 4',
  metatrader5: 'MetaTrader 5',
  upstox: 'Upstox',
};

// Get broker icon, fall back to default if not found
const getBrokerIcon = (brokerId) => {
  return BrokerIcons[brokerId] || BrokerIcons.default;
};

// Mock data for the trending strategies
const TRENDING_STRATEGIES = [
  {
    id: 1,
    name: 'Reliance Industries',
    icon: 'R',
    iconBg: 'bg-blue-500',
    reward: '38.45%',
    change: '-2.15%',
    isPositive: false,
    value: '-₹25.60',
    chartColor: 'text-red-500',
  },
  {
    id: 2,
    name: 'HDFC Bank',
    icon: 'H',
    iconBg: 'bg-red-500',
    reward: '42.70%',
    change: '+3.25%',
    isPositive: true,
    value: '+₹54.30',
    chartColor: 'text-green-500',
  },
  {
    id: 3,
    name: 'Infosys',
    icon: 'I',
    iconBg: 'bg-green-500',
    reward: '29.65%',
    change: '+1.85%',
    isPositive: true,
    value: '+₹29.15',
    chartColor: 'text-green-500',
  },
];

// Mock data for the stock table
const STOCKS_DATA = [
  {
    company: 'Reliance Industries Ltd',
    symbol: 'RELIANCE',
    high: '₹2,940.50',
    low: '₹2,875.25',
    prevClose: '₹2,890.30',
    change: '-15.75',
    gain: '0.54%',
    performance: [1, 1, -1, 1, -1],
    isPositive: false,
    marketCap: '₹19.9L Cr'
  },
  {
    company: 'Tata Consultancy Services Ltd',
    symbol: 'TCS',
    high: '₹3,758.40',
    low: '₹3,680.15',
    prevClose: '₹3,720.55',
    change: '37.85',
    gain: '1.02%',
    performance: [1, -1, 1, 1, 1],
    isPositive: true,
    marketCap: '₹13.7L Cr'
  },
  {
    company: 'HDFC Bank Ltd',
    symbol: 'HDFCBANK',
    high: '₹1,675.80',
    low: '₹1,645.30',
    prevClose: '₹1,662.75',
    change: '13.05',
    gain: '0.78%',
    performance: [1, 1, 1, -1, 1],
    isPositive: true,
    marketCap: '₹12.6L Cr'
  },
  {
    company: 'Infosys Ltd',
    symbol: 'INFY',
    high: '₹1,578.25',
    low: '₹1,550.45',
    prevClose: '₹1,560.40',
    change: '17.85',
    gain: '1.14%',
    performance: [1, -1, 1, 1, 1],
    isPositive: true,
    marketCap: '₹6.5L Cr'
  },
  {
    company: 'Bharti Airtel Ltd',
    symbol: 'BHARTIARTL',
    high: '₹1,425.60',
    low: '₹1,390.25',
    prevClose: '₹1,405.80',
    change: '-10.55',
    gain: '0.75%',
    performance: [1, 1, -1, -1, -1],
    isPositive: false,
    marketCap: '₹7.9L Cr'
  },
  {
    company: 'ITC Ltd',
    symbol: 'ITC',
    high: '₹465.30',
    low: '₹452.80',
    prevClose: '₹457.50',
    change: '7.80',
    gain: '1.71%',
    performance: [1, -1, 1, 1, 1],
    isPositive: true,
    marketCap: '₹5.7L Cr'
  },
  {
    company: 'Adani Enterprises Ltd',
    symbol: 'ADANIENT',
    high: '₹2,950.75',
    low: '₹2,890.40',
    prevClose: '₹2,925.60',
    change: '-35.20',
    gain: '1.2%',
    performance: [1, 1, -1, -1, -1],
    isPositive: false,
    marketCap: '₹3.4L Cr'
  },
];

// List of brokers
const BROKERS = [
  { id: 'interactive', name: 'Interactive Brokers', logo: '/brokers/interactive.png' },
  { id: 'schwab', name: 'Charles Schwab', logo: '/brokers/schwab.png' },
  { id: 'fidelity', name: 'Fidelity Investments', logo: '/brokers/fidelity.png' },
  { id: 'angelone', name: 'AngelOne', logo: '/brokers/angelone.png' },
];

// Market activity data
const MARKET_ACTIVITY = [
  { region: 'NIFTY 50', percentage: 68 },
  { region: 'BSE SENSEX', percentage: 72 },
  { region: 'BANK NIFTY', percentage: 59 },
];

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFilter, setTimeFilter] = useState('Week');
  const [savedBrokers, setSavedBrokers] = useState([]);
  const [connectingBroker, setConnectingBroker] = useState(false);
  const { user, isLoading } = useAuth();

  // Fetch connected brokers
  useEffect(() => {
    const fetchSavedBrokers = async () => {
      try {
        if (!user) return;

        // Call the Supabase function to get all saved broker credentials
        const { data, error } = await supabase.rpc('get_all_broker_credentials_v2');

        if (error) {
          console.error('Error fetching broker credentials:', error.message);
          return;
        }

        // Update state with saved brokers
        setSavedBrokers(data || []);
      } catch (err) {
        console.error('Error fetching saved brokers:', err);
      }
    };

    fetchSavedBrokers();
  }, [user]);

  // Verify authentication on component mount
  useEffect(() => {
    document.title = 'Dashboard | AlgoZ';

    // Since we're using the useAuth hook, we can simplify this
    if (!isLoading && !user) {
      router.replace('/auth');
    } else if (!isLoading && user) {
      setLoading(false);
    }
  }, [user, isLoading, router]);

  // Handle broker connection
  const handleConnectBroker = () => {
    router.push('/dashboard/broker-auth');
  };

  // Show loading state
  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh] bg-zinc-950/50 rounded-xl">
        <div className="relative">
          <div className="w-14 h-14 rounded-full absolute border-4 border-solid border-zinc-800"></div>
          <div className="w-14 h-14 rounded-full animate-spin absolute border-4 border-solid border-indigo-500 border-t-transparent shadow-lg"></div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="text-center">
        <h3 className="text-red-500 mb-4">Authentication Error</h3>
        <p className="text-zinc-400">Redirecting to login page...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900/80 border border-zinc-800/50 rounded-xl p-5 shadow-lg backdrop-blur-sm hover:border-indigo-500/30 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider flex items-center">
                <Activity className="w-3.5 h-3.5 mr-1 text-indigo-400" /> Portfolio Value
              </p>
              <h3 className="text-white text-2xl font-bold mt-1">₹0</h3>
              <p className="text-green-400 text-xs flex items-center mt-1">
                <TrendingUp className="w-3.5 h-3.5 mr-1" /> +0% <span className="text-zinc-500 ml-1">from last month</span>
              </p>
            </div>
            <div className="bg-indigo-500/10 p-2 rounded-lg">
              <LineChart className="w-8 h-8 text-indigo-500" />
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800/50 rounded-xl p-5 shadow-lg backdrop-blur-sm hover:border-indigo-500/30 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider flex items-center">
                <BarChart2 className="w-3.5 h-3.5 mr-1 text-amber-400" /> Active Strategies
              </p>
              <h3 className="text-white text-2xl font-bold mt-1">7</h3>
              <p className="text-zinc-400 text-xs flex items-center mt-1">
                <Clock className="w-3.5 h-3.5 mr-1" /> Last deployed <span className="text-white ml-1">2 hours ago</span>
              </p>
            </div>
            <div className="bg-amber-500/10 p-2 rounded-lg">
              <RefreshCw className="w-8 h-8 text-amber-500" />
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800/50 rounded-xl p-5 shadow-lg backdrop-blur-sm hover:border-indigo-500/30 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider flex items-center">
                <PieChart className="w-3.5 h-3.5 mr-1 text-green-400" /> Success Rate
              </p>
              <h3 className="text-white text-2xl font-bold mt-1">68.2%</h3>
              <p className="text-green-400 text-xs flex items-center mt-1">
                <TrendingUp className="w-3.5 h-3.5 mr-1" /> +4.3% <span className="text-zinc-500 ml-1">from previous</span>
              </p>
            </div>
            <div className="bg-green-500/10 p-2 rounded-lg">
              <Activity className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800/50 rounded-xl p-5 shadow-lg backdrop-blur-sm hover:border-indigo-500/30 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider flex items-center">
                <DollarSign className="w-3.5 h-3.5 mr-1 text-purple-400" /> Available Credits
              </p>
              <h3 className="text-white text-2xl font-bold mt-1">15</h3>
              <div className="flex items-center mt-1">
                <button className="text-white text-xs bg-purple-600 rounded px-2 py-0.5 hover:bg-purple-500 transition-colors">
                  Buy More
                </button>
              </div>
            </div>
            <div className="bg-purple-500/10 p-2 rounded-lg">
              <Briefcase className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Trending Strategy Section */}
        <div className="lg:col-span-3">
          <div className="bg-zinc-900/80 rounded-xl border border-zinc-800/50 overflow-hidden shadow-xl">
            <div className="p-6 border-b border-zinc-800/50 flex justify-between items-center">
              <div className="flex items-center">
                <TrendingUp className="w-5 h-5 text-indigo-500 mr-2" />
                <h2 className="text-white text-lg font-medium">Top Trending Strategies</h2>
              </div>
              <div className="flex space-x-2">
                <div className="bg-zinc-800 rounded-full overflow-hidden flex text-xs">
                  <button 
                    className={`px-3 py-1.5 transition-colors ${timeFilter === 'Week' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'}`}
                    onClick={() => setTimeFilter('Week')}
                  >
                    Week
                  </button>
                  <button 
                    className={`px-3 py-1.5 transition-colors ${timeFilter === 'Month' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'}`}
                    onClick={() => setTimeFilter('Month')}
                  >
                    Month
                  </button>
                  <button 
                    className={`px-3 py-1.5 transition-colors ${timeFilter === 'Year' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'}`}
                    onClick={() => setTimeFilter('Year')}
                  >
                    Year
                  </button>
                </div>
              </div>
            </div>
            
            {/* Strategy Cards */}
            <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {TRENDING_STRATEGIES.map((strategy) => (
                <div 
                  key={strategy.id} 
                    className="bg-zinc-800/50 rounded-xl p-5 border border-zinc-700/30 hover:border-indigo-500/30 transition-all duration-300 group"
                >
                    <div className="flex items-center mb-4">
                      <div className={`w-10 h-10 ${strategy.iconBg} rounded-lg flex items-center justify-center text-white font-bold mr-3`}>
                      {strategy.icon}
                    </div>
                    <div>
                        <div className="text-xs text-zinc-400">Strategy</div>
                      <div className="text-white font-medium">{strategy.name}</div>
                      </div>
                      <div className="ml-auto">
                        <div className="w-7 h-7 rounded-full bg-zinc-700/50 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                          <ChevronRight className="w-4 h-4 text-indigo-400" />
                    </div>
                  </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-xs text-zinc-400">Reward Rate</div>
                        <div className="text-white text-lg font-semibold">{strategy.reward}</div>
                      </div>
                      <div className={`px-2 py-1 rounded-md ${strategy.isPositive ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'} text-xs font-medium flex items-center`}>
                        {strategy.isPositive ? 
                          <ArrowUpRight className="w-3 h-3 mr-1" /> : 
                          <TrendingUp className="w-3 h-3 mr-1 transform rotate-180" />} 
                      {strategy.change}
                    </div>
                  </div>
                  
                    <div className="mt-1">
                      <div className={`h-10 ${strategy.chartColor}`}>
                      {/* This would be replaced with an actual chart component */}
                      <div className="h-full w-full flex items-end">
                          <div className="h-full w-full rounded-lg bg-current opacity-10"></div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-zinc-500">Today</span>
                        <span className={`text-xs font-medium ${strategy.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                          {strategy.value}
                        </span>
                    </div>
                  </div>
                </div>
              ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Broker Connection and Stock Table */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="bg-zinc-900/80 rounded-xl border border-zinc-800/50 overflow-hidden shadow-xl">
            <div className="p-6 border-b border-zinc-800/50 flex justify-between items-center">
              <div className="flex items-center">
                <BarChart2 className="w-5 h-5 text-indigo-500 mr-2" />
                <h2 className="text-white text-lg font-medium">NSE/BSE Market Overview</h2>
              </div>
              <button className="text-indigo-500 hover:text-indigo-400 transition-colors text-sm font-medium flex items-center">
                Refresh <RefreshCw className="w-4 h-4 ml-1" />
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-zinc-800/30 text-left text-xs font-medium text-zinc-400 tracking-wider">
                    <th className="px-6 py-3">Symbol</th>
                    <th className="px-6 py-3">Company Name</th>
                    <th className="px-6 py-3">High</th>
                    <th className="px-6 py-3">Low</th>
                    <th className="px-6 py-3">Prev Close</th>
                    <th className="px-6 py-3">Change</th>
                    <th className="px-6 py-3">5 Day</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/30">
                  {STOCKS_DATA.map((stock, index) => (
                    <tr key={index} className="hover:bg-zinc-800/20 transition-colors">
                      <td className="px-6 py-4 text-white font-medium">{stock.symbol}</td>
                      <td className="px-6 py-4 text-zinc-300">{stock.company}</td>
                      <td className="px-6 py-4 text-white">{stock.high}</td>
                      <td className="px-6 py-4 text-white">{stock.low}</td>
                      <td className="px-6 py-4 text-white">{stock.prevClose}</td>
                      <td className={`px-6 py-4 ${stock.isPositive ? 'text-green-500' : 'text-red-500'} flex items-center`}>
                        {stock.isPositive ? 
                          <ArrowUpRight className="w-3.5 h-3.5 mr-1" /> : 
                          <TrendingUp className="w-3.5 h-3.5 mr-1 transform rotate-180" />} 
                        {stock.isPositive ? '+' : ''}{stock.change}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-1">
                          {stock.performance.map((day, i) => (
                            <div 
                              key={i} 
                              className={`w-5 h-5 rounded-sm ${day === 1 ? 'bg-green-500' : 'bg-red-500'}`}
                            ></div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="space-y-6">
            {/* Today's Market Activity */}
            <div className="bg-zinc-900/80 rounded-xl border border-zinc-800/50 overflow-hidden shadow-xl">
              <div className="p-6 border-b border-zinc-800/50 flex items-center">
                <Activity className="w-5 h-5 text-indigo-500 mr-2" />
                <h2 className="text-white text-lg font-medium">Market Activity</h2>
              </div>
              
              <div className="p-6">
              <div className="relative h-48">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-36 h-36">
                    {MARKET_ACTIVITY.map((item, index) => (
                      <div 
                        key={index}
                        className="absolute rounded-full flex items-center justify-center text-center"
                        style={{
                          width: `${110 - index * 20}px`,
                          height: `${110 - index * 20}px`,
                          top: `${index * 10}px`,
                          left: `${index * 10}px`,
                          backgroundColor: index === 0 ? '#a78bfa' : index === 1 ? '#f472b6' : '#1f2937',
                          zIndex: 3 - index
                        }}
                      >
                        <div>
                          <div className="text-lg font-bold text-white">{item.percentage}%</div>
                          <div className="text-xs text-white/70">{item.region}</div>
                        </div>
                      </div>
                    ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Available Balance */}
            <div className="bg-zinc-900/80 rounded-xl border border-zinc-800/50 overflow-hidden shadow-xl">
              <div className="p-6 border-b border-zinc-800/50 flex items-center">
                <DollarSign className="w-5 h-5 text-indigo-500 mr-2" />
                <h2 className="text-white text-lg font-medium">Available Balance</h2>
              </div>
              
              <div className="p-6 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Backtests:</span>
                  <span className="text-white font-medium">24</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Credits:</span>
                  <span className="text-white font-medium">15</span>
                </div>
                <div className="border-t border-zinc-700/30 my-3 pt-3"></div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Plans:</span>
                  <span className="text-indigo-400 font-medium">Premium Plan</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* My Stocks Section */}
      <div className="bg-zinc-900/80 rounded-xl border border-zinc-800/50 overflow-hidden shadow-xl">
        <div className="p-6 border-b border-zinc-800/50 flex justify-between items-center">
          <div className="flex items-center">
            <BarChart2 className="w-5 h-5 text-indigo-500 mr-2" />
            <h2 className="text-white text-lg font-medium">My Indian Stocks</h2>
          </div>
          <button className="text-indigo-500 hover:text-indigo-400 transition-colors text-sm font-medium flex items-center">
            View All <ChevronRight className="w-4 h-4 ml-1" />
          </button>
          </div>
          
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-zinc-800/30 text-left text-xs font-medium text-zinc-400 tracking-wider">
                <th className="px-6 py-3">Symbol</th>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Last Price</th>
                <th className="px-6 py-3">Change</th>
                <th className="px-6 py-3">Market Cap</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/30">
              {STOCKS_DATA.map((stock) => (
                <tr key={stock.symbol} className="hover:bg-zinc-800/20 transition-colors">
                  <td className="px-6 py-4 text-white font-medium">{stock.symbol}</td>
                  <td className="px-6 py-4 text-zinc-300">{stock.company}</td>
                  <td className="px-6 py-4 text-white font-medium">{stock.high}</td>
                  <td className={`px-6 py-4 ${stock.isPositive ? 'text-green-500' : 'text-red-500'} flex items-center`}>
                    {stock.isPositive ? 
                      <ArrowUpRight className="w-3.5 h-3.5 mr-1" /> : 
                      <TrendingUp className="w-3.5 h-3.5 mr-1 transform rotate-180" />}
                    {stock.change}
                  </td>
                  <td className="px-6 py-4 text-zinc-300">{stock.marketCap}</td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button className="p-1.5 rounded-lg bg-indigo-600/10 text-indigo-500 hover:bg-indigo-600/20 transition-colors">
                        <LineChart className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 rounded-lg bg-zinc-700/30 text-zinc-400 hover:bg-zinc-700/50 hover:text-white transition-colors">
                        <RefreshCw className="w-4 h-4" />
                      </button>
            </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
