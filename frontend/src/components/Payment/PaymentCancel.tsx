import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './PaymentCancel.css';

const PaymentCancel: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const transactionId = searchParams.get('transaction_id');
  const orderId = searchParams.get('order_id');

  const handleBackToCheckout = () => {
    navigate('/checkout');
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="payment-result-container">
      <div className="payment-cancel">
        <div className="cancel-icon">❌</div>
        <h2>การชำระเงินถูกยกเลิก</h2>
        <p>คุณได้ยกเลิกการชำระเงิน หรือเกิดข้อผิดพลาดระหว่างการประมวลผล</p>
        
        {transactionId && (
          <div className="transaction-info">
            <p><strong>หมายเลขธุรกรรม:</strong> {transactionId}</p>
          </div>
        )}
        
        {orderId && (
          <div className="order-info">
            <p><strong>หมายเลขคำสั่งซื้อ:</strong> {orderId}</p>
          </div>
        )}
        
        <div className="cancel-message">
          <h3>จะเกิดอะไรขึ้นต่อไป?</h3>
          <ul>
            <li>ไม่มีการหักเงินจากบัญชีของคุณ</li>
            <li>สินค้าในตะกร้ายังคงอยู่</li>
            <li>คุณสามารถลองชำระเงินใหม่ได้</li>
          </ul>
        </div>
        
        <div className="cancel-actions">
          <button onClick={handleBackToCheckout} className="btn-primary">
            กลับไปชำระเงิน
          </button>
          <button onClick={handleBackToHome} className="btn-secondary">
            กลับสู่หน้าหลัก
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;
