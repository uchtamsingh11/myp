'use client';

import { useEffect } from 'react';
import StrategyAFLComponent from '../../../../components/dashboard/strategy/AFLComponent';

export default function StrategyAFLPage() {
  useEffect(() => {
    document.title = 'AFL Strategy | AlgoZ';
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">AFL Strategy</h1>
      <StrategyAFLComponent />
    </div>
  );
}
