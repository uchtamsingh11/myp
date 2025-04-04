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
      
      console.log("Creating order with:", { amount, orderId });
      
      // Create an order on the server
      const createOrderResponse = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          orderId,
          // Add customer details
          customerName: 'Test User',
          customerEmail: 'test@example.com',
          customerPhone: '9999999999'
        }),
      });
      
      const orderData = await createOrderResponse.json();
      console.log("Order created response:", orderData);
      
      if (!createOrderResponse.ok) {
        throw new Error(orderData.error || orderData.message || 'Failed to create payment order');
      }
      
      if (!orderData.paymentSessionId) {
        throw new Error('Payment session ID is missing from the response');
      }
      
      // Load Cashfree SDK dynamically
      if (!window.Cashfree) {
        console.log("Loading Cashfree SDK");
        const cashfreeScript = document.createElement('script');
        cashfreeScript.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
        cashfreeScript.async = true;
        
        await new Promise((resolve, reject) => {
          cashfreeScript.onload = resolve;
          cashfreeScript.onerror = () => reject(new Error('Failed to load Cashfree SDK'));
          document.head.appendChild(cashfreeScript);
        });
      }
      
      // Initialize Cashfree SDK - Must match environment in backend
      // Get the environment from the response instead of hardcoding
      const mode = orderData.environment || 'production';
      console.log(`Initializing Cashfree in ${mode} mode`);
      const cashfree = window.Cashfree({
        mode: mode,
      });
      
      // Open Cashfree checkout
      const checkoutOptions = {
        paymentSessionId: orderData.paymentSessionId,
        redirectTarget: '_self', // Redirect in same window for better UX
      };
      
      console.log("Starting checkout with session ID:", orderData.paymentSessionId);
      
      try {
        // Launch the checkout - this will redirect or open modal based on redirectTarget
        await cashfree.checkout(checkoutOptions);
        
        // This code may not run if redirected away
        console.log("Checkout initiated");
      } catch (checkoutError) {
        console.error("Checkout error:", checkoutError);
        throw new Error('Payment gateway error: ' + (checkoutError.message || 'Failed to open checkout'));
      }
      
      // The following code only runs for modal or inline checkout, not for redirects
      const verifyResponse = await fetch(`/api/payments/verify-payment?order_id=${orderData.orderId}`);
      const verifyData = await verifyResponse.json();
      
      if (verifyData.isPaid) {
        // Payment successful
        if (onSuccess && typeof onSuccess === 'function') {
          onSuccess(verifyData);
        } else {
          // Redirect to pricing page with payment status if no success handler
          router.push(`/dashboard/pricing?order_id=${orderData.orderId}&status=success`);
        }
      } else {
        // Payment failed or pending
        router.push(`/dashboard/pricing?order_id=${orderData.orderId}&status=pending`);
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