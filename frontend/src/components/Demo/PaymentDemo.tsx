import React, { useState } from 'react';
import BeautifulPayment from '../Payment/BeautifulPayment';
import StripeCheckoutButton from '../Payment/StripeCheckoutButton';
import './PaymentDemo.css';

const PaymentDemo: React.FC = () => {
  const [paymentType, setPaymentType] = useState<'beautiful' | 'checkout'>('checkout');
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Demo data
  const cartItems = [
    {
      productId: 1,
      productName: 'iPhone 15 Pro Max',
      price: 45900,
      quantity: 1,
      description: 'สมาร์ทโฟนรุ่นล่าสุดจาก Apple'
    },
    {
      productId: 2,
      productName: 'MacBook Air M3',
      price: 39900,
      quantity: 1,
      description: 'โน้ตบุ๊คสำหรับการทำงานและเรียนรู้'
    },
    {
      productId: 3,
      productName: 'AirPods Pro',
      price: 8900,
      quantity: 2,
      description: 'หูฟังไร้สายพร้อมระบบตัดเสียงรบกวน'
    }
  ];

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const customerInfo = {
    name: 'สมชาย ใจดี',
    email: 'somchai@example.com',
    address: '123 ถนนสุขุมวิท',
    city: 'กรุงเทพมหานคร',
    postalCode: '10110'
  };

  const handleSuccess = () => {
    setShowSuccess(true);
    setError(null);
    setTimeout(() => setShowSuccess(false), 5000);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setShowSuccess(false);
    setTimeout(() => setError(null), 5000);
  };

  if (showSuccess) {
    return (
      <div className="payment-demo">
        <div className="success-message">
          <div className="success-icon">✅</div>
          <h2>ชำระเงินสำเร็จ!</h2>
          <p>ขอบคุณสำหรับการสั่งซื้อ คำสั่งซื้อของคุณกำลังถูกประมวลผล</p>
          <button onClick={() => setShowSuccess(false)} className="back-button">
            กลับไปดูตัวอย่าง
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-demo">
      <div className="demo-header">
        <h1>🎨 Stripe Payment UI Demo</h1>
        <p>เลือกรูปแบบการชำระเงินที่คุณต้องการ</p>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">❌</span>
          {error}
        </div>
      )}

      <div className="payment-type-selector">
        <button 
          className={`type-button ${paymentType === 'checkout' ? 'active' : ''}`}
          onClick={() => setPaymentType('checkout')}
        >
          🛒 Stripe Checkout
          <span className="subtitle">หน้าชำระเงินสำเร็จรูปจาก Stripe</span>
        </button>
        
        <button 
          className={`type-button ${paymentType === 'beautiful' ? 'active' : ''}`}
          onClick={() => setPaymentType('beautiful')}
        >
          💎 Custom Beautiful UI
          <span className="subtitle">หน้าชำระเงินสวยๆ แบบกำหนดเอง</span>
        </button>
      </div>

      <div className="payment-container">
        {paymentType === 'checkout' ? (
          <StripeCheckoutButton
            cartItems={cartItems}
            total={total}
            customerInfo={customerInfo}
            onSuccess={handleSuccess}
            onError={handleError}
          />
        ) : (
          <BeautifulPayment
            cartItems={cartItems}
            total={total}
            customerInfo={customerInfo}
            onSuccess={handleSuccess}
            onError={handleError}
          />
        )}
      </div>

      <div className="demo-info">
        <h3>💡 ข้อมูลการทดสอบ</h3>
        <div className="test-cards">
          <div className="card-info">
            <h4>💳 บัตรทดสอบ (Test Cards)</h4>
            <p><strong>เลขบัตร:</strong> 4242424242424242</p>
            <p><strong>CVV:</strong> 123</p>
            <p><strong>วันหมดอายุ:</strong> 12/34</p>
            <p><strong>ชื่อ:</strong> Test User</p>
          </div>
          <div className="card-info">
            <h4>🚫 บัตรที่ถูกปฏิเสธ</h4>
            <p><strong>เลขบัตร:</strong> 4000000000000002</p>
            <p>ใช้สำหรับทดสอบกรณีบัตรถูกปฏิเสธ</p>
          </div>
        </div>
        
        <div className="features-comparison">
          <h4>⚡ เปรียบเทียบคุณสมบัติ</h4>
          <table>
            <thead>
              <tr>
                <th>คุณสมบัติ</th>
                <th>Stripe Checkout</th>
                <th>Custom UI</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>ความปลอดภัย</td>
                <td>✅ สูงสุด</td>
                <td>✅ สูงสุด</td>
              </tr>
              <tr>
                <td>การปรับแต่ง</td>
                <td>⚠️ จำกัด</td>
                <td>✅ เต็มที่</td>
              </tr>
              <tr>
                <td>รองรับมือถือ</td>
                <td>✅ ดีเยี่ยม</td>
                <td>✅ ดี</td>
              </tr>
              <tr>
                <td>การใช้งาน</td>
                <td>✅ ง่ายมาก</td>
                <td>⚠️ ต้องพัฒนา</td>
              </tr>
              <tr>
                <td>ความเร็ว</td>
                <td>✅ เร็วมาก</td>
                <td>✅ เร็ว</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PaymentDemo;
