'use client';

import { useEffect } from 'react';

export default function ContactUsPage() {
  useEffect(() => {
    document.title = 'Contact Us | AlgoZ';
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Contact Us</h1>
      
      <div className="max-w-3xl bg-zinc-800 rounded-lg p-6 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Get in Touch</h2>
            <p className="text-zinc-400 mb-4">
              Have questions about our services? Our team is here to help.
              Feel free to reach out using any of the methods below.
            </p>
            
            <div className="mt-6 space-y-4">
              <div className="flex items-start">
                <div className="bg-blue-500/20 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Email</h3>
                  <p className="text-zinc-400">support@algoz.com</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-green-500/20 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Phone</h3>
                  <p className="text-zinc-400">+91 (123) 456-7890</p>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Send a Message</h2>
            <form>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-zinc-300 mb-1">Name</label>
                <input 
                  type="text" 
                  id="name" 
                  className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded-md text-white"
                  placeholder="Your name"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-1">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded-md text-white"
                  placeholder="Your email"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="message" className="block text-sm font-medium text-zinc-300 mb-1">Message</label>
                <textarea 
                  id="message" 
                  rows="4"
                  className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded-md text-white resize-none"
                  placeholder="Your message"
                ></textarea>
              </div>
              
              <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
