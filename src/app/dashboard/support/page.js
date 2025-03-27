'use client';

import { useEffect } from 'react';

export default function SupportPage() {
  useEffect(() => {
    document.title = 'Support | AlgoZ';
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Support</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-3">Contact Us</h2>
          <p className="text-zinc-400 mb-4">Get in touch with our support team.</p>
          <a href="/dashboard/support/contact-us" className="text-blue-400 hover:text-blue-300 inline-flex items-center">
            Contact Us
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
        
        <div className="bg-zinc-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-3">Submit Ticket</h2>
          <p className="text-zinc-400 mb-4">Submit a support ticket for technical assistance.</p>
          <a href="/dashboard/support/submit-ticket" className="text-blue-400 hover:text-blue-300 inline-flex items-center">
            Submit Ticket
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
        
        <div className="bg-zinc-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-3">Live Chat</h2>
          <p className="text-zinc-400 mb-4">Chat with our support team in real-time.</p>
          <a href="/dashboard/support/live-chat" className="text-blue-400 hover:text-blue-300 inline-flex items-center">
            Live Chat
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
