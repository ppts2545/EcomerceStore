import React, { useState, useEffect } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import type { StripeProduct } from '../../services/StripeService';
import './StripeCheckout.css';

interface StripeCheckoutFormProps {
  products: StripeProduct[];
  clientSecret: string;
  onSuccess?: (paymentIntentId: string) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
}

const StripeCheckoutForm: React.FC<StripeCheckoutFormProps> = ({
  products,
  clientSecret,
  onSuccess,
  onError,
  onCancel
}) => {
  const stripe = useStripe();
  const elements = useElements();
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [email, setEmail] = useState('');

  const totalAmount = products.reduce((sum, product) => 
    sum + (product.price * product.quantity), 0
  );

  useEffect(() => {
    if (!stripe || !clientSecret) {
      return;
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      if (!paymentIntent) return;
      
      switch (paymentIntent.status) {
        case 'succeeded':
          setMessage('Payment succeeded!');
          if (onSuccess) onSuccess(paymentIntent.id);
          break;
        case 'processing':
          setMessage('Your payment is processing.');
          break;
        case 'requires_payment_method':
          setMessage('Your payment was not successful, please try again.');
          break;
        default:
          setMessage('Something went wrong.');
          break;
      }
    });
  }, [stripe, onSuccess, clientSecret]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment/success`,
        receipt_email: email,
      },
      redirect: 'if_required',
    });

    setIsLoading(false);

    if (error) {
      if (error.type === 'card_error' || error.type === 'validation_error') {
        setMessage(error.message || 'An error occurred');
        if (onError) onError(error.message || 'Payment failed');
      } else {
        setMessage('An unexpected error occurred.');
        if (onError) onError('An unexpected error occurred');
      }
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      setMessage('Payment succeeded!');
      if (onSuccess) onSuccess(paymentIntent.id);
    }
  };

  const paymentElementOptions = {
    layout: 'tabs' as const,
    fields: {
      billingDetails: {
        name: 'auto' as const,
        email: 'auto' as const
      }
    },
    terms: {
      card: 'auto' as const
    }
  };

  return (
    <div className="stripe-checkout-form">
      <div className="order-summary">
        <h3>Order Summary</h3>
        <div className="products-list">
          {products.map((product, index) => (
            <div key={index} className="product-item">
              <div className="product-info">
                <span className="product-name">{product.name}</span>
                <span className="product-quantity">x {product.quantity}</span>
              </div>
              <span className="product-price">
                ฿{(product.price * product.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
        <div className="total-amount">
          <strong>Total: ฿{totalAmount.toFixed(2)}</strong>
        </div>
      </div>

      <form id="payment-form" onSubmit={handleSubmit} className="payment-form">
        <div className="email-input">
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </div>

        <PaymentElement 
          id="payment-element" 
          options={paymentElementOptions}
        />

        <div className="form-actions">
          <button 
            type="button" 
            onClick={onCancel}
            className="cancel-button"
            disabled={isLoading}
          >
            Cancel
          </button>
          
          <button 
            disabled={isLoading || !stripe || !elements} 
            id="submit"
            className="pay-button"
            type="submit"
          >
            <span id="button-text">
              {isLoading ? (
                <div className="spinner" id="spinner"></div>
              ) : (
                `Pay ฿${totalAmount.toFixed(2)}`
              )}
            </span>
          </button>
        </div>

        {message && (
          <div id="payment-message" className={message.includes('succeeded') ? 'success-message' : 'error-message'}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
};

export default StripeCheckoutForm;
