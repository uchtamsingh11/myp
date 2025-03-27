'use client';

import { useEffect } from 'react';
import BotsForexComponent from '@/components/dashboard/BotsForexComponent';

export default function BotsForexPage() {
  useEffect(() => {
    document.title = 'Forex Bots | AlgoZ';
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Forex Bots</h1>
      <BotsForexComponent />
    </div>
  );
}
