'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star, ArrowLeft, Clock, DollarSign, BarChart, TrendingUp, Zap, Shield, CheckCircle } from 'lucide-react';
import Link from 'next/link';

// Sample strategy data
const STRATEGIES = {
  '1': {
    id: 1,
    name: 'Golden Cross Strategy',
    description: 'A trend-following strategy that uses moving average crossovers to identify potential buy and sell signals.',
    longDescription: 'The Golden Cross Strategy is a popular trend-following approach used by traders worldwide. It identifies potential market entry and exit points based on the crossover of two moving averages - typically a 50-period and a 200-period moving average. When the shorter-term MA crosses above the longer-term MA, it generates a buy signal (Golden Cross). Conversely, when the shorter-term MA crosses below the longer-term MA, it generates a sell signal (Death Cross). This strategy works particularly well in trending markets and can be applied across various timeframes and asset classes.',
    author: 'TradingExpert',
    authorRating: 4.8,
    authorSales: 524,
    rating: 4.8,
    reviews: 124,
    price: 149.99,
    returns: '23.5%',
    timeframe: '1D',
    asset: 'Stocks, ETFs',
    features: [
      'Customizable moving average periods',
      'Multiple timeframe analysis',
      'Automatic trade signals',
      'Position sizing recommendations',
      'Risk management controls',
      'Email and mobile notifications'
    ],
    performance: {
      annualReturn: '23.5%',
      drawdown: '12.3%',
      winRate: '68%',
      profitFactor: '2.1',
      sharpeRatio: '1.8'
    },
    requirements: {
      platform: 'MetaTrader 4/5, TradingView',
      broker: 'Any supporting webhook integration',
      minCapital: '$1,000 recommended'
    }
  },
};

export default function StrategyDetail({ params }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Get strategy data based on ID from the URL
  const strategy = STRATEGIES[params.id];
  
  // Handle case where strategy doesn't exist
  if (!strategy) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-white text-2xl font-bold mb-4">Strategy Not Found</h1>
        <p className="text-zinc-400 mb-8">The strategy you're looking for doesn't exist or has been removed.</p>
        <Link href="/dashboard/marketplace" className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
          Back to Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <Link 
        href="/dashboard/marketplace" 
        className="inline-flex items-center text-purple-400 hover:text-purple-300 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Marketplace
      </Link>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - Strategy info */}
        <div className="lg:col-span-2">
          <div className="bg-zinc-800 rounded-xl overflow-hidden shadow-xl">
            {/* Strategy header */}
            <div className="p-6 border-b border-zinc-700">
              <h1 className="text-white text-2xl font-bold mb-2">{strategy.name}</h1>
              <div className="flex items-center text-zinc-400 text-sm mb-4">
                <Clock className="w-4 h-4 mr-1" />
                <span className="mr-4">{strategy.timeframe}</span>
                <span className="mr-4">|</span>
                <span>{strategy.asset}</span>
              </div>
              <div className="flex items-center mb-4">
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-white ml-1">{strategy.rating}</span>
                  <span className="text-zinc-500 text-sm ml-1">({strategy.reviews} reviews)</span>
                </div>
                <span className="mx-4 text-zinc-500">|</span>
                <div className="text-green-400 font-medium">{strategy.returns} Annual Return</div>
              </div>
              <p className="text-zinc-300">{strategy.description}</p>
            </div>
            
            {/* Tabs */}
            <div className="border-b border-zinc-700 flex">
              <button 
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'overview' 
                    ? 'text-purple-400 border-b-2 border-purple-400' 
                    : 'text-zinc-400 hover:text-white'
                }`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              <button 
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'performance' 
                    ? 'text-purple-400 border-b-2 border-purple-400' 
                    : 'text-zinc-400 hover:text-white'
                }`}
                onClick={() => setActiveTab('performance')}
              >
                Performance
              </button>
              <button 
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'reviews' 
                    ? 'text-purple-400 border-b-2 border-purple-400' 
                    : 'text-zinc-400 hover:text-white'
                }`}
                onClick={() => setActiveTab('reviews')}
              >
                Reviews
              </button>
            </div>
            
            {/* Tab content */}
            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-white text-lg font-medium mb-3">Description</h3>
                    <p className="text-zinc-300">{strategy.longDescription}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-white text-lg font-medium mb-3">Features</h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {strategy.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="w-5 h-5 text-green-400 mr-2 flex-shrink-0" />
                          <span className="text-zinc-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-white text-lg font-medium mb-3">Requirements</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-zinc-900 p-4 rounded-lg">
                        <h4 className="text-zinc-400 text-sm mb-1">Platform</h4>
                        <p className="text-white">{strategy.requirements.platform}</p>
                      </div>
                      <div className="bg-zinc-900 p-4 rounded-lg">
                        <h4 className="text-zinc-400 text-sm mb-1">Broker</h4>
                        <p className="text-white">{strategy.requirements.broker}</p>
                      </div>
                      <div className="bg-zinc-900 p-4 rounded-lg">
                        <h4 className="text-zinc-400 text-sm mb-1">Recommended Capital</h4>
                        <p className="text-white">{strategy.requirements.minCapital}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'performance' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="bg-zinc-900 p-4 rounded-lg text-center">
                      <BarChart className="w-6 h-6 text-green-400 mx-auto mb-2" />
                      <h4 className="text-zinc-400 text-xs mb-1">Annual Return</h4>
                      <p className="text-white text-lg font-bold">{strategy.performance.annualReturn}</p>
                    </div>
                    <div className="bg-zinc-900 p-4 rounded-lg text-center">
                      <TrendingUp className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                      <h4 className="text-zinc-400 text-xs mb-1">Win Rate</h4>
                      <p className="text-white text-lg font-bold">{strategy.performance.winRate}</p>
                    </div>
                    <div className="bg-zinc-900 p-4 rounded-lg text-center">
                      <Shield className="w-6 h-6 text-red-400 mx-auto mb-2" />
                      <h4 className="text-zinc-400 text-xs mb-1">Max Drawdown</h4>
                      <p className="text-white text-lg font-bold">{strategy.performance.drawdown}</p>
                    </div>
                    <div className="bg-zinc-900 p-4 rounded-lg text-center">
                      <Zap className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                      <h4 className="text-zinc-400 text-xs mb-1">Profit Factor</h4>
                      <p className="text-white text-lg font-bold">{strategy.performance.profitFactor}</p>
                    </div>
                    <div className="bg-zinc-900 p-4 rounded-lg text-center">
                      <BarChart className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                      <h4 className="text-zinc-400 text-xs mb-1">Sharpe Ratio</h4>
                      <p className="text-white text-lg font-bold">{strategy.performance.sharpeRatio}</p>
                    </div>
                  </div>
                  
                  {/* Placeholder for performance chart */}
                  <div className="bg-zinc-900 p-4 rounded-lg h-64 flex items-center justify-center">
                    <p className="text-zinc-500">Performance chart visualization would be displayed here</p>
                  </div>
                </div>
              )}
              
              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-6 bg-zinc-900 p-4 rounded-lg">
                    <div className="text-center md:text-left">
                      <div className="text-white text-4xl font-bold">{strategy.rating}</div>
                      <div className="flex mt-1 justify-center md:justify-start">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i < Math.floor(strategy.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-600'}`} 
                          />
                        ))}
                      </div>
                      <div className="text-zinc-400 text-sm mt-1">{strategy.reviews} reviews</div>
                    </div>
                    <div className="flex-grow">
                      <p className="text-zinc-300 mb-4">Review distribution would be shown here</p>
                      <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                        Write a Review
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-center py-8">
                    <p className="text-zinc-400">Purchase this strategy to see all reviews from verified buyers</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Right column - Purchase card */}
        <div className="lg:col-span-1">
          <div className="bg-zinc-800 rounded-xl p-6 shadow-xl sticky top-20">
            <div className="text-white text-3xl font-bold mb-4">${strategy.price}</div>
            
            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-medium mb-4 transition-colors">
              Purchase Strategy
            </button>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-400 mr-2 flex-shrink-0" />
                <span className="text-zinc-300">Instant access after purchase</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-400 mr-2 flex-shrink-0" />
                <span className="text-zinc-300">Full source code included</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-400 mr-2 flex-shrink-0" />
                <span className="text-zinc-300">Lifetime updates</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-400 mr-2 flex-shrink-0" />
                <span className="text-zinc-300">Email support from creator</span>
              </div>
            </div>
            
            <div className="border-t border-zinc-700 pt-4">
              <h3 className="text-white font-medium mb-2">About the Creator</h3>
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-purple-800 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-bold">{strategy.author.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-white">{strategy.author}</p>
                  <div className="flex items-center text-sm">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 mr-1" />
                    <span className="text-white">{strategy.authorRating}</span>
                    <span className="text-zinc-500 mx-2">•</span>
                    <span className="text-zinc-400">{strategy.authorSales} sales</span>
                  </div>
                </div>
              </div>
              <button className="w-full border border-purple-500 text-purple-400 hover:bg-purple-900/20 px-4 py-2 rounded-lg text-sm transition-colors">
                View Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 