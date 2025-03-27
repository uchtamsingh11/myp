'use client';

import { useEffect } from 'react';

export default function StrategyPage() {
  useEffect(() => {
    document.title = 'Strategy | AlgoZ';
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Strategy</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-3">Pine Script</h2>
          <p className="text-zinc-400 mb-4">
            Create and manage your TradingView Pine Script strategies.
          </p>
          <a
            href="/dashboard/strategy/pine-script"
            className="text-blue-400 hover:text-blue-300 inline-flex items-center"
          >
            View Pine Script
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 ml-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        <div className="bg-zinc-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-3">MQL</h2>
          <p className="text-zinc-400 mb-4">
            Manage your MetaTrader MQL strategies and indicators.
          </p>
          <a
            href="/dashboard/strategy/mql"
            className="text-blue-400 hover:text-blue-300 inline-flex items-center"
          >
            View MQL Strategies
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 ml-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        <div className="bg-zinc-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-3">AFL</h2>
          <p className="text-zinc-400 mb-4">Manage your Amibroker Formula Language strategies.</p>
          <a
            href="/dashboard/strategy/afl"
            className="text-blue-400 hover:text-blue-300 inline-flex items-center"
          >
            View AFL Strategies
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 ml-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
