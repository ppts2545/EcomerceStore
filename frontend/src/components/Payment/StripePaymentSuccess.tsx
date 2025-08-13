import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import StripeService from '../../services/StripeService';
import './PaymentResult.css';

interface PaymentDetails {
  id?: string;
  amount?: number;
  currency?: string;
  status: string;
  sessionId?: string;
}

const StripePaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [paymentStatus, setPaymentStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  
  const sessionId = searchParams.get('session_id');
  const paymentIntentId = searchParams.get('payment_intent');
  const clientSecret = searchParams.get('payment_intent_client_secret');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        if (paymentIntentId && clientSecret) {
          // Verify payment intent
          const result = await StripeService.retrievePaymentIntent(paymentIntentId);
          if (result && typeof result === 'object' && 'paymentIntent' in result) {
            const paymentIntent = result.paymentIntent as {
              id: string;
              amount: number;
              currency: string;
              status: string;
            };
            if (paymentIntent.status === 'succeeded') {
              setPaymentDetails({
                id: paymentIntent.id,
                amount: paymentIntent.amount / 100,
                currency: paymentIntent.currency.toUpperCase(),
                status: paymentIntent.status
              });
              setPaymentStatus('success');
            } else {
              setPaymentStatus('error');
            }
          }
        } else if (sessionId) {
          // Handle checkout session success
          setPaymentDetails({
            sessionId,
            status: 'completed'
          });
          setPaymentStatus('success');
        } else {
          setPaymentStatus('success'); // Default success if no specific verification needed
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setPaymentStatus('error');
      }
    };

    verifyPayment();
  }, [sessionId, paymentIntentId, clientSecret]);

  if (paymentStatus === 'loading') {
    return (
      <div className="payment-result-container">
        <div className="payment-loading">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <h2>Verifying your payment...</h2>
            <p>Please wait while we confirm your transaction.</p>
          </div>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'error') {
    return (
      <div className="payment-result-container">
        <div className="payment-error">
          <div className="error-icon">❌</div>
          <h2>Payment Verification Failed</h2>
          <p>We encountered an issue while verifying your payment. Please contact support if you believe this is an error.</p>
          <div className="action-buttons">
            <Link to="/" className="btn-primary">Return to Home</Link>
            <Link to="/contact" className="btn-secondary">Contact Support</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-result-container">
      <div className="payment-success">
        <div className="success-icon">✅</div>
        <h1>Payment Successful!</h1>
        <p>Thank you for your purchase. Your order has been confirmed.</p>
        
        {paymentDetails && (
          <div className="payment-details">
            <h3>Payment Details</h3>
            <div className="details-grid">
              {paymentDetails.id && (
                <div className="detail-item">
                  <span className="label">Payment ID:</span>
                  <span className="value">{paymentDetails.id}</span>
                </div>
              )}
              {paymentDetails.amount && (
                <div className="detail-item">
                  <span className="label">Amount:</span>
                  <span className="value">
                    {StripeService.formatPrice(paymentDetails.amount, paymentDetails.currency)}
                  </span>
                </div>
              )}
              <div className="detail-item">
                <span className="label">Status:</span>
                <span className="value success-status">Completed</span>
              </div>
              <div className="detail-item">
                <span className="label">Date:</span>
                <span className="value">{new Date().toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        <div className="success-actions">
          <Link to="/order-history" className="btn-primary">View Orders</Link>
          <Link to="/" className="btn-secondary">Continue Shopping</Link>
        </div>

        <div className="next-steps">
          <h4>What's Next?</h4>
          <ul>
            <li>You will receive a confirmation email shortly</li>
            <li>Track your order status in your account</li>
            <li>Estimated delivery: 3-5 business days</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StripePaymentSuccess;
