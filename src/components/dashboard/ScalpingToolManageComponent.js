'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../utils/supabase';

export default function ScalpingToolManageComponent() {
  const [activeTab, setActiveTab] = useState('scanner');
  const [loading, setLoading] = useState(true);
  const [markets, setMarkets] = useState([]);
  const [timeframe, setTimeframe] = useState('5m');
  const [scanResults, setScanResults] = useState([]);
  const [activeSignals, setActiveSignals] = useState([]);

  // Sample market data
  const marketOptions = [
    { id: 'nse', name: 'NSE' },
    { id: 'bse', name: 'BSE' },
    { id: 'mcx', name: 'MCX' },
    { id: 'forex', name: 'Forex' },
    { id: 'crypto', name: 'Crypto' },
  ];

  // Sample scan results data
  const sampleResults = [
    {
      id: 1,
      symbol: 'NIFTY',
      pattern: 'Double Top',
      reliability: 'High',
      signal: 'Sell',
      timeframe: '5m',
      timestamp: new Date().toISOString(),
    },
    {
      id: 2,
      symbol: 'RELIANCE',
      pattern: 'Bull Flag',
      reliability: 'Medium',
      signal: 'Buy',
      timeframe: '5m',
      timestamp: new Date().toISOString(),
    },
    {
      id: 3,
      symbol: 'HDFC',
      pattern: 'Support Bounce',
      reliability: 'High',
      signal: 'Buy',
      timeframe: '5m',
      timestamp: new Date().toISOString(),
    },
    {
      id: 4,
      symbol: 'INFY',
      pattern: 'Descending Triangle',
      reliability: 'Medium',
      signal: 'Sell',
      timeframe: '15m',
      timestamp: new Date().toISOString(),
    },
    {
      id: 5,
      symbol: 'TATASTEEL',
      pattern: 'MACD Crossover',
      reliability: 'Medium',
      signal: 'Buy',
      timeframe: '5m',
      timestamp: new Date().toISOString(),
    },
  ];

  // Sample active signals
  const sampleActiveSignals = [
    {
      id: 101,
      symbol: 'RELIANCE',
      entryPrice: '2450.75',
      targetPrice: '2480.00',
      stopLoss: '2435.00',
      signal: 'Buy',
      timestamp: new Date(Date.now() - 1200000).toISOString(),
      pnl: '+1.2%',
    },
    {
      id: 102,
      symbol: 'HDFCBANK',
      entryPrice: '1620.30',
      targetPrice: '1645.00',
      stopLoss: '1610.00',
      signal: 'Buy',
      timestamp: new Date(Date.now() - 900000).toISOString(),
      pnl: '+0.8%',
    },
  ];

  // Load data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real app, you would fetch actual data from Supabase here
        setMarkets(marketOptions);
        setScanResults(sampleResults);
        setActiveSignals(sampleActiveSignals);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Simulate loading for demo purposes
    setTimeout(() => setLoading(false), 800);
  }, []);

  const runScan = () => {
    setLoading(true);
    // Simulate scan delay
    setTimeout(() => {
      setScanResults(sampleResults);
      setLoading(false);
    }, 1000);
  };

  const addToSignals = result => {
    const newSignal = {
      id: Date.now(),
      symbol: result.symbol,
      entryPrice: result.currentPrice || '0.00',
      targetPrice: result.targetPrice || '0.00',
      stopLoss: result.stopLoss || '0.00',
      signal: result.signal,
      timestamp: new Date().toISOString(),
      pnl: '0%',
    };

    setActiveSignals([newSignal, ...activeSignals]);
  };

  if (loading && activeSignals.length === 0 && scanResults.length === 0) {
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
              activeTab === 'scanner' ? 'text-indigo-400' : 'text-zinc-400 hover:text-zinc-300'
            }`}
            onClick={() => setActiveTab('scanner')}
          >
            Market Scanner
            {activeTab === 'scanner' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"
                initial={false}
              />
            )}
          </button>
          <button
            className={`py-3 px-1 font-medium relative ${
              activeTab === 'setup' ? 'text-indigo-400' : 'text-zinc-400 hover:text-zinc-300'
            }`}
            onClick={() => setActiveTab('setup')}
          >
            Trade Setup
            {activeTab === 'setup' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"
                initial={false}
              />
            )}
          </button>
          <button
            className={`py-3 px-1 font-medium relative ${
              activeTab === 'signals' ? 'text-indigo-400' : 'text-zinc-400 hover:text-zinc-300'
            }`}
            onClick={() => setActiveTab('signals')}
          >
            Active Signals
            {activeTab === 'signals' && (
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
        {activeTab === 'scanner' && (
          <div className="space-y-6">
            <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-4">
              <h3 className="font-medium mb-4">Scan Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Markets</label>
                  <select
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2"
                    value="nse"
                  >
                    {marketOptions.map(market => (
                      <option key={market.id} value={market.id}>
                        {market.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Timeframe</label>
                  <select
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2"
                    value={timeframe}
                    onChange={e => setTimeframe(e.target.value)}
                  >
                    <option value="1m">1 Minute</option>
                    <option value="5m">5 Minutes</option>
                    <option value="15m">15 Minutes</option>
                    <option value="30m">30 Minutes</option>
                    <option value="1h">1 Hour</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Pattern Type</label>
                  <select className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2">
                    <option value="all">All Patterns</option>
                    <option value="reversal">Reversal Patterns</option>
                    <option value="continuation">Continuation Patterns</option>
                    <option value="breakout">Breakout Patterns</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
                    onClick={runScan}
                    disabled={loading}
                  >
                    {loading ? 'Scanning...' : 'Run Scan'}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg overflow-hidden">
              <div className="border-b border-zinc-700 p-4">
                <h3 className="font-medium">Scan Results</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-zinc-700">
                  <thead className="bg-zinc-800">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider"
                      >
                        Symbol
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider"
                      >
                        Pattern
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider"
                      >
                        Signal
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider"
                      >
                        Reliability
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider"
                      >
                        Timeframe
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider"
                      >
                        Timestamp
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-zinc-400 uppercase tracking-wider"
                      >
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-zinc-800/30 divide-y divide-zinc-700">
                    {scanResults.map(result => (
                      <tr key={result.id} className="hover:bg-zinc-700/30">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {result.symbol}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                          {result.pattern}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              result.signal === 'Buy'
                                ? 'bg-green-900/50 text-green-400'
                                : 'bg-red-900/50 text-red-400'
                            }`}
                          >
                            {result.signal}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                          {result.reliability}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                          {result.timeframe}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400">
                          {new Date(result.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            className="text-indigo-400 hover:text-indigo-300"
                            onClick={() => addToSignals(result)}
                          >
                            Add Signal
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'setup' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-4">
              <h3 className="font-medium mb-4">Trade Parameters</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Symbol</label>
                  <input
                    type="text"
                    placeholder="Enter symbol (e.g. NIFTY, RELIANCE)"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Trade Type</label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="tradeType"
                        value="buy"
                        className="mr-2"
                        defaultChecked
                      />
                      <span>Buy</span>
                    </label>
                    <label className="flex items-center">
                      <input type="radio" name="tradeType" value="sell" className="mr-2" />
                      <span>Sell</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Entry Price</label>
                  <input
                    type="text"
                    placeholder="0.00"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Stop Loss</label>
                    <input
                      type="text"
                      placeholder="0.00"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Target Price</label>
                    <input
                      type="text"
                      placeholder="0.00"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="1"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2"
                  />
                </div>

                <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded">
                  Create Trade Signal
                </button>
              </div>
            </div>

            <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-4">
              <h3 className="font-medium mb-4">Trade Preview</h3>

              <div className="aspect-video bg-zinc-900 rounded mb-4 flex items-center justify-center">
                <span className="text-zinc-500">Chart preview will appear here</span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-zinc-900 p-3 rounded">
                  <div className="text-xs text-zinc-500 mb-1">Risk</div>
                  <div className="text-lg font-medium text-red-400">₹0.00</div>
                </div>
                <div className="bg-zinc-900 p-3 rounded">
                  <div className="text-xs text-zinc-500 mb-1">Reward</div>
                  <div className="text-lg font-medium text-green-400">₹0.00</div>
                </div>
              </div>

              <div className="bg-zinc-900 p-3 rounded mb-4">
                <div className="text-xs text-zinc-500 mb-1">Risk-to-Reward Ratio</div>
                <div className="text-lg font-medium">0.00</div>
              </div>

              <div className="text-sm text-zinc-400">
                <p>
                  Enter all trade parameters to see a preview of your setup and calculate risk
                  metrics automatically.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'signals' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Active Signals ({activeSignals.length})</h3>
              <div className="flex items-center space-x-2">
                <select className="bg-zinc-800 border border-zinc-700 rounded-md px-3 py-1.5 text-sm">
                  <option>All Signals</option>
                  <option>Buy Only</option>
                  <option>Sell Only</option>
                </select>
                <button className="bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-md text-sm">
                  Refresh
                </button>
              </div>
            </div>

            {activeSignals.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {activeSignals.map(signal => (
                  <motion.div
                    key={signal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`bg-zinc-800/50 border ${
                      signal.signal === 'Buy' ? 'border-green-800/30' : 'border-red-800/30'
                    } rounded-lg p-4`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold text-lg">{signal.symbol}</h4>
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium ${
                              signal.signal === 'Buy'
                                ? 'bg-green-900/50 text-green-400'
                                : 'bg-red-900/50 text-red-400'
                            }`}
                          >
                            {signal.signal}
                          </span>
                        </div>
                        <div className="text-xs text-zinc-400 mt-1">
                          Created: {new Date(signal.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-lg font-semibold ${
                            signal.pnl.startsWith('+') ? 'text-green-400' : 'text-red-400'
                          }`}
                        >
                          {signal.pnl}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-4">
                      <div className="bg-zinc-900 p-2 rounded">
                        <div className="text-xs text-zinc-500">Entry</div>
                        <div className="font-medium">{signal.entryPrice}</div>
                      </div>
                      <div className="bg-zinc-900 p-2 rounded">
                        <div className="text-xs text-zinc-500">Target</div>
                        <div className="font-medium text-green-400">{signal.targetPrice}</div>
                      </div>
                      <div className="bg-zinc-900 p-2 rounded">
                        <div className="text-xs text-zinc-500">Stop Loss</div>
                        <div className="font-medium text-red-400">{signal.stopLoss}</div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-4">
                      <button className="bg-zinc-700 hover:bg-zinc-600 text-white px-3 py-1 rounded text-sm">
                        View Chart
                      </button>
                      <div className="flex space-x-2">
                        <button className="bg-green-700/50 hover:bg-green-700 text-white px-3 py-1 rounded text-sm">
                          Take Profit
                        </button>
                        <button className="bg-red-700/50 hover:bg-red-700 text-white px-3 py-1 rounded text-sm">
                          Stop Out
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
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
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium mb-2">No Active Signals</h3>
                  <p className="text-zinc-400 text-sm mb-6 max-w-md mx-auto">
                    You don't have any active trade signals yet. Use the Market Scanner to find
                    opportunities or create a new Trade Setup.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
