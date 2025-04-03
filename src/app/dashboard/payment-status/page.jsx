'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function PaymentStatusPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('loading');
  const [paymentDetails, setPaymentDetails] = useState(null);
  
  const orderId = searchParams.get('order_id');
  
  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (!orderId) {
        setStatus('error');
        return;
      }
      
      try {
        // Fetch payment status from API
        const response = await fetch(`/api/payments/verify-payment?order_id=${orderId}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to verify payment');
        }
        
        // Set status based on API response
        setStatus(data.isPaid ? 'success' : data.orderStatus?.toLowerCase() || 'pending');
        setPaymentDetails({
          orderId,
          amount: data.orderAmount || searchParams.get('amount') || 'N/A',
          status: data.orderStatus,
          timestamp: new Date().toLocaleString(),
          // Use coins from API if available, otherwise calculate
          coins: data.coinsAdded || Math.floor(parseFloat(data.orderAmount || '0')), 
          newBalance: data.newBalance || null, // Track new balance if returned
          coinBalanceUpdated: data.coinBalanceUpdated || false // Track if coins were added
        });
      } catch (error) {
        console.error('Error checking payment status:', error);
        setStatus('error');
      }
    };
    
    checkPaymentStatus();
  }, [orderId, searchParams]);

  // Coin animation component
  const CoinAnimation = () => {
    return (
      <div className="coin-animation-container">
        {[...Array(12)].map((_, i) => (
          <div 
            key={i} 
            className="coin" 
            style={{
              left: `${Math.random() * 80 + 10}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${Math.random() * 3 + 3}s`
            }}
          >
            <div className="coin-inner">ⓒ</div>
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <h1 className="text-2xl md:text-3xl font-bold text-white text-center mb-8">Payment Status</h1>
        
        {status === 'loading' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-white mb-2">Checking payment status...</h2>
            <p className="text-zinc-400">Please wait while we verify your payment.</p>
          </div>
        )}
        
        {status === 'success' && (
          <div className="bg-zinc-900 border border-indigo-500/30 rounded-xl p-8 text-center relative overflow-hidden">
            {/* Success animation */}
            <CoinAnimation />
            
            <div className="relative z-10">
              <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
              <p className="text-zinc-400 mb-6">Your coins have been added to your account</p>
              
              <div className="bg-gradient-to-r from-indigo-900/40 to-indigo-600/40 border border-indigo-500/30 rounded-lg p-4 mb-6">
                <div className="flex justify-center items-center space-x-2 mb-2">
                  <span className="text-yellow-400 text-2xl">ⓒ</span>
                  <span className="text-3xl font-bold text-white">{paymentDetails?.coins || 0}</span>
                  <span className="text-zinc-400">coins added</span>
                </div>
                {paymentDetails?.newBalance ? (
                  <p className="text-sm text-green-400">New balance: {paymentDetails.newBalance} coins</p>
                ) : (
                  <p className="text-sm text-zinc-500">1 coin = 1 trade</p>
                )}
              </div>
              
              <div className="bg-zinc-800/40 rounded-lg p-4 mb-6 text-left">
                <h3 className="text-zinc-300 font-medium mb-3 text-center">Transaction Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Order ID:</span>
                    <span className="text-zinc-300 font-medium">{paymentDetails?.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Amount:</span>
                    <span className="text-zinc-300 font-medium">₹{paymentDetails?.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Date:</span>
                    <span className="text-zinc-300 font-medium">{paymentDetails?.timestamp}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link 
                  href="/dashboard/pricing" 
                  className="bg-zinc-800 hover:bg-zinc-700 text-white py-3 px-6 rounded-md font-medium transition-colors"
                >
                  Buy More Coins
                </Link>
                <Link 
                  href="/dashboard" 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-md font-medium transition-colors"
                >
                  Go to Dashboard
                </Link>
              </div>
            </div>
          </div>
        )}
        
        {status === 'failed' && (
          <div className="bg-zinc-900 border border-red-500/30 rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Payment Failed</h2>
            <p className="text-zinc-400 mb-6">Your payment could not be processed.</p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button 
                onClick={() => window.history.back()}
                className="bg-zinc-800 hover:bg-zinc-700 text-white py-3 px-6 rounded-md font-medium transition-colors"
              >
                Try Again
              </button>
              <Link 
                href="/dashboard" 
                className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-md font-medium transition-colors"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        )}
        
        {(status === 'pending' || status === 'user_dropped') && (
          <div className="bg-zinc-900 border border-yellow-500/30 rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Payment Pending</h2>
            <p className="text-zinc-400 mb-6">Your payment is being processed and will be confirmed shortly.</p>
            
            <div className="bg-zinc-800/40 rounded-lg p-4 mb-6">
              <div className="flex justify-between">
                <span className="text-zinc-400">Order ID:</span>
                <span className="text-zinc-300 font-medium">{paymentDetails?.orderId}</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button 
                onClick={() => window.location.reload()}
                className="bg-zinc-800 hover:bg-zinc-700 text-white py-3 px-6 rounded-md font-medium transition-colors"
              >
                Check Status
              </button>
              <Link 
                href="/dashboard" 
                className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-md font-medium transition-colors"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        )}
        
        {status === 'error' && (
          <div className="bg-zinc-900 border border-red-500/30 rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Payment Verification Failed</h2>
            <p className="text-zinc-400 mb-6">We couldn't verify your payment. Please try again or contact support.</p>
            
            <Link 
              href="/dashboard" 
              className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-md font-medium transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
        )}
      </div>
      
      <style jsx>{`
        .coin-animation-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          pointer-events: none;
        }
        
        .coin {
          position: absolute;
          top: -50px;
          animation: coinFall linear forwards;
          z-index: 1;
        }
        
        .coin-inner {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          color: #eab308;
          font-size: 24px;
          animation: coinRotate linear infinite;
          animation-duration: 1s;
        }
        
        @keyframes coinFall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          
          75% {
            opacity: 1;
          }
          
          100% {
            transform: translateY(500px) rotate(20deg);
            opacity: 0;
          }
        }
        
        @keyframes coinRotate {
          0% {
            transform: rotateY(0deg);
          }
          50% {
            transform: rotateY(180deg);
          }
          100% {
            transform: rotateY(360deg);
          }
        }
      `}</style>
    </div>
  );
} 