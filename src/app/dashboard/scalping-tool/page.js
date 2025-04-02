'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ScalpingToolManageComponent from '../../../components/dashboard/scalping-tool/ManageComponent';

// We'll create a TabContainer component to handle tab switching
const ScalpingToolContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'manage';

  // Set the title
  useEffect(() => {
    document.title = 'Scalping Tool | AlgoZ';
  }, []);

  // Function to switch tabs without full page reload
  const switchTab = newTab => {
    // Update URL for bookmark-ability without refreshing the page
    const params = new URLSearchParams(searchParams);
    params.set('tab', newTab);
    router.push(`/dashboard/scalping-tool?${params.toString()}`, { scroll: false });
  };

  // Render the active component based on tab
  const renderTabContent = () => {
    switch (tab) {
      case 'manage':
        return <ScalpingToolManageComponent />;
      // Add more tabs as needed in the future
      default:
        return <ScalpingToolManageComponent />;
    }
  };

  return (
    <div className="p-4">
      {/* Tab Content */}
      <div className="mt-0">{renderTabContent()}</div>
    </div>
  );
};

// Main component with Suspense boundary
export default function ScalpingToolPage() {
  return (
    <Suspense
      fallback={
        <div className="p-4">
          <div className="mt-4 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        </div>
      }
    >
      <ScalpingToolContent />
    </Suspense>
  );
}
