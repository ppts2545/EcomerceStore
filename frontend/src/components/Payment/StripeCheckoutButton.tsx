import React, { useState } from 'react';
import './StripeCheckoutButton.css';

interface CartItem {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  description?: string;
}

interface StripeCheckoutButtonProps {
  cartItems: CartItem[];
  total: number;
  customerInfo?: {
    email?: string;
    name?: string;
  };
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const StripeCheckoutButton: React.FC<StripeCheckoutButtonProps> = ({
  cartItems,
  total,
  customerInfo,
  onSuccess,
  onError
}) => {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/payments/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          products: cartItems.map(item => ({
            name: item.productName,
            description: item.description || `สินค้า ${item.productName}`,
            price: Math.round(item.price * 100), // Convert to cents
            quantity: item.quantity
          })),
          successUrl: `${window.location.origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/cart`,
          customerEmail: customerInfo?.email,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();
      
      // Redirect to Stripe Checkout
      window.location.href = url;
      
    } catch (error: any) {
      console.error('Checkout error:', error);
      onError?.(error.message || 'เกิดข้อผิดพลาดในการสร้างเซสชันชำระเงิน');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stripe-checkout-container">
      <div className="checkout-preview">
        <h3>🛒 ชำระเงินผ่าน Stripe Checkout</h3>
        <div className="checkout-features">
          <div className="feature">
            <span className="icon">🔒</span>
            <span>ปลอดภัยสูงสุด</span>
          </div>
          <div className="feature">
            <span className="icon">📱</span>
            <span>รองรับมือถือ</span>
          </div>
          <div className="feature">
            <span className="icon">💳</span>
            <span>รองรับบัตรหลากหลาย</span>
          </div>
          <div className="feature">
            <span className="icon">🌐</span>
            <span>ส่วนต่อประสานที่สวยงาม</span>
          </div>
        </div>
        
        <div className="order-preview">
          <h4>📦 สรุปคำสั่งซื้อ</h4>
          <div className="items-list">
            {cartItems.slice(0, 3).map((item, index) => (
              <div key={index} className="preview-item">
                <span>{item.productName} x {item.quantity}</span>
                <span>฿{(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
            {cartItems.length > 3 && (
              <div className="more-items">
                และอีก {cartItems.length - 3} รายการ...
              </div>
            )}
          </div>
          
          <div className="total-preview">
            <strong>รวมทั้งหมด: ฿{total.toLocaleString()}</strong>
          </div>
        </div>
      </div>

      <button 
        className="stripe-checkout-button"
        onClick={handleCheckout}
        disabled={loading || cartItems.length === 0}
      >
        {loading ? (
          <>
            <div className="loading-spinner"></div>
            กำลังสร้างเซสชัน...
          </>
        ) : (
          <>
            <span className="stripe-logo">
              <svg width="40" height="17" viewBox="0 0 40 17" fill="none">
                <path d="M36.1 6.5c0-.6-.5-1-1.1-1h-1.2c-.3 0-.5.2-.6.4l-2.2 5.7c-.1.3-.4.5-.7.5s-.6-.2-.7-.5l-2.2-5.7c-.1-.2-.3-.4-.6-.4h-1.2c-.6 0-1.1.4-1.1 1 0 .2 0 .3.1.5l3.2 8c.2.5.7.8 1.2.8h.8c.5 0 1-.3 1.2-.8l3.2-8c0-.2.1-.3.1-.5z" fill="white"/>
                <path d="M22.8 14.9h-1c-.6 0-1-.4-1-1V6.5c0-.6.4-1 1-1h1c.6 0 1 .4 1 1v7.4c0 .6-.4 1-1 1z" fill="white"/>
                <path d="M18.5 6.5v6.9c0 .8-.6 1.5-1.4 1.5-.8 0-1.4-.7-1.4-1.5V6.5c0-.6-.4-1-1-1s-1 .4-1 1v6.9c0 2 1.6 3.5 3.4 3.5s3.4-1.5 3.4-3.5V6.5c0-.6-.4-1-1-1s-1 .4-1 1z" fill="white"/>
                <path d="M11.7 5.5h-1c-.6 0-1 .4-1 1v7.4c0 .6.4 1 1 1h1c.6 0 1-.4 1-1V6.5c0-.6-.4-1-1-1z" fill="white"/>
                <path d="M8.4 5.5c-.6 0-1 .4-1 1v3.2c-.4-.3-.9-.5-1.5-.5-2 0-3.6 1.6-3.6 3.6s1.6 3.6 3.6 3.6c.6 0 1.1-.2 1.5-.5v.1c0 .6.4 1 1 1s1-.4 1-1V6.5c0-.6-.4-1-1-1zm-1.9 7.4c-.9 0-1.6-.7-1.6-1.6s.7-1.6 1.6-1.6 1.6.7 1.6 1.6-.7 1.6-1.6 1.6z" fill="white"/>
                <path d="M2.9 10.8c0-2 1.6-3.6 3.6-3.6.6 0 1.1.2 1.5.5V6.5c0-.6.4-1 1-1s1 .4 1 1v7.4c0 .6-.4 1-1 1v-.1c-.4.3-.9.5-1.5.5-2 0-3.6-1.6-3.6-3.5zm5.1 0c0-.9-.7-1.6-1.6-1.6s-1.6.7-1.6 1.6.7 1.6 1.6 1.6 1.6-.7 1.6-1.6z" fill="white"/>
              </svg>
            </span>
            ชำระเงินผ่าน Stripe
            <span className="amount-badge">฿{total.toLocaleString()}</span>
          </>
        )}
      </button>

      <div className="checkout-footer">
        <p>🔒 คุณจะถูกนำไปยังหน้าชำระเงินที่ปลอดภัยของ Stripe</p>
        <p>💳 รองรับ Visa • MasterCard • JCB • และอื่นๆ</p>
      </div>
    </div>
  );
};

export default StripeCheckoutButton;
