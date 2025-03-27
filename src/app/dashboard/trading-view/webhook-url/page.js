'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function WebhookUrlPage() {
  const router = useRouter();

  // Redirect to the main trading-view page with the webhook tab
  useEffect(() => {
    router.replace('/dashboard/trading-view?tab=webhook');
  }, [router]);

  // This component will only show briefly before redirecting
  return (
    <div className="flex items-center justify-center h-48">
      <div className="relative">
        <div className="w-8 h-8 rounded-full absolute border-2 border-solid border-zinc-800"></div>
        <div className="w-8 h-8 rounded-full animate-spin absolute border-2 border-solid border-indigo-500 border-t-transparent"></div>
      </div>
    </div>
  );
}
