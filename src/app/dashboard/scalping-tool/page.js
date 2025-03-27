'use client';

import { useEffect } from 'react';
import ScalpingToolManageComponent from '../../../components/dashboard/ScalpingToolManageComponent';

export default function ScalpingToolPage() {
  useEffect(() => {
    document.title = 'Scalping Tool | AlgoZ';
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Scalping Tool</h1>
      <ScalpingToolManageComponent />
    </div>
  );
}
