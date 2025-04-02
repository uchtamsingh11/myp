'use client';

import { useEffect } from 'react';
import BotsMyBotsComponent from '../../../components/dashboard/bots/MyBotsComponent';

export default function BotsPage() {
  useEffect(() => {
    document.title = 'My Bots | AlgoZ';
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">My Bots</h1>
      <BotsMyBotsComponent />
    </div>
  );
}
