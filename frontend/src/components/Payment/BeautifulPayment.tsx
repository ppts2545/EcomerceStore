import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import './BeautifulPayment.css';

// Load Stripe with your publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string);

interface CheckoutFormProps {
  total: number;
  cartItems: any[];
  customerInfo: any;
  onSuccess: () => void;
  onError: (error: string) => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ 
  total, 
  cartItems, 
  customerInfo, 
  onSuccess, 
  onError 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    try {
      if (paymentMethod === 'card') {
        await handleCardPayment();
      } else if (paymentMethod === 'checkout') {
        await handleCheckoutSession();
      }
    } catch (error: any) {
      onError(error.message);
      setProcessing(false);
    }
  };

  const handleCardPayment = async () => {
    const cardElement = elements?.getElement(CardElement);
    if (!cardElement) return;

    // Create Payment Intent
    const response = await fetch('/api/payments/create-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: Math.round(total * 100), // Convert to cents
        currency: 'thb',
        products: cartItems.map(item => ({
          id: item.productId.toString(),
          name: item.productName,
          quantity: item.quantity,
          price: Math.round(item.price * 100)
        }))
      })
    });

    const { client_secret } = await response.json();

    // Confirm Payment
    const result = await stripe!.confirmCardPayment(client_secret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: customerInfo.name,
          email: customerInfo.email,
          address: {
            line1: customerInfo.address,
            city: customerInfo.city,
            postal_code: customerInfo.postalCode,
            country: 'TH'
          }
        }
      }
    });

    if (result.error) {
      throw new Error(result.error.message);
    } else {
      onSuccess();
    }
  };

  const handleCheckoutSession = async () => {
    // Create Checkout Session
    const response = await fetch('/api/payments/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        products: cartItems.map(item => ({
          name: item.productName,
          description: item.description || '',
          price: Math.round(item.price * 100),
          quantity: item.quantity
        })),
        successUrl: `${window.location.origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/payment-cancel`
      })
    });

    const { url } = await response.json();
    window.location.href = url;
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSmoothing: 'antialiased',
      },
      invalid: {
        color: '#9e2146',
      },
    },
    hidePostalCode: false,
  };

  return (
    <div className="beautiful-payment-container">
      <div className="payment-header">
        <h2>💳 ชำระเงิน</h2>
        <div className="total-amount">
          ยอดรวม: ฿{total.toLocaleString()}
        </div>
      </div>

      <div className="payment-methods">
        <div className="method-tabs">
          <button 
            className={`tab ${paymentMethod === 'card' ? 'active' : ''}`}
            onClick={() => setPaymentMethod('card')}
          >
            💳 ชำระด้วยบัตร
          </button>
          <button 
            className={`tab ${paymentMethod === 'checkout' ? 'active' : ''}`}
            onClick={() => setPaymentMethod('checkout')}
          >
            🛒 Stripe Checkout
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="payment-form">
        {paymentMethod === 'card' && (
          <div className="card-payment">
            <div className="card-element-container">
              <label className="card-label">
                💳 ข้อมูลบัตรเครดิต/เดบิต
              </label>
              <div className="card-element-wrapper">
                <CardElement options={cardElementOptions} />
              </div>
            </div>
            
            <div className="security-badges">
              <div className="badge">🔒 SSL Secure</div>
              <div className="badge">🛡️ PCI Compliant</div>
              <div className="badge">✅ Stripe Protected</div>
            </div>
          </div>
        )}

        {paymentMethod === 'checkout' && (
          <div className="checkout-payment">
            <div className="checkout-info">
              <h3>🛒 Stripe Checkout</h3>
              <p>✨ หน้าชำระเงินสวยๆ จาก Stripe</p>
              <ul>
                <li>🔒 ปลอดภัยสูงสุด</li>
                <li>📱 รองรับมือถือ</li>
                <li>💳 รองรับบัตรหลากหลาย</li>
                <li>🌐 รองรับหลายภาษา</li>
              </ul>
            </div>
          </div>
        )}

        <div className="order-summary">
          <h3>📦 สรุปคำสั่งซื้อ</h3>
          {cartItems.map((item, index) => (
            <div key={index} className="order-item">
              <span>{item.productName} x {item.quantity}</span>
              <span>฿{(item.price * item.quantity).toLocaleString()}</span>
            </div>
          ))}
          <div className="order-total">
            <strong>รวมทั้งหมด: ฿{total.toLocaleString()}</strong>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={!stripe || processing}
          className="pay-button"
        >
          {processing ? (
            <>
              <div className="spinner"></div>
              กำลังดำเนินการ...
            </>
          ) : (
            <>
              {paymentMethod === 'card' ? '💳 ชำระเงิน' : '🛒 ไปหน้า Checkout'}
              <span className="amount">฿{total.toLocaleString()}</span>
            </>
          )}
        </button>

        <div className="payment-footer">
          <p>🔒 การชำระเงินของคุณปลอดภัยด้วยการเข้ารหัส SSL</p>
          <div className="supported-cards">
            <span>รองรับ:</span>
            <span className="card-icons">💳 Visa • MasterCard • JCB • UnionPay</span>
          </div>
        </div>
      </form>
    </div>
  );
};

interface BeautifulPaymentProps {
  total: number;
  cartItems: any[];
  customerInfo: any;
  onSuccess: () => void;
  onError: (error: string) => void;
}

const BeautifulPayment: React.FC<BeautifulPaymentProps> = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm {...props} />
    </Elements>
  );
};

export default BeautifulPayment;
