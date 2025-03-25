'use client';

import { useEffect } from 'react';
import StrategyPineScriptComponent from '../../../components/dashboard/StrategyPineScriptComponent';

export default function StrategyPineScriptPage() {
  useEffect(() => {
    document.title = 'Pine Script Strategy | AlgoZ';
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Pine Script Strategy</h1>
      <StrategyPineScriptComponent />
    </div>
  );
}
