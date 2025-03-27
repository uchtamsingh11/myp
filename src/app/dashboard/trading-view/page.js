'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import TradingViewManageComponent from '../../../components/dashboard/TradingViewManageComponent';
import TradingViewSymbolComponent from '../../../components/dashboard/TradingViewSymbolComponent';
import TradingViewJSONComponent from '../../../components/dashboard/TradingViewJSONComponent';
import WebhookUrlComponent from '../../../components/dashboard/WebhookUrlComponent';
import WebhookLogsComponent from '../../../components/dashboard/WebhookLogsComponent';

export default function TradingViewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'manage';

  // Set the title
  useEffect(() => {
    document.title = 'TradingView | AlgoZ';
  }, []);

  // Function to switch tabs without full page reload
  const switchTab = (newTab) => {
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
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">TradingView</h1>

      {/* Tab Content */}
      <div className="mt-4">
        {renderTabContent()}
      </div>
    </div>
  );
}
