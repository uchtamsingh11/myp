'use client';

import { useEffect } from 'react';
import BrokerAuthComponent from '../../components/dashboard/BrokerAuthComponent';

export default function BrokerAuthPage() {
  useEffect(() => {
    document.title = 'Trading View: Choose your broker | AlgoZ';
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Trading View: Choose your broker</h1>
      <BrokerAuthComponent />
    </div>
  );
}
