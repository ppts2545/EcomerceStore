import React, { useState } from 'react';
import StripePayment from '../components/Payment/StripePayment';
import type { StripeProduct } from '../services/StripeService';
import './StripeTestPage.css';

const StripeTestPage: React.FC = () => {
  const [clientSecret, setClientSecret] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const sampleProducts: StripeProduct[] = [
    {
      id: 'prod_1',
      name: 'Sample Product 1',
      description: 'A great product for testing',
      price: 299.99,
      currency: 'thb',
      quantity: 1,
      image: '/placeholder-product.jpg'
    },
    {
      id: 'prod_2',
      name: 'Sample Product 2',
      description: 'Another amazing product',
      price: 199.50,
      currency: 'thb',
      quantity: 2,
      image: '/placeholder-product.jpg'
    }
  ];

  const createTestPayment = async () => {
    setIsLoading(true);
    try {
      // In a real scenario, this would call the backend
      // For now, let's simulate a client secret
      setTimeout(() => {
        setClientSecret('pi_test_1234567890_secret_test');
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error creating test payment:', error);
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentIntentId: string) => {
    alert(`Payment successful! Payment Intent ID: ${paymentIntentId}`);
    setClientSecret('');
  };

  const handlePaymentError = (error: string) => {
    alert(`Payment failed: ${error}`);
  };

  const handleCancel = () => {
    setClientSecret('');
    alert('Payment cancelled');
  };

  const totalAmount = sampleProducts.reduce((sum, product) => 
    sum + (product.price * product.quantity), 0
  );

  return (
    <div className="stripe-test-page">
      <div className="container">
        <h1>Stripe Payment Integration Test</h1>
        <p>Test the Stripe payment system with sample products</p>

        <div className="test-products">
          <h3>Test Products (Total: ฿{totalAmount.toFixed(2)})</h3>
          {sampleProducts.map((product, index) => (
            <div key={index} className="product-card">
              <h4>{product.name}</h4>
              <p>{product.description}</p>
              <p>Price: ฿{product.price} x {product.quantity}</p>
              <p><strong>Subtotal: ฿{(product.price * product.quantity).toFixed(2)}</strong></p>
            </div>
          ))}
        </div>

        {!clientSecret ? (
          <div className="payment-setup">
            <button 
              onClick={createTestPayment} 
              disabled={isLoading}
              className="create-payment-btn"
            >
              {isLoading ? 'Creating Payment...' : 'Create Test Payment'}
            </button>
            <p className="note">
              Note: This will create a test payment intent. You'll need to configure your Stripe keys in the .env.local file.
            </p>
          </div>
        ) : (
          <div className="payment-section">
            <h3>Complete Your Payment</h3>
            <StripePayment
              products={sampleProducts}
              clientSecret={clientSecret}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              onCancel={handleCancel}
            />
          </div>
        )}

        <div className="configuration-info">
          <h3>Configuration Required</h3>
          <p>To use this integration, you need to:</p>
          <ol>
            <li>Get your Stripe API keys from <a href="https://dashboard.stripe.com/apikeys" target="_blank">Stripe Dashboard</a></li>
            <li>Update the <code>.env.local</code> file with your keys:</li>
            <pre>{`VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here`}</pre>
            <li>Update the backend <code>application.properties</code> with:</li>
            <pre>{`stripe.api.key=sk_test_your_secret_key_here`}</pre>
            <li>Start the backend server on port 8083</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default StripeTestPage;
