'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [copied, setCopied] = useState(false);
  
  const handleCopyPhoneNumber = () => {
    navigator.clipboard.writeText('9241740350');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <footer id="footer" className="bg-zinc-950 border-t border-zinc-900 pt-10 sm:pt-16 pb-8">
      <div className="container-custom">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-8 sm:mb-12">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl font-bold mb-4">AlgoZ</h2>
              <p className="text-zinc-400 mb-6 max-w-md text-sm sm:text-base">
                Advanced algorithmic trading solutions for modern investors. Harness the power of cutting-edge technology to maximize your trading potential.
              </p>
              <div className="flex space-x-5">
                <a href="https://youtube.com/@algo-zr?si=qnHugDNXo_3A5TJ2" target="_blank" rel="noopener noreferrer" 
                  className="text-zinc-400 hover:text-white transition-colors hover:scale-110 transform duration-200">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="https://t.me/AlgoZsupport1" target="_blank" rel="noopener noreferrer" 
                  className="text-zinc-400 hover:text-white transition-colors hover:scale-110 transform duration-200">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12a12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                </a>
              </div>
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="text-lg font-semibold mb-4 text-white">PAGES</h3>
            <ul className="space-y-3">
              <li>
                <a href="/privacy-policy" className="text-zinc-400 hover:text-white transition-colors inline-flex items-center text-sm sm:text-base">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/disclaimer-policy" className="text-zinc-400 hover:text-white transition-colors inline-flex items-center text-sm sm:text-base">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Disclaimer Policy
                </a>
              </li>
              <li>
                <a href="/terms-conditions" className="text-zinc-400 hover:text-white transition-colors inline-flex items-center text-sm sm:text-base">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a href="/cookies-policy" className="text-zinc-400 hover:text-white transition-colors inline-flex items-center text-sm sm:text-base">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Cookies Policy
                </a>
              </li>
              <li>
                <a href="/refund-policy" className="text-zinc-400 hover:text-white transition-colors inline-flex items-center text-sm sm:text-base">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Refund & Cancellation
                </a>
              </li>
            </ul>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-lg font-semibold mb-4 text-white">CONNECT WITH US</h3>
            <ul className="space-y-4">
              <li>
                <a href="https://wa.me/919241740350" target="_blank" rel="noopener noreferrer" 
                  className="text-zinc-400 hover:text-white transition-colors flex items-center group text-sm sm:text-base">
                  <div className="bg-zinc-800 p-2 rounded-full mr-3 group-hover:bg-green-600/20 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:text-green-500 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </div>
                  WhatsApp Support
                </a>
              </li>
              <li>
                <a href="https://t.me/AlgoZsupport1" target="_blank" rel="noopener noreferrer" 
                  className="text-zinc-400 hover:text-white transition-colors flex items-center group text-sm sm:text-base">
                  <div className="bg-zinc-800 p-2 rounded-full mr-3 group-hover:bg-blue-600/20 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:text-blue-500 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12a12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                    </svg>
                  </div>
                  Telegram Support
                </a>
              </li>
              <li className="flex items-center text-zinc-400 group text-sm sm:text-base">
                <div className="bg-zinc-800 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <span>+91 9241740350</span>
                <button 
                  onClick={handleCopyPhoneNumber}
                  className="ml-2 p-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors"
                  title={copied ? "Copied!" : "Copy phone number"}
                >
                  {copied ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
              </li>
            </ul>
          </motion.div>
        </div>
        
        <div className="border-t border-zinc-800 pt-6 sm:pt-8 mt-6 sm:mt-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-6"
          >
            <p className="text-zinc-500 text-xs leading-relaxed">
              <span className="font-semibold">Disclaimer:</span> Futures, stocks, and options trading carry a significant risk of loss and may not be suitable for all investors. At algoz.com, we solely provide automation trading tools and a strategy marketplace; we do not offer trading buy or sell signals, recommendations, or any form of investment advisory services. The use of our trading strategies is at your own risk, and algoz.com cannot be held responsible for any losses incurred during their implementation. We advise users to exercise caution and perform their due diligence before engaging in any trading activities.
            </p>
          </motion.div>
          
          <div className="flex justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center"
            >
              <p className="text-zinc-500 text-sm">
                &copy; {currentYear} AlgoZ. All rights reserved.
              </p>
              <span className="hidden sm:inline mx-2 text-zinc-600">•</span>
              <p className="text-zinc-600 text-xs mt-1 sm:mt-0">
                Made with <span className="text-red-500">❤</span> in India
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;