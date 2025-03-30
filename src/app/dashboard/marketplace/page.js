'use client';

import { useState } from 'react';
import { Search, Filter, ArrowRight, Star, ChevronDown, DollarSign, Plus, TrendingUp, Download } from 'lucide-react';
import Link from 'next/link';

// Sample strategy data for demonstration
const SAMPLE_STRATEGIES = [
  {
    id: 1,
    name: 'Golden Cross Strategy',
    description: 'A trend-following strategy that uses moving average crossovers to identify potential buy and sell signals.',
    author: 'TradingExpert',
    rating: 4.8,
    reviews: 124,
    price: 149.99,
    returns: '23.5%',
    timeframe: '1D',
    asset: 'Stocks, ETFs',
    image: '/strategy1.jpg'
  },
  {
    id: 2,
    name: 'RSI Bounce',
    description: 'Identifies oversold and overbought conditions using the Relative Strength Index to capture reversal opportunities.',
    author: 'AlgoTrader42',
    rating: 4.6,
    reviews: 89,
    price: 99.99,
    returns: '18.7%',
    timeframe: '4H',
    asset: 'Forex, Crypto',
    image: '/strategy2.jpg'
  },
  {
    id: 3,
    name: 'Breakout Momentum',
    description: 'Captures breakouts from consolidation patterns with volume confirmation for high momentum moves.',
    author: 'QuantDeveloper',
    rating: 4.9,
    reviews: 156,
    price: 199.99,
    returns: '27.3%',
    timeframe: '1H',
    asset: 'Stocks, Futures',
    image: '/strategy3.jpg'
  },
  {
    id: 4,
    name: 'Volatility Edge',
    description: 'Exploits volatility expansion and contraction cycles to identify high-probability trading opportunities.',
    author: 'VolMaster',
    rating: 4.5,
    reviews: 78,
    price: 129.99,
    returns: '21.2%',
    timeframe: '15m',
    asset: 'Options, Futures',
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
              className="w-full px-4 py-3 pl-10 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <Search className="absolute left-3 top-3.5 text-zinc-400 w-4 h-4" />
          </div>
          
          <div className="flex gap-4">
            <div className="relative">
              <select
                className="appearance-none px-4 py-3 pr-10 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Assets</option>
                <option value="stocks">Stocks</option>
                <option value="forex">Forex</option>
                <option value="crypto">Crypto</option>
                <option value="futures">Futures</option>
                <option value="options">Options</option>
                <option value="etfs">ETFs</option>
              </select>
              <ChevronDown className="absolute right-3 top-3.5 text-zinc-400 w-4 h-4 pointer-events-none" />
            </div>
            
            <button className="flex items-center gap-2 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white hover:bg-zinc-700 transition">
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">More Filters</span>
            </button>
          </div>
        </div>
        
        {/* Featured Strategy */}
        <div className="bg-gradient-to-r from-zinc-900 to-purple-900 rounded-xl p-6 shadow-xl">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/2">
              <h3 className="text-purple-400 text-sm font-semibold mb-2">FEATURED STRATEGY</h3>
              <h2 className="text-white text-2xl font-bold mb-3">Intelligent Market Analysis</h2>
              <p className="text-zinc-300 mb-4">
                Our most advanced algorithmic strategy that combines machine learning with technical analysis to predict market movements with high accuracy.
              </p>
              <div className="flex gap-4 mb-6">
                <div className="text-white">
                  <span className="text-purple-400 font-medium">36.8%</span>
                  <p className="text-xs text-zinc-400">Annual Return</p>
                </div>
                <div className="text-white">
                  <span className="text-purple-400 font-medium">1.65</span>
                  <p className="text-xs text-zinc-400">Sharpe Ratio</p>
                </div>
                <div className="text-white">
                  <span className="text-purple-400 font-medium">18.3%</span>
                  <p className="text-xs text-zinc-400">Max Drawdown</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="px-3 py-1 bg-zinc-800 rounded-full text-xs text-zinc-300">Multi-Asset</span>
                <span className="px-3 py-1 bg-zinc-800 rounded-full text-xs text-zinc-300">Machine Learning</span>
                <span className="px-3 py-1 bg-zinc-800 rounded-full text-xs text-zinc-300">Adaptive</span>
              </div>
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors">
                View Details <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="w-full md:w-1/2 flex items-center justify-center">
              <div className="relative w-full max-w-xs h-48 bg-zinc-800 rounded-xl overflow-hidden flex items-center justify-center">
                <TrendingUp className="w-20 h-20 text-purple-500 opacity-50" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 text-center">
                  <div className="text-white text-lg font-bold">$299.99</div>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-white text-sm">4.9 (205 reviews)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Strategy Grid */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-white text-xl font-semibold">Popular Strategies</h2>
            <button className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredStrategies.map((strategy) => (
              <div key={strategy.id} className="bg-zinc-800 rounded-xl overflow-hidden border border-zinc-700 hover:border-purple-500 transition-all duration-300 shadow-lg hover:shadow-purple-900/20">
                <div className="h-36 bg-zinc-700 relative flex items-center justify-center">
                  <TrendingUp className="w-16 h-16 text-zinc-600" />
                  <div className="absolute top-2 right-2 bg-zinc-900/80 text-white text-xs px-2 py-1 rounded-full">
                    {strategy.timeframe}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-white font-medium text-lg mb-1">{strategy.name}</h3>
                  <p className="text-zinc-400 text-sm mb-3 line-clamp-2">{strategy.description}</p>
                  
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-white">{strategy.rating}</span>
                      <span className="text-zinc-500 text-xs">({strategy.reviews})</span>
                    </div>
                    <div className="text-green-400 text-sm font-medium">{strategy.returns}</div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-white font-bold">${strategy.price}</span>
                    <Link 
                      href={`/dashboard/marketplace/${strategy.id}`}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
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
        <div className="bg-gradient-to-r from-zinc-900 to-purple-900 rounded-xl p-6 shadow-xl text-center">
          <h2 className="text-white text-2xl font-bold mb-3">Share Your Trading Expertise</h2>
          <p className="text-zinc-300 mb-6 max-w-2xl mx-auto">
            Monetize your successful trading strategies by publishing them on the marketplace. Set your own price and earn passive income while helping other traders succeed.
          </p>
          <Link 
            href="/dashboard/marketplace/publish"
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 mx-auto transition-colors"
          >
            <Plus className="w-4 h-4" /> Create New Strategy
          </Link>
        </div>
        
        <div className="bg-zinc-800 rounded-xl p-6 shadow-xl">
          <h3 className="text-white text-xl font-semibold mb-6">Strategy Publishing Guide</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 border border-zinc-700 rounded-lg bg-zinc-900">
              <div className="w-10 h-10 bg-purple-900 rounded-full flex items-center justify-center mb-3">
                <span className="text-white font-bold">1</span>
              </div>
              <h4 className="text-white font-medium mb-2">Create Your Strategy</h4>
              <p className="text-zinc-400 text-sm">Develop and backtest your trading algorithm to ensure it provides consistent results across different market conditions.</p>
            </div>
            
            <div className="p-4 border border-zinc-700 rounded-lg bg-zinc-900">
              <div className="w-10 h-10 bg-purple-900 rounded-full flex items-center justify-center mb-3">
                <span className="text-white font-bold">2</span>
              </div>
              <h4 className="text-white font-medium mb-2">Document Performance</h4>
              <p className="text-zinc-400 text-sm">Provide detailed performance metrics, including historical returns, drawdowns, Sharpe ratio, and other relevant statistics.</p>
            </div>
            
            <div className="p-4 border border-zinc-700 rounded-lg bg-zinc-900">
              <div className="w-10 h-10 bg-purple-900 rounded-full flex items-center justify-center mb-3">
                <span className="text-white font-bold">3</span>
              </div>
              <h4 className="text-white font-medium mb-2">Set Your Price</h4>
              <p className="text-zinc-400 text-sm">Determine a fair price for your strategy based on its complexity, performance, and value to potential buyers.</p>
            </div>
          </div>
          
          <div className="mt-8">
            <h4 className="text-white font-medium mb-3">Strategy Submission Requirements</h4>
            <ul className="text-zinc-400 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                <span>Minimum of 12 months of backtest data showing strategy performance</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                <span>Detailed strategy description and recommended usage guidelines</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                <span>Clear explanation of the entry and exit rules used by the strategy</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                <span>Risk management parameters and position sizing recommendations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                <span>Full disclosure of any limitations or specific market conditions where the strategy may underperform</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-zinc-800 rounded-xl p-6 shadow-xl">
            <h3 className="text-white text-xl font-semibold mb-4">Your Published Strategies</h3>
            <div className="text-center py-8">
              <Download className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-400">You haven't published any strategies yet</p>
              <Link 
                href="/dashboard/marketplace/publish"
                className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition-colors inline-block"
              >
                Publish Your First Strategy
              </Link>
            </div>
          </div>
          
          <div className="bg-zinc-800 rounded-xl p-6 shadow-xl">
            <h3 className="text-white text-xl font-semibold mb-4">Earnings Dashboard</h3>
            <div className="text-center py-8">
              <DollarSign className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-400">Start earning by publishing your trading strategies</p>
              <ul className="text-zinc-300 mt-4 text-sm space-y-2">
                <li>• Earn 70% commission on every sale</li>
                <li>• Get paid monthly via PayPal or bank transfer</li>
                <li>• Track sales and performance analytics</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-white text-3xl font-bold">Strategy Marketplace</h1>
          <p className="text-zinc-400 mt-1">Discover and trade with proven algorithmic strategies</p>
        </div>
        
        <div className="bg-zinc-800 p-1 rounded-lg">
          <div className="flex">
            <button 
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'browse' 
                  ? 'bg-purple-600 text-white' 
                  : 'text-zinc-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('browse')}
            >
              Browse Strategies
            </button>
            <button 
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'publish' 
                  ? 'bg-purple-600 text-white' 
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