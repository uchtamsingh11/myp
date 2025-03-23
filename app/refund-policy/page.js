'use client';

import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Link from 'next/link';

export default function RefundPolicy() {
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
          
          <h1 className="text-4xl font-bold mb-8 text-center">Refund & Cancellation Policy</h1>
          
          <div className="bg-zinc-900 p-8 rounded-xl">
            <p className="text-zinc-300 mb-8">
              At AlgoZ, we are committed to providing high-quality algorithmic trading solutions. Before purchasing or subscribing to any of our services, we encourage users to carefully review the features, compatibility, and terms of use.
            </p>
            
            <h2 className="text-2xl font-bold mb-4">1. No Refund Policy</h2>
            <p className="text-zinc-300 mb-4">
              All sales are final, and we do not offer refunds under any circumstances, including but not limited to:
            </p>
            <ul className="list-disc pl-6 mb-8 text-zinc-300 space-y-2">
              <li>Change of mind after purchase.</li>
              <li>Dissatisfaction with results due to market conditions.</li>
              <li>Incorrect purchase or accidental order.</li>
              <li>Lack of understanding of how to use our services.</li>
              <li>Technical issues arising from third-party platforms or brokers.</li>
            </ul>
            <p className="text-zinc-300 mb-8">
              Once a payment has been processed, it is considered non-refundable.
            </p>
            
            <h2 className="text-2xl font-bold mb-4">2. Cancellation Policy</h2>
            <p className="text-zinc-300 mb-4">
              <strong>Subscriptions & Renewals:</strong> If you have subscribed to a recurring service, you may cancel your subscription at any time. However, the cancellation will only prevent the next billing cycle—no refunds will be issued for unused portions of the current subscription.
            </p>
            <p className="text-zinc-300 mb-8">
              <strong>One-Time Purchases:</strong> Since all purchases are final, cancellations are not permitted for one-time purchases.
            </p>
            
            <h2 className="text-2xl font-bold mb-4">3. Exceptional Circumstances</h2>
            <p className="text-zinc-300 mb-8">
              In rare cases where a transaction error occurs (such as double billing or unauthorized payment), we will review the case and may provide a resolution at our sole discretion. To report an issue, contact our support team at support@algoz.tech within 48 hours of the transaction.
            </p>
            
            <h2 className="text-2xl font-bold mb-4">4. Policy Agreement</h2>
            <p className="text-zinc-300 mb-8">
              By purchasing or subscribing to our services, you acknowledge that you have read, understood, and agreed to this Refund & Cancellation Policy.
            </p>
            
            <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
            <p className="text-zinc-300 mb-4">
              For further assistance, reach out to our customer support team:
            </p>
            <ul className="list-disc pl-6 text-zinc-300">
              <li className="mb-2">Email: support@algoz.tech</li>
              <li>Phone: +91 9214740350</li>
            </ul>
          </div>
        </motion.div>
      </div>
      
      <Footer />
    </main>
  );
} 