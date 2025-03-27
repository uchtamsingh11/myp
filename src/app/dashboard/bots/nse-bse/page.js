'use client';

import { useEffect } from 'react';
import BotsNseBseComponent from '../../../../components/dashboard/BotsNseBseComponent';

export default function BotsNseBsePage() {
  useEffect(() => {
    document.title = 'NSE/BSE Bots | AlgoZ';
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">NSE/BSE Bots</h1>
      <BotsNseBseComponent />
    </div>
  );
}
