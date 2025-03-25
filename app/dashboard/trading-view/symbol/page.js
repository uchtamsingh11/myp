'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TradingViewSymbolPage() {
  const router = useRouter();

  // Redirect to the main trading-view page with the symbol tab
  useEffect(() => {
    router.replace('/dashboard/trading-view?tab=symbol');
  }, [router]);

  // This component will only show briefly before redirecting
  return (
    <div className="flex items-center justify-center h-48">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
}
