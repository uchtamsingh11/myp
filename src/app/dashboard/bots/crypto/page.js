'use client';

import { useEffect } from 'react';
import BotsCryptoComponent from '@/components/dashboard/BotsCryptoComponent';

export default function BotsCryptoPage() {
  useEffect(() => {
    document.title = 'Crypto Bots | AlgoZ';
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Crypto Bots</h1>
      <BotsCryptoComponent />
    </div>
  );
}
