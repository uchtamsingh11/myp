'use client';

import { useEffect } from 'react';
import StrategyMQLComponent from '../../../components/dashboard/StrategyMQLComponent';

export default function StrategyMQLPage() {
  useEffect(() => {
    document.title = 'MQL Strategy | AlgoZ';
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">MQL Strategy</h1>
      <StrategyMQLComponent />
    </div>
  );
}
