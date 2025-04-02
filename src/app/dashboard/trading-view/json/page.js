'use client';

import { useEffect } from 'react';
import TradingViewJSONComponent from '../../../../components/dashboard/trading-view/JSONComponent';

export default function TradingViewJSONPage() {
  // Set the title
  useEffect(() => {
    document.title = 'TradingView JSON | AlgoZ';
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">TradingView JSON</h1>
      <TradingViewJSONComponent />
    </div>
  );
}
