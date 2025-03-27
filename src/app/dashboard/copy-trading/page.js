'use client';

import { useEffect } from 'react';
import CopyTradingManageComponent from '../../../components/dashboard/CopyTradingManageComponent';

export default function CopyTradingPage() {
  useEffect(() => {
    document.title = 'Copy Trading | AlgoZ';
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Copy Trading</h1>
      <CopyTradingManageComponent />
    </div>
  );
}
