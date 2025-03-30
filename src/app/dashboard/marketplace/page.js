'use client';

import { useState } from 'react';
import { Search, Filter, ArrowRight, Star, ChevronDown, DollarSign, Plus, TrendingUp, Download, BarChart2, Users, Clock, ChevronRight, Award, Cpu, Shield, LineChart } from 'lucide-react';
import Link from 'next/link';

// Sample strategy data for demonstration
const SAMPLE_STRATEGIES = [
  {
    id: 1,
    name: 'Nifty Momentum Strategy',
    description: 'A trend-following strategy that uses Nifty index momentum and moving average crossovers to identify potential entry and exit points.',
    author: 'TradingGuru',
    rating: 4.8,
    reviews: 124,
    price: 14999,
    returns: '23.5%',
    timeframe: '1D',
    asset: 'Nifty, BankNifty',
    tags: ['Momentum', 'Index Trading', 'Swing'],
    image: '/strategy1.jpg'
  },
  {
    id: 2,
    name: 'RSI Reversal for Indian Markets',
    description: 'Identifies oversold and overbought conditions in NSE stocks using the Relative Strength Index to capture reversal opportunities.',
    author: 'AlgoTrader42',
    rating: 4.6,
    reviews: 89,
    price: 9999,
    returns: '18.7%',
    timeframe: '4H',
    asset: 'NSE Stocks, Midcap',
    tags: ['RSI', 'Mean Reversion', 'Intraday'],
    image: '/strategy2.jpg'
  },
  {
    id: 3,
    name: 'BankNifty Options Strategy',
    description: 'Captures volatility patterns in BankNifty options with precise entry and exit rules for consistent weekly returns.',
    author: 'OptionsExpert',
    rating: 4.9,
    reviews: 156,
    price: 19999,
    returns: '27.3%',
    timeframe: '1H',
    asset: 'BankNifty Options',
    tags: ['Options', 'Weekly Expiry', 'Premium Selling'],
    image: '/strategy3.jpg'
  },
  {
    id: 4,
    name: 'NSE Mid-Small Cap Scanner',
    description: 'Identifies high-potential mid and small cap stocks on NSE with volume breakouts and institutional buying patterns.',
    author: 'ValueInvestor',
    rating: 4.5,
    reviews: 78,
    price: 12999,
    returns: '21.2%',
    timeframe: '1D',
    asset: 'NSE Midcap, Smallcap',
    tags: ['Swing Trading', 'Breakout', 'Fundamental'],
    image: '/strategy4.jpg'
  },
];

export default function Marketplace() {
  const [activeTab, setActiveTab] = useState('browse');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Filter strategies based on search term and category
  const filteredStrategies = SAMPLE_STRATEGIES.filter(strategy => {
    const matchesSearch = 
      strategy.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      strategy.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || 
      strategy.asset.toLowerCase().includes(selectedCategory.toLowerCase());
    
    return matchesSearch && matchesCategory;
  });

  const renderBrowseContent = () => {
    return (
      <div className="space-y-8">
        {/* Search and Filter Bar */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search strategies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-10 bg-zinc-800/80 border border-zinc-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-lg"
            />
            <Search className="absolute left-3 top-3.5 text-zinc-400 w-4 h-4" />
          </div>
          
          <div className="flex gap-4">
            <div className="relative">
              <select
                className="appearance-none px-4 py-3 pr-10 bg-zinc-800/80 border border-zinc-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-lg"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Assets</option>
                <option value="nifty">Nifty</option>
                <option value="banknifty">BankNifty</option>
                <option value="stocks">NSE Stocks</option>
                <option value="options">Options</option>
                <option value="futures">Futures</option>
                <option value="midcap">Midcap</option>
                <option value="smallcap">Smallcap</option>
              </select>
              <ChevronDown className="absolute right-3 top-3.5 text-zinc-400 w-4 h-4 pointer-events-none" />
            </div>
            
            <button className="flex items-center gap-2 px-4 py-3 bg-zinc-800/80 border border-zinc-700/50 rounded-lg text-white hover:bg-zinc-700 transition shadow-lg">
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">More Filters</span>
            </button>
          </div>
        </div>
        
        {/* Featured Strategy */}
        <div className="bg-gradient-to-r from-zinc-900 via-indigo-900/30 to-zinc-900 rounded-xl overflow-hidden border border-indigo-500/20 shadow-2xl">
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-1/2 p-6 md:p-8">
              <div className="inline-block px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-indigo-400 text-xs font-medium mb-4">
                FEATURED STRATEGY
              </div>
              <h2 className="text-white text-2xl font-bold mb-3">NSE AI Market Prediction</h2>
              <p className="text-zinc-300 mb-6">
                Our most advanced algorithmic strategy for Indian markets that combines machine learning with technical analysis to predict NSE movements with high accuracy.
              </p>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-3">
                  <div className="text-indigo-400 font-medium text-lg">36.8%</div>
                  <p className="text-xs text-zinc-400">Annual Return</p>
                </div>
                <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-3">
                  <div className="text-indigo-400 font-medium text-lg">1.65</div>
                  <p className="text-xs text-zinc-400">Sharpe Ratio</p>
                </div>
                <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-3">
                  <div className="text-indigo-400 font-medium text-lg">18.3%</div>
                  <p className="text-xs text-zinc-400">Max Drawdown</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-3 py-1 bg-zinc-800/70 border border-zinc-700/50 rounded-full text-xs text-zinc-300">Nifty 50</span>
                <span className="px-3 py-1 bg-zinc-800/70 border border-zinc-700/50 rounded-full text-xs text-zinc-300">AI Based</span>
                <span className="px-3 py-1 bg-zinc-800/70 border border-zinc-700/50 rounded-full text-xs text-zinc-300">Adaptive</span>
                <span className="px-3 py-1 bg-zinc-800/70 border border-zinc-700/50 rounded-full text-xs text-zinc-300">Intraday</span>
              </div>
              
              <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-lg">
                View Details <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="w-full md:w-1/2 bg-indigo-900/20 border-l border-indigo-500/20 p-8 flex items-center justify-center">
              <div className="relative w-full max-w-xs">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-indigo-400" />
                      <span className="text-white font-medium">Top Rated</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-zinc-400" />
                      <span className="text-zinc-400 text-sm">205 users</span>
                    </div>
                  </div>
                  
                  <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-zinc-400 text-sm">Price</span>
                      <span className="text-white text-xl font-bold">₹29,999</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-white">4.9</span>
                        <span className="text-zinc-500 text-xs">(205)</span>
                      </div>
                      <div className="text-xs text-zinc-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Updated 2 days ago
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-zinc-300">
                      <Cpu className="w-4 h-4 text-indigo-400" />
                      <span className="text-sm">AI-powered market analysis</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-300">
                      <LineChart className="w-4 h-4 text-indigo-400" />
                      <span className="text-sm">Backtested on 5 years of NSE data</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-300">
                      <Shield className="w-4 h-4 text-indigo-400" />
                      <span className="text-sm">Built-in risk management</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Strategy Grid */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <TrendingUp className="w-5 h-5 text-indigo-500 mr-2" />
              <h2 className="text-white text-xl font-semibold">Popular Strategies</h2>
            </div>
            <button className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-1 bg-zinc-800/50 px-3 py-1.5 rounded-lg">
              View All <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredStrategies.map((strategy) => (
              <div key={strategy.id} className="bg-zinc-800/50 rounded-xl overflow-hidden border border-zinc-700/50 hover:border-indigo-500/50 transition-all duration-300 shadow-lg group">
                <div className="h-40 bg-gradient-to-br from-zinc-800 to-zinc-900 relative flex items-center justify-center p-4 border-b border-zinc-700/50">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <TrendingUp className="w-20 h-20 text-zinc-700/50" />
                  </div>
                  
                  <div className="absolute top-0 left-0 right-0 p-4">
                    <div className="flex justify-between items-center">
                      <div className="bg-zinc-900/80 text-white text-xs px-2.5 py-1 rounded-full border border-zinc-700/50">
                        {strategy.timeframe}
                      </div>
                      <div className="bg-indigo-500/10 text-indigo-400 text-xs px-2.5 py-1 rounded-full border border-indigo-500/30">
                        {strategy.returns}
                      </div>
                    </div>
                  </div>
                  
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-zinc-900 to-transparent h-20"></div>
                </div>
                
                <div className="p-5">
                  <h3 className="text-white font-medium text-lg mb-2 group-hover:text-indigo-400 transition-colors">{strategy.name}</h3>
                  <p className="text-zinc-400 text-sm mb-4 line-clamp-2">{strategy.description}</p>
                  
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {strategy.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-0.5 bg-zinc-700/50 text-zinc-300 text-xs rounded-md">{tag}</span>
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-white">{strategy.rating}</span>
                      <span className="text-zinc-500 text-xs">({strategy.reviews})</span>
                    </div>
                    <div className="text-xs text-zinc-400">
                      {strategy.asset}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-white font-bold">₹{strategy.price.toLocaleString()}</span>
                    <Link 
                      href={`/dashboard/marketplace/${strategy.id}`}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderPublishContent = () => {
    return (
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-zinc-900 via-indigo-900/30 to-zinc-900 rounded-xl overflow-hidden border border-indigo-500/20 shadow-2xl">
          <div className="p-8 text-center">
            <h2 className="text-white text-2xl font-bold mb-3">Share Your Trading Expertise</h2>
            <p className="text-zinc-300 mb-6 max-w-2xl mx-auto">
              Monetize your successful trading strategies for Indian markets by publishing them on the marketplace. Set your own price and earn passive income while helping other traders succeed.
            </p>
            <Link 
              href="/dashboard/marketplace/publish"
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center gap-2 transition-colors shadow-lg"
            >
              <Plus className="w-4 h-4" /> Create New Strategy
            </Link>
          </div>
        </div>
        
        <div className="bg-zinc-800/50 rounded-xl border border-zinc-700/50 overflow-hidden shadow-xl">
          <div className="p-6 border-b border-zinc-700/50">
            <h3 className="text-white text-xl font-semibold">Strategy Publishing Guide</h3>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 border border-zinc-700/50 rounded-lg bg-zinc-900/50 hover:border-indigo-500/50 transition-all">
                <div className="w-10 h-10 bg-indigo-900 rounded-full flex items-center justify-center mb-4">
                  <span className="text-white font-bold">1</span>
                </div>
                <h4 className="text-white font-medium mb-2">Create Your Strategy</h4>
                <p className="text-zinc-400 text-sm">Develop and backtest your trading algorithm on NSE/BSE data to ensure it provides consistent results across different market conditions.</p>
              </div>
              
              <div className="p-5 border border-zinc-700/50 rounded-lg bg-zinc-900/50 hover:border-indigo-500/50 transition-all">
                <div className="w-10 h-10 bg-indigo-900 rounded-full flex items-center justify-center mb-4">
                  <span className="text-white font-bold">2</span>
                </div>
                <h4 className="text-white font-medium mb-2">Document Performance</h4>
                <p className="text-zinc-400 text-sm">Provide detailed performance metrics, including historical returns, drawdowns, Sharpe ratio, and other relevant statistics for Indian market conditions.</p>
              </div>
              
              <div className="p-5 border border-zinc-700/50 rounded-lg bg-zinc-900/50 hover:border-indigo-500/50 transition-all">
                <div className="w-10 h-10 bg-indigo-900 rounded-full flex items-center justify-center mb-4">
                  <span className="text-white font-bold">3</span>
                </div>
                <h4 className="text-white font-medium mb-2">Set Your Price</h4>
                <p className="text-zinc-400 text-sm">Determine a fair price in rupees for your strategy based on its complexity, performance, and value to potential Indian traders.</p>
              </div>
            </div>
            
            <div className="mt-8">
              <h4 className="text-white font-medium mb-3">Strategy Submission Requirements</h4>
              <ul className="text-zinc-400 space-y-2.5">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400 mt-1 text-lg">•</span>
                  <span>Minimum of 12 months of backtest data on NSE/BSE markets showing strategy performance</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400 mt-1 text-lg">•</span>
                  <span>Detailed strategy description and recommended usage guidelines for Indian market context</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400 mt-1 text-lg">•</span>
                  <span>Clear explanation of the entry and exit rules used by the strategy</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400 mt-1 text-lg">•</span>
                  <span>Risk management parameters and position sizing recommendations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400 mt-1 text-lg">•</span>
                  <span>Full disclosure of any limitations or specific market conditions where the strategy may underperform</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-zinc-800/50 rounded-xl border border-zinc-700/50 overflow-hidden shadow-xl">
            <div className="p-6 border-b border-zinc-700/50">
              <h3 className="text-white text-xl font-semibold">Your Published Strategies</h3>
            </div>
            
            <div className="p-8 text-center">
              <Download className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-400 mb-4">You haven't published any strategies yet</p>
              <Link 
                href="/dashboard/marketplace/publish"
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm transition-colors inline-block"
              >
                Publish Your First Strategy
              </Link>
            </div>
          </div>
          
          <div className="bg-zinc-800/50 rounded-xl border border-zinc-700/50 overflow-hidden shadow-xl">
            <div className="p-6 border-b border-zinc-700/50">
              <h3 className="text-white text-xl font-semibold">Earnings Dashboard</h3>
            </div>
            
            <div className="p-8 text-center">
              <DollarSign className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-400 mb-4">Start earning by publishing your trading strategies</p>
              <div className="bg-zinc-900/50 rounded-lg border border-zinc-700/50 p-4 text-left">
                <ul className="text-zinc-300 text-sm space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 mt-0.5 text-lg">•</span>
                    <span>Earn 70% commission on every sale</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 mt-0.5 text-lg">•</span>
                    <span>Get paid monthly via UPI, PayTM or bank transfer</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 mt-0.5 text-lg">•</span>
                    <span>Track sales and performance analytics</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200">Strategy Marketplace</h1>
          <p className="text-zinc-400 mt-1">Discover and trade with proven algorithmic strategies for Indian markets</p>
        </div>
        
        <div className="bg-zinc-800/80 p-1 rounded-lg border border-zinc-700/50 shadow-lg">
          <div className="flex">
            <button 
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'browse' 
                  ? 'bg-indigo-600 text-white shadow-lg' 
                  : 'text-zinc-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('browse')}
            >
              Browse Strategies
            </button>
            <button 
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'publish' 
                  ? 'bg-indigo-600 text-white shadow-lg' 
                  : 'text-zinc-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('publish')}
            >
              Publish Strategies
            </button>
          </div>
        </div>
      </div>
      
      {activeTab === 'browse' ? renderBrowseContent() : renderPublishContent()}
    </div>
  );
}