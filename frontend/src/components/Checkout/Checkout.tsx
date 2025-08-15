// New simplified Stripe-only payment page (inline implementation)
import React, { useEffect, useState } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import StripeService, { type StripeProduct } from '../../services/StripeService';
import CartService from '../../services/CartService';
import AuthService from '../../services/AuthService';
import type { CartItem } from '../../services/CartService';
import '../Payment/StripeCheckout.css';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface InlineFormProps {
  clientSecret: string;
  products: StripeProduct[];
  onSuccess: (paymentIntentId: string) => void;
}

const InlineStripeForm: React.FC<InlineFormProps> = ({ clientSecret, products, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!stripe || !clientSecret) return;
    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      if (!paymentIntent) return;
      if (paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent.id);
      }
    });
  }, [stripe, clientSecret, onSuccess]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setIsLoading(true);
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { receipt_email: email, return_url: window.location.href },
      redirect: 'if_required'
    });
    setIsLoading(false);
    if (error) {
      setMessage(error.message || 'เกิดข้อผิดพลาด');
      return;
    }
    if (paymentIntent && paymentIntent.status === 'succeeded') {
      setMessage('ชำระเงินสำเร็จ');
      onSuccess(paymentIntent.id);
    }
  };

  const total = products.reduce((s, p) => s + p.price * p.quantity, 0);

  return (
    <form onSubmit={submit} className="stripe-checkout-form" style={{ maxWidth: 480, margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 12 }}>ชำระเงินด้วยบัตร</h2>
      <div className="order-summary" style={{ boxShadow: 'none', border: '1px solid #eee' }}>
        {products.map(p => (
          <div key={p.id} className="product-item" style={{ padding: '4px 0' }}>
            <span>{p.name} × {p.quantity}</span>
            <span>฿{(p.price * p.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="total-amount" style={{ fontSize: 18 }}>รวม: ฿{total.toFixed(2)}</div>
      </div>
      <label style={{ display: 'block', marginTop: 12, fontSize: 14 }}>อีเมลสำหรับใบเสร็จ
        <input value={email} onChange={e => setEmail(e.target.value)} required type="email" placeholder="you@example.com" style={{ width: '100%', marginTop: 4 }} />
      </label>
      <div style={{ marginTop: 16 }}>
        <PaymentElement id="payment-element" options={{ layout: 'tabs' }} />
      </div>
      <button disabled={isLoading || !stripe || !elements} className="pay-button" style={{ width: '100%', marginTop: 18 }}>
        {isLoading ? 'กำลังประมวลผล...' : `ชำระเงิน ฿${total.toFixed(2)}`}
      </button>
      {message && <div id="payment-message" className={message.includes('สำเร็จ') ? 'success-message' : 'error-message'}>{message}</div>}
    </form>
  );
};

const Checkout: React.FC = () => {
  const [clientSecret, setClientSecret] = useState<string>('');
  const [products, setProducts] = useState<StripeProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [needLogin, setNeedLogin] = useState(false);
  const [successId, setSuccessId] = useState<string>('');

  useEffect(() => {
    let inProgress = false;
    const init = async () => {
      if (inProgress) return;
      inProgress = true;
      try {
        const user = await AuthService.getCurrentUser();
        if (!user) { setNeedLogin(true); return; }
        const cart: CartItem[] = await CartService.getCartItems();
        if (!cart.length) { setError('ตะกร้าสินค้าว่าง'); return; }
        const pr: StripeProduct[] = cart.map(c => ({
          id: c.id.toString(),
          name: c.productName,
          description: c.productName,
          price: c.price,
          currency: 'thb',
          quantity: c.quantity,
          image: c.productImage
        }));
        setProducts(pr);
        console.debug('[Checkout] Creating PaymentIntent with products:', pr);
        const intent = await StripeService.createPaymentIntent(pr);
        console.debug('[Checkout] Received clientSecret:', intent.client_secret?.slice(0,12)+'...');
        setClientSecret(intent.client_secret);
      } catch (e: unknown) {
        let msg = 'โหลดข้อมูลล้มเหลว';
        if (e instanceof Error) {
          if (e.message.includes('idempotency_key_in_use')) {
            msg = 'มีการสร้างคำขอชำระเงินซ้ำ กรุณารอสักครู่แล้วลองใหม่อีกครั้ง';
          } else {
            msg = e.message;
          }
        }
        setError(msg);
      } finally { setLoading(false); inProgress = false; }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const appearance = { theme: 'stripe' as const };
  const isLive = (import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '').startsWith('pk_live_');
  const Banner = () => (
    <div style={{
      background: isLive ? '#0a7d41' : '#b7791f',
      color: 'white',
      padding: '6px 14px',
      borderRadius: 8,
      fontSize: 12,
      letterSpacing: .5,
      margin: '0 auto 12px',
      width: '100%',
      maxWidth: 480,
      boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
    }}>
      {isLive ? 'LIVE MODE • การชำระเงินจะถูกเรียกเก็บเงินจริง' : 'TEST MODE • ไม่มีการตัดเงินจริง ใช้บัตรทดสอบ Stripe'}
    </div>
  );

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>กำลังเตรียมหน้าชำระเงิน...</div>;
  if (needLogin) return <div style={{ padding: 40, textAlign: 'center' }}>กรุณาเข้าสู่ระบบก่อนทำการชำระเงิน</div>;
  if (error) return <div style={{ padding: 40, textAlign: 'center', color: 'crimson' }}>{error}</div>;
  if (successId) return <div style={{ padding: 40, textAlign: 'center' }}>ชำระเงินสำเร็จ หมายเลข: {successId}</div>;

  return clientSecret ? (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
  <Banner />
  <InlineStripeForm clientSecret={clientSecret} products={products} onSuccess={(id)=>{ setSuccessId(id); CartService.clearCart(); }} />
    </Elements>
  ) : <div style={{ padding: 40, textAlign: 'center' }}>กำลังสร้างการชำระเงิน...</div>;
};

export default Checkout;