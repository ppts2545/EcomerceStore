import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PaymentSuccessPage.css';

const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [orderNumber] = useState('ORD-' + Date.now());
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Hide confetti after animation
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleContinueShopping = () => {
    navigate('/');
  };

  const handleViewOrder = () => {
    navigate('/profile'); // Go to order history
  };

  return (
    <div className="payment-success-container">
      {showConfetti && (
        <div className="confetti">
          {[...Array(50)].map((_, i) => (
            <div key={i} className="confetti-piece" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              backgroundColor: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7'][Math.floor(Math.random() * 5)]
            }} />
          ))}
        </div>
      )}
      
      <div className="success-content">
        <div className="success-icon">
          <div className="check-animation">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
              <circle cx="40" cy="40" r="35" stroke="#4CAF50" strokeWidth="4" fill="none" className="check-circle"/>
              <path d="M25 40L35 50L55 30" stroke="#4CAF50" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="check-path"/>
            </svg>
          </div>
        </div>

        <h1 className="success-title">🎉 ชำระเงินสำเร็จ!</h1>
        <p className="success-message">
          ขอบคุณสำหรับการสั่งซื้อ เราได้รับการชำระเงินของคุณเรียบร้อยแล้ว
        </p>

        <div className="order-details">
          <div className="detail-item">
            <span className="detail-label">หมายเลขคำสั่งซื้อ:</span>
            <span className="detail-value">{orderNumber}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">สถานะ:</span>
            <span className="detail-value status-paid">ชำระเงินแล้ว</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">วันที่:</span>
            <span className="detail-value">{new Date().toLocaleDateString('th-TH')}</span>
          </div>
        </div>

        <div className="next-steps">
          <div className="step">
            <div className="step-icon">📧</div>
            <div className="step-content">
              <h4>อีเมลยืนยัน</h4>
              <p>เราจะส่งอีเมลยืนยันการสั่งซื้อไปให้คุณในไม่ช้า</p>
            </div>
          </div>
          <div className="step">
            <div className="step-icon">📦</div>
            <div className="step-content">
              <h4>การจัดส่ง</h4>
              <p>สินค้าจะถูกจัดเตรียมและจัดส่งภายใน 1-3 วันทำการ</p>
            </div>
          </div>
          <div className="step">
            <div className="step-icon">📱</div>
            <div className="step-content">
              <h4>ติดตามสถานะ</h4>
              <p>คุณสามารถติดตามสถานะการสั่งซื้อได้ในหน้าโปรไฟล์</p>
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <button 
            onClick={handleContinueShopping}
            className="continue-shopping-btn"
          >
            🛍️ ช้อปต่อ
          </button>
          <button 
            onClick={handleViewOrder}
            className="view-order-btn"
          >
            📄 ดูรายละเอียดคำสั่งซื้อ
          </button>
        </div>

        <div className="support-info">
          <p>หากมีข้อสงสัยหรือปัญหา โปรดติดต่อเรา</p>
          <div className="contact-methods">
            <span>📞 02-xxx-xxxx</span>
            <span>✉️ support@yourstore.com</span>
            <span>💬 Live Chat 24/7</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
