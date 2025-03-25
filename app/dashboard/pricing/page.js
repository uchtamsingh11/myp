'use client';

import { useEffect } from 'react';

export default function PricingPage() {
  useEffect(() => {
    document.title = 'Subscription | AlgoZ';
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Manage Subscription</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-800/50 border border-zinc-700/30 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Basic</h2>
          <p className="text-3xl font-bold mb-2">$9<span className="text-sm font-normal">/month</span></p>
          <ul className="space-y-2 mb-6">
            <li className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Basic features</span>
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>TradingView integration</span>
            </li>
            <li className="flex items-center text-zinc-500">
              <svg className="w-4 h-4 mr-2 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <span>Advanced strategies</span>
            </li>
          </ul>
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition">
            Subscribe
          </button>
        </div>
        
        <div className="bg-zinc-800/50 border border-zinc-700/30 border-blue-500/50 rounded-xl p-6 relative">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white text-xs font-semibold py-1 px-4 rounded-full">
            POPULAR
          </div>
          <h2 className="text-xl font-semibold mb-4">Pro</h2>
          <p className="text-3xl font-bold mb-2">$29<span className="text-sm font-normal">/month</span></p>
          <ul className="space-y-2 mb-6">
            <li className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>All Basic features</span>
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Advanced strategies</span>
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Priority support</span>
            </li>
          </ul>
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition">
            Subscribe
          </button>
        </div>
        
        <div className="bg-zinc-800/50 border border-zinc-700/30 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Enterprise</h2>
          <p className="text-3xl font-bold mb-2">$99<span className="text-sm font-normal">/month</span></p>
          <ul className="space-y-2 mb-6">
            <li className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>All Pro features</span>
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Custom strategy development</span>
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>24/7 dedicated support</span>
            </li>
          </ul>
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition">
            Contact Sales
          </button>
        </div>
      </div>
    </div>
  );
}
