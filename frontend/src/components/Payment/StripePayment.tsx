import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import StripeCheckoutForm from './StripeCheckoutForm';
import type { StripeProduct } from '../../services/StripeService';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface StripePaymentProps {
  products: StripeProduct[];
  clientSecret?: string;
  onSuccess?: (paymentIntentId: string) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
}

const StripePayment: React.FC<StripePaymentProps> = ({
  products,
  clientSecret,
  onSuccess,
  onError,
  onCancel
}) => {
  const appearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#0570de',
      colorBackground: '#ffffff',
      colorText: '#30313d',
      colorDanger: '#df1b41',
      fontFamily: 'Ideal Sans, system-ui, sans-serif',
      spacingUnit: '2px',
      borderRadius: '4px',
    }
  };

  const options = {
    clientSecret,
    appearance,
  };

  if (!clientSecret) {
    return (
      <div className="stripe-payment-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Preparing payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="stripe-payment-container">
      <Elements options={options} stripe={stripePromise}>
        <StripeCheckoutForm
          products={products}
          onSuccess={onSuccess}
          onError={onError}
          onCancel={onCancel}
        />
      </Elements>
    </div>
  );
};

export default StripePayment;
