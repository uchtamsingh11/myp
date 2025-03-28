'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PaymentsRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to pricing page with test payments section visible
    router.push('/dashboard/pricing?test=true');
  }, [router]);

  return (
    <div className="flex justify-center items-center h-[50vh]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
        <p className="text-zinc-400">Redirecting to payment testing...</p>
      </div>
    </div>
  );
} 