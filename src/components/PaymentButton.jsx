'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PaymentButton({ amount, orderId, buttonText = 'Pay Now', className = '', onSuccess }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handlePayment = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Create an order on the server
      const createOrderResponse = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          orderId,
        }),
      });
      
      const orderData = await createOrderResponse.json();
      
      if (!createOrderResponse.ok) {
        throw new Error(orderData.error || 'Failed to create payment order');
      }
      
      // Load Cashfree SDK dynamically
      const cashfreeScript = document.createElement('script');
      cashfreeScript.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
      cashfreeScript.async = true;
      
      // Wait for the script to load
      await new Promise((resolve, reject) => {
        cashfreeScript.onload = resolve;
        cashfreeScript.onerror = () => reject(new Error('Failed to load Cashfree SDK'));
        document.head.appendChild(cashfreeScript);
      });
      
      // Initialize Cashfree SDK
      const environment = process.env.NODE_ENV === 'development' ? 'sandbox' : 'production';
      const cashfree = Cashfree({
        mode: environment,
      });
      
      // Open Cashfree checkout as popup
      const checkoutOptions = {
        paymentSessionId: orderData.paymentSessionId,
        redirectTarget: '_modal', // This makes it a popup
      };
      
      // Launch the popup and handle the result
      await cashfree.checkout(checkoutOptions);
      
      // Verify payment status
      const verifyResponse = await fetch(`/api/payments/verify-payment?order_id=${orderData.orderId}`);
      const verifyData = await verifyResponse.json();
      
      if (verifyData.isPaid) {
        // Payment successful
        if (onSuccess && typeof onSuccess === 'function') {
          onSuccess(verifyData);
        } else {
          // Redirect to payment success page if no success handler
          router.push(`/dashboard/payment-status?order_id=${orderData.orderId}&status=success`);
        }
      } else {
        // Payment failed or pending
        router.push(`/dashboard/payment-status?order_id=${orderData.orderId}&status=pending`);
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      setError(error.message || 'Payment processing failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="payment-button-container">
      <button
        onClick={handlePayment}
        disabled={isLoading}
        className={`payment-button ${isLoading ? 'loading' : ''} ${className}`}
      >
        {isLoading ? 'Processing...' : buttonText}
      </button>
      {error && <div className="payment-error">{error}</div>}
      
      <style jsx>{`
        .payment-button {
          background-color: #0070f3;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 12px 20px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        
        .payment-button:hover {
          background-color: #0060df;
        }
        
        .payment-button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
        
        .payment-button.loading {
          opacity: 0.7;
        }
        
        .payment-error {
          color: #e53e3e;
          margin-top: 8px;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
} 