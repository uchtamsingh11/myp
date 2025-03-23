'use client';

import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Link from 'next/link';

export default function DisclaimerPolicy() {
  return (
    <main className="bg-black text-white min-h-screen">
      <Header />
      
      <div className="py-20 container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="mb-8 flex items-center">
            <Link 
              href="/#footer" 
              className="flex items-center text-zinc-400 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Home
            </Link>
          </div>
          
          <h1 className="text-4xl font-bold mb-8 text-center">Disclaimer Policy</h1>
          
          <div className="bg-zinc-900 p-8 rounded-xl">
            <h2 className="text-2xl font-bold mb-4">Trading Risk Disclaimer</h2>
            <p className="text-zinc-300 mb-6">
              Futures, stocks, and options trading carry a significant risk of loss and may not be suitable for all investors. At algoz.com, we solely provide automation trading tools and a strategy marketplace; we do not offer trading buy or sell signals, recommendations, or any form of investment advisory services.
            </p>
            <p className="text-zinc-300 mb-8">
              The use of our trading strategies is at your own risk, and algoz.com cannot be held responsible for any losses incurred during their implementation. We advise users to exercise caution and perform their due diligence before engaging in any trading activities.
            </p>
            
            <h2 className="text-2xl font-bold mb-4">No Investment Advice</h2>
            <p className="text-zinc-300 mb-4">
              The information provided on AlgoZ is for general informational purposes only and should not be construed as investment advice. We do not provide personalized investment recommendations or act as a financial advisor.
            </p>
            <p className="text-zinc-300 mb-8">
              Any decisions you make regarding investments, trading strategies, or financial matters should be based on your own research, judgment, and consultation with qualified financial professionals.
            </p>
            
            <h2 className="text-2xl font-bold mb-4">Third-Party Content</h2>
            <p className="text-zinc-300 mb-4">
              AlgoZ may include content, tools, or strategies created by third parties. We do not endorse, guarantee, or assume responsibility for any third-party content available through our platform.
            </p>
            <p className="text-zinc-300 mb-8">
              Users should evaluate all information, opinions, and strategies critically before implementation.
            </p>
            
            <h2 className="text-2xl font-bold mb-4">Past Performance</h2>
            <p className="text-zinc-300 mb-4">
              Past performance of any trading strategy, algorithm, or system is not indicative of future results. The financial markets are inherently unpredictable, and no trading system can guarantee profits.
            </p>
            <p className="text-zinc-300 mb-8">
              Any examples, demonstrations, or simulations of trading strategies shown on our platform represent historical data and should not be interpreted as a promise or guarantee of future performance.
            </p>
            
            <h2 className="text-2xl font-bold mb-4">User Responsibility</h2>
            <p className="text-zinc-300 mb-4">
              By using AlgoZ, you acknowledge and agree that you are solely responsible for your trading decisions and any resulting financial outcomes. You should only invest or risk money that you can afford to lose.
            </p>
            <p className="text-zinc-300">
              We strongly recommend consulting with a qualified financial advisor before making any investment decisions, especially if you are inexperienced in trading or unfamiliar with the financial markets.
            </p>
          </div>
        </motion.div>
      </div>
      
      <Footer />
    </main>
  );
} 