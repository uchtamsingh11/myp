'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { supabase } from '../../utils/supabase';
import Image from 'next/image';

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
    name: 'Meta Platforms',
    icon: 'M',
    iconBg: 'bg-blue-500',
    reward: '48.23%',
    change: '-2.25%',
    isPositive: false,
    value: '-$06.25',
    chartColor: 'text-red-500',
  },
  {
    id: 2,
    name: 'Tesla, Inc',
    icon: 'T',
    iconBg: 'bg-red-500',
    reward: '48.23%',
    change: '+2.25%',
    isPositive: true,
    value: '+$10.25',
    chartColor: 'text-green-500',
  },
  {
    id: 3,
    name: 'NVIDIA Corporation',
    icon: 'N',
    iconBg: 'bg-green-500',
    reward: '48.23%',
    change: '+2.25%',
    isPositive: true,
    value: '+$2.85',
    chartColor: 'text-green-500',
  },
];

// Mock data for the stock table
const STOCKS_DATA = [
  {
    company: 'Microsoft Corporation Common Stock',
    high: '$490.82',
    low: '$385.25',
    prevClose: '$421.27',
    change: '-1.23',
    gain: '2.4%',
    performance: [1, 1, -1, 1, 1],
    isPositive: false,
  },
  {
    company: 'Apple Inc. Common Stock',
    high: '$225.87',
    low: '$124.87',
    prevClose: '$171.48',
    change: '12.53',
    gain: '5.8%',
    performance: [1, -1, -1, 1, 1],
    isPositive: true,
  },
  {
    company: 'NVIDIA Corporation Common Stock',
    high: '$1008.57',
    low: '$750.28',
    prevClose: '$903.56',
    change: '7.56',
    gain: '8.7%',
    performance: [1, 1, 1, -1, -1],
    isPositive: true,
  },
  {
    company: 'Tesla, Inc. Common Stock',
    high: '$275.30',
    low: '$154.45',
    prevClose: '$175.48',
    change: '8.47',
    gain: '8.8%',
    performance: [1, -1, -1, 1, 1],
    isPositive: true,
  },
  {
    company: 'NVIDIA Corporation Common Stock',
    high: '$1008.57',
    low: '$750.28',
    prevClose: '$903.56',
    change: '7.56',
    gain: '8.7%',
    performance: [1, 1, -1, -1, -1],
    isPositive: true,
  },
  {
    company: 'JP Morgan Chase & Co. Common Stock',
    high: '$225.87',
    low: '$124.87',
    prevClose: '$200.48',
    change: '0.98',
    gain: '1.58%',
    performance: [1, -1, -1, 1, 1],
    isPositive: true,
  },
  {
    company: 'NVIDIA Corporation Common Stock',
    high: '$1008.57',
    low: '$750.28',
    prevClose: '$903.56',
    change: '7.56',
    gain: '8.7%',
    performance: [1, 1, -1, -1, -1],
    isPositive: true,
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
  { region: 'USA', percentage: 73 },
  { region: 'Australia', percentage: 65 },
  { region: 'Canada', percentage: 51 },
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
      <div className="flex items-center justify-center h-[60vh] bg-zinc-950 rounded-xl">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Trending Strategy Section */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-white text-xl font-medium">Top Trending Strategy</h2>
              <div className="bg-lime-200 px-4 py-1.5 rounded-full">
                <select 
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="bg-transparent text-sm font-medium text-gray-800 outline-none cursor-pointer"
                >
                  <option>Week</option>
                  <option>Month</option>
                  <option>Year</option>
                </select>
              </div>
            </div>
            
            {/* Strategy Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {TRENDING_STRATEGIES.map((strategy) => (
                <div 
                  key={strategy.id} 
                  className="bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-xl p-4 border border-zinc-700/30"
                >
                  <div className="flex items-center mb-2">
                    <div className={`w-10 h-10 ${strategy.iconBg} rounded-md flex items-center justify-center text-white font-bold mr-3`}>
                      {strategy.icon}
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Backtest Tested</div>
                      <div className="text-white font-medium">{strategy.name}</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-xs text-gray-400">Reward Rate</div>
                      <div className="text-white text-xl font-semibold">{strategy.reward}</div>
                    </div>
                    <div className={`px-2 py-1 rounded-md ${strategy.isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'} text-sm font-medium`}>
                      {strategy.change}
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <div className="text-right text-sm font-medium mb-1">{strategy.value}</div>
                    <div className={`h-12 ${strategy.chartColor}`}>
                      {/* This would be replaced with an actual chart component */}
                      <div className="h-full w-full flex items-end">
                        <div className="w-full h-8 rounded-md bg-current opacity-20"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Backtest Section */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-fuchsia-600 to-amber-400 rounded-xl p-6 shadow-xl h-full relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-white text-2xl font-bold mb-1">Backtest</h2>
              <p className="text-white/90 mb-4">Develop and test strategies using our lightning-fast backtest engine.</p>
              
              <button className="bg-zinc-900 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 hover:bg-zinc-800 transition">
                <span>Create Strategy</span>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute right-0 bottom-0 transform translate-x-1/4 translate-y-1/4">
              <div className="relative w-40 h-40">
                <div className="absolute inset-0 bg-white/10 rounded-full"></div>
                <div className="absolute right-5 top-5 bg-white/30 p-2 rounded-full">
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none">
                    <path d="M13 10V3L4 14h7v7l9-11h-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Chart visualization */}
            <div className="absolute bottom-6 left-6 right-16 h-28">
              <div className="relative h-full w-full">
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white/20 to-transparent rounded-md"></div>
                <div className="absolute bottom-0 left-1/4 h-16 w-4 bg-white/40 rounded-t-md"></div>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-28 w-4 bg-white/40 rounded-t-md"></div>
                <div className="absolute bottom-0 right-1/4 h-20 w-4 bg-white/40 rounded-t-md"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Broker Connection and Stock Table */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl p-6 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-zinc-700/30">
                    <th className="pb-3 font-medium text-gray-400">Company Name</th>
                    <th className="pb-3 font-medium text-gray-400">High</th>
                    <th className="pb-3 font-medium text-gray-400">Low</th>
                    <th className="pb-3 font-medium text-gray-400">Prev Close</th>
                    <th className="pb-3 font-medium text-gray-400">Change</th>
                    <th className="pb-3 font-medium text-gray-400">Gain</th>
                    <th className="pb-3 font-medium text-gray-400">5 Day Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {STOCKS_DATA.map((stock, index) => (
                    <tr key={index} className="border-b border-zinc-800/30">
                      <td className="py-3 text-white">{stock.company}</td>
                      <td className="py-3 text-white">{stock.high}</td>
                      <td className="py-3 text-white">{stock.low}</td>
                      <td className="py-3 text-white">{stock.prevClose}</td>
                      <td className={`py-3 ${stock.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                        {stock.isPositive ? '+' : ''}{stock.change}
                      </td>
                      <td className={`py-3 ${stock.isPositive ? 'text-green-500' : 'text-red-500'}`}>{stock.gain}</td>
                      <td className="py-3">
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
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl p-6 shadow-xl">
              <h2 className="text-white text-lg font-medium mb-4">Today's Market Activity</h2>
              
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
            
            {/* Available Balance */}
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl p-6 shadow-xl">
              <h2 className="text-white text-lg font-medium mb-4">Available Balance</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-white">Backtests:</span>
                  <span className="text-white font-medium">24</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white">Credits:</span>
                  <span className="text-white font-medium">15</span>
                </div>
                <div className="border-t border-zinc-700/30 my-3 pt-3"></div>
                <div className="flex justify-between items-center">
                  <span className="text-white">Plans:</span>
                  <span className="text-indigo-400 font-medium">Premium Plan</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Broker Connection Section */}
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl p-6 shadow-xl">
        <h2 className="text-white text-lg font-medium mb-4">Link your brokerage account to implement strategies in real-time.</h2>
        
        <div className="flex flex-wrap gap-4">
          <div className="bg-zinc-800 p-3 rounded-xl hover:bg-zinc-700/50 transition">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center p-2">
              {getBrokerIcon('alice_blue')}
            </div>
            <div className="mt-2 text-center">
              <div className="text-xs text-gray-300 truncate max-w-[80px]">Alice Blue</div>
            </div>
          </div>
          
          <div className="bg-zinc-800 p-3 rounded-xl hover:bg-zinc-700/50 transition">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center p-2">
              {getBrokerIcon('angel_broking')}
            </div>
            <div className="mt-2 text-center">
              <div className="text-xs text-gray-300 truncate max-w-[80px]">Angel Broking</div>
            </div>
          </div>
          
          <div className="bg-zinc-800 p-3 rounded-xl hover:bg-zinc-700/50 transition">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center p-2">
              {getBrokerIcon('binance')}
            </div>
            <div className="mt-2 text-center">
              <div className="text-xs text-gray-300 truncate max-w-[80px]">Binance</div>
            </div>
          </div>
          
          <div className="bg-zinc-800 p-3 rounded-xl hover:bg-zinc-700/50 transition">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center p-2">
              {getBrokerIcon('default')}
            </div>
            <div className="mt-2 text-center">
              <div className="text-xs text-gray-300 truncate max-w-[80px]">Delta Exchange</div>
            </div>
          </div>
          
          <div className="bg-zinc-800 p-3 rounded-xl hover:bg-zinc-700/50 transition">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center p-2">
              {getBrokerIcon('default')}
            </div>
            <div className="mt-2 text-center">
              <div className="text-xs text-gray-300 truncate max-w-[80px]">Dhan</div>
            </div>
          </div>
          
          <div className="bg-zinc-800 p-3 rounded-xl hover:bg-zinc-700/50 transition">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center p-2">
              {getBrokerIcon('default')}
            </div>
            <div className="mt-2 text-center">
              <div className="text-xs text-gray-300 truncate max-w-[80px]">Finvisia</div>
            </div>
          </div>
          
          <div className="bg-zinc-800 p-3 rounded-xl hover:bg-zinc-700/50 transition">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center p-2">
              {getBrokerIcon('default')}
            </div>
            <div className="mt-2 text-center">
              <div className="text-xs text-gray-300 truncate max-w-[80px]">Fyers</div>
            </div>
          </div>
          
          <div className="bg-zinc-800 p-3 rounded-xl hover:bg-zinc-700/50 transition">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center p-2">
              {getBrokerIcon('default')}
            </div>
            <div className="mt-2 text-center">
              <div className="text-xs text-gray-300 truncate max-w-[80px]">ICICI Direct</div>
            </div>
          </div>
          
          <div className="bg-zinc-800 p-3 rounded-xl hover:bg-zinc-700/50 transition">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center p-2">
              {getBrokerIcon('default')}
            </div>
            <div className="mt-2 text-center">
              <div className="text-xs text-gray-300 truncate max-w-[80px]">IIFL</div>
            </div>
          </div>
          
          <div className="bg-zinc-800 p-3 rounded-xl hover:bg-zinc-700/50 transition">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center p-2">
              {getBrokerIcon('default')}
            </div>
            <div className="mt-2 text-center">
              <div className="text-xs text-gray-300 truncate max-w-[80px]">Kotak Neo</div>
            </div>
          </div>
          
          <div className="bg-zinc-800 p-3 rounded-xl hover:bg-zinc-700/50 transition">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center p-2">
              {getBrokerIcon('default')}
            </div>
            <div className="mt-2 text-center">
              <div className="text-xs text-gray-300 truncate max-w-[80px]">MetaTrader 4</div>
            </div>
          </div>
          
          <div className="bg-zinc-800 p-3 rounded-xl hover:bg-zinc-700/50 transition">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center p-2">
              {getBrokerIcon('default')}
            </div>
            <div className="mt-2 text-center">
              <div className="text-xs text-gray-300 truncate max-w-[80px]">MetaTrader 5</div>
            </div>
          </div>
          
          <div className="bg-zinc-800 p-3 rounded-xl hover:bg-zinc-700/50 transition">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center p-2">
              {getBrokerIcon('default')}
            </div>
            <div className="mt-2 text-center">
              <div className="text-xs text-gray-300 truncate max-w-[80px]">Upstox</div>
            </div>
          </div>
          
          <div className="bg-zinc-800 p-3 rounded-xl hover:bg-zinc-700/50 transition">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center p-2">
              {getBrokerIcon('zerodha')}
            </div>
            <div className="mt-2 text-center">
              <div className="text-xs text-gray-300 truncate max-w-[80px]">Zerodha</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
