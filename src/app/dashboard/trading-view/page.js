'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import TradingViewManageComponent from '../../../components/dashboard/trading-view/ManageComponent';
import TradingViewSymbolComponent from '../../../components/dashboard/trading-view/SymbolComponent';
import TradingViewJSONComponent from '../../../components/dashboard/trading-view/JSONComponent';
import WebhookUrlComponent from '../../../components/dashboard/webhook/UrlComponent';
import WebhookLogsComponent from '../../../components/dashboard/webhook/LogsComponent';

// Client component that uses useSearchParams
const TradingViewContent = () => {  
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'manage';

  // Set the title
  useEffect(() => {
    document.title = 'TradingView | AlgoZ';
  }, []);

  // Function to switch tabs without full page reload
  const switchTab = newTab => {
    // Update URL for bookmark-ability without refreshing the page
    const params = new URLSearchParams(searchParams);
    params.set('tab', newTab);
    router.push(`/dashboard/trading-view?${params.toString()}`, { scroll: false });
  };

  // Render the active component based on tab
  const renderTabContent = () => {
    switch (tab) {
      case 'manage':
        return <TradingViewManageComponent />;
      case 'symbol':
        return <TradingViewSymbolComponent />;
      case 'webhook':
        return <WebhookUrlComponent />;
      case 'json':
        return <TradingViewJSONComponent />;
      case 'logs':
        return <WebhookLogsComponent />;
      default:
        return <TradingViewManageComponent />;
    }
  };

  return (
    <div className="p-2">
      {/* Tab Content */}
      <div className="mt-0">{renderTabContent()}</div>
    </div>
  );
};

// Main component with Suspense boundary
export default function TradingViewPage() {
  return (
    <Suspense
      fallback={
        <div className="p-2">
          
          <div className="mt-4 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        </div>
      }
    >
      <TradingViewContent />
    </Suspense>
  );
}


