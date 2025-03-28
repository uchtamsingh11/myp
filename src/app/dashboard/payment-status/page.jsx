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
          timestamp: new Date().toLocaleString()
        });
      } catch (error) {
        console.error('Error checking payment status:', error);
        setStatus('error');
      }
    };
    
    checkPaymentStatus();
  }, [orderId, searchParams]);
  
  return (
    <div className="payment-status-container">
      <h1>Payment Status</h1>
      
      {status === 'loading' && (
        <div className="status-card loading">
          <div className="status-icon">⏳</div>
          <h2>Checking payment status...</h2>
          <p>Please wait while we verify your payment.</p>
        </div>
      )}
      
      {status === 'success' && (
        <div className="status-card success">
          <div className="status-icon">✅</div>
          <h2>Payment Successful!</h2>
          <div className="payment-details">
            <div className="detail-row">
              <span>Order ID:</span>
              <span>{paymentDetails?.orderId}</span>
            </div>
            <div className="detail-row">
              <span>Amount:</span>
              <span>₹{paymentDetails?.amount}</span>
            </div>
            <div className="detail-row">
              <span>Date:</span>
              <span>{paymentDetails?.timestamp}</span>
            </div>
          </div>
          <Link href="/dashboard" className="return-button">
            Return to Dashboard
          </Link>
        </div>
      )}
      
      {status === 'failed' && (
        <div className="status-card error">
          <div className="status-icon">❌</div>
          <h2>Payment Failed</h2>
          <p>Your payment could not be processed.</p>
          <div className="actions">
            <button 
              className="retry-button" 
              onClick={() => window.history.back()}
            >
              Try Again
            </button>
            <Link href="/dashboard" className="return-button">
              Return to Dashboard
            </Link>
          </div>
        </div>
      )}
      
      {(status === 'pending' || status === 'user_dropped') && (
        <div className="status-card pending">
          <div className="status-icon">⏳</div>
          <h2>Payment Pending</h2>
          <p>Your payment is being processed and will be confirmed shortly.</p>
          <div className="payment-details">
            <div className="detail-row">
              <span>Order ID:</span>
              <span>{paymentDetails?.orderId}</span>
            </div>
          </div>
          <div className="actions">
            <button 
              className="retry-button" 
              onClick={() => window.location.reload()}
            >
              Check Status
            </button>
            <Link href="/dashboard" className="return-button">
              Return to Dashboard
            </Link>
          </div>
        </div>
      )}
      
      {status === 'error' && (
        <div className="status-card error">
          <div className="status-icon">❌</div>
          <h2>Payment Verification Failed</h2>
          <p>We couldn't verify your payment. Please try again or contact support.</p>
          <Link href="/dashboard" className="return-button">
            Return to Dashboard
          </Link>
        </div>
      )}
      
      <style jsx>{`
        .payment-status-container {
          max-width: 600px;
          margin: 0 auto;
          padding: 2rem;
        }
        
        h1 {
          text-align: center;
          margin-bottom: 2rem;
          color: #1F2937;
        }
        
        .status-card {
          padding: 2rem;
          border-radius: 8px;
          text-align: center;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .status-card.loading {
          background-color: #F9FAFB;
          border: 1px solid #E5E7EB;
        }
        
        .status-card.success {
          background-color: #ECFDF5;
          border: 1px solid #D1FAE5;
        }
        
        .status-card.error {
          background-color: #FEF2F2;
          border: 1px solid #FEE2E2;
        }
        
        .status-card.pending {
          background-color: #FFFBEB;
          border: 1px solid #FEF3C7;
        }
        
        .status-icon {
          font-size: 48px;
          margin-bottom: 1rem;
        }
        
        h2 {
          margin-bottom: 1rem;
          color: #1F2937;
        }
        
        .payment-details {
          margin: 1.5rem 0;
          text-align: left;
        }
        
        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          border-bottom: 1px solid #E5E7EB;
        }
        
        .detail-row:last-child {
          border-bottom: none;
        }
        
        .actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-top: 1.5rem;
        }
        
        .return-button, .retry-button {
          background-color: #3B82F6;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 12px 20px;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
          display: inline-block;
        }
        
        .retry-button {
          background-color: #9CA3AF;
        }
        
        .return-button:hover {
          background-color: #2563EB;
        }
        
        .retry-button:hover {
          background-color: #6B7280;
        }
      `}</style>
    </div>
  );
} 