'use client';

import { useEffect } from 'react';
import CopyTradingManageComponent from '../../../components/dashboard/CopyTradingManageComponent';

export default function CopyTradingPage() {
  useEffect(() => {
    document.title = 'Copy Trading | AlgoZ';
  }, []);

  return (
    <div className="p-4">
      <CopyTradingManageComponent />
    </div>
  );
}
