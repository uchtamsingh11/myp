'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../../utils/supabase';

export default function BotsNseBseComponent() {
  const [loading, setLoading] = useState(true);
  const [strategies, setStrategies] = useState([]);
  const [activeTab, setActiveTab] = useState('available');

  // Simulated data for strategies
  const availableStrategies = [
    {
      id: 1,
      name: 'Nifty Momentum Trader',
      type: 'Equity',
      market: 'NSE',
      description: 'Trades Nifty based on momentum indicators',
      backtestWinRate: '68%',
      price: 150,
    },
    {
      id: 2,
      name: 'Bank Nifty Scalper',
      type: 'Index',
      market: 'NSE',
      description: 'High-frequency scalping on Bank Nifty',
      backtestWinRate: '59%',
      price: 200,
    },
    {
      id: 3,
      name: 'HDFC Bank Swing Trader',
      type: 'Equity',
      market: 'NSE',
      description: 'Multi-day swing trades on HDFC Bank',
      backtestWinRate: '72%',
      price: 180,
    },
    {
      id: 4,
      name: 'Sensex Trend Follower',
      type: 'Index',
      market: 'BSE',
      description: 'Follows major trends in Sensex',
      backtestWinRate: '64%',
      price: 170,
    },
    {
      id: 5,
      name: 'Reliance Breakout Detector',
      type: 'Equity',
      market: 'BSE',
      description: 'Detects and trades breakouts in Reliance stock',
      backtestWinRate: '62%',
      price: 160,
    },
  ];

  // Load data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real app, you would fetch actual data from Supabase here
        setStrategies(availableStrategies);
      } catch (error) {
        console.error('Error loading strategies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Simulate loading for demo purposes
    setTimeout(() => setLoading(false), 800);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-zinc-700">
        <div className="flex space-x-6">
          <button
            className={`py-3 px-1 font-medium relative ${
              activeTab === 'available' ? 'text-indigo-400' : 'text-zinc-400 hover:text-zinc-300'
            }`}
            onClick={() => setActiveTab('available')}
          >
            Available Strategies
            {activeTab === 'available' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"
                initial={false}
              />
            )}
          </button>
          <button
            className={`py-3 px-1 font-medium relative ${
              activeTab === 'active' ? 'text-indigo-400' : 'text-zinc-400 hover:text-zinc-300'
            }`}
            onClick={() => setActiveTab('active')}
          >
            My Active Bots
            {activeTab === 'active' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"
                initial={false}
              />
            )}
          </button>
          <button
            className={`py-3 px-1 font-medium relative ${
              activeTab === 'history' ? 'text-indigo-400' : 'text-zinc-400 hover:text-zinc-300'
            }`}
            onClick={() => setActiveTab('history')}
          >
            History
            {activeTab === 'history' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"
                initial={false}
              />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'available' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium">Available NSE/BSE Bot Strategies</h2>
              <div className="flex space-x-2">
                <select className="bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm">
                  <option>All Markets</option>
                  <option>NSE</option>
                  <option>BSE</option>
                </select>
                <select className="bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm">
                  <option>All Types</option>
                  <option>Equity</option>
                  <option>Index</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {strategies.map(strategy => (
                <motion.div
                  key={strategy.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-4 hover:bg-zinc-800 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{strategy.name}</h3>
                      <div className="flex space-x-2 mt-1">
                        <span className="bg-zinc-700 px-2 py-0.5 rounded text-xs">
                          {strategy.market}
                        </span>
                        <span className="bg-zinc-700 px-2 py-0.5 rounded text-xs">
                          {strategy.type}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-zinc-400">Price</div>
                      <div className="font-semibold text-indigo-400">{strategy.price} coins</div>
                    </div>
                  </div>
                  <p className="text-zinc-400 text-sm mt-3">{strategy.description}</p>
                  <div className="flex justify-between items-center mt-4">
                    <div>
                      <span className="text-sm text-zinc-400">Backtest Win Rate: </span>
                      <span className="text-green-400 font-medium">{strategy.backtestWinRate}</span>
                    </div>
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded text-sm">
                      Activate Bot
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'active' && (
          <div className="py-6 text-center">
            <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-zinc-700 rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-zinc-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">No Active Bots</h3>
              <p className="text-zinc-400 text-sm mb-6 max-w-md mx-auto">
                You don't have any active NSE/BSE trading bots yet. Activate a bot to start
                automated trading.
              </p>
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded">
                Browse Available Strategies
              </button>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="py-6 text-center">
            <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-zinc-700 rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-zinc-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">No Bot History</h3>
              <p className="text-zinc-400 text-sm mb-6 max-w-md mx-auto">
                You haven't used any NSE/BSE bots yet. Your trading history will appear here once
                you start using a bot.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
