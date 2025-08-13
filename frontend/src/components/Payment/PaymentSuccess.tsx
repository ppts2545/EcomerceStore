import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import EPayService from '../../services/EPayService';
import './PaymentSuccess.css';

interface PaymentResult {
  transactionId: string;
  amount: number;
  status: string;
  reference?: string;
  paidAt?: string;
}

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const transactionId = searchParams.get('transaction_id');
        const orderId = searchParams.get('order_id');
        
        if (!transactionId) {
          setError('ไม่พบข้อมูลการชำระเงิน');
          setLoading(false);
          return;
        }

        // ตรวจสอบสถานะการชำระเงินจาก ePay
        const statusResponse = await EPayService.checkPaymentStatus(transactionId);
        
        if (statusResponse.success && statusResponse.status === 'completed') {
          setPaymentResult({
            transactionId: statusResponse.transactionId,
            amount: statusResponse.amount,
            status: statusResponse.status,
            reference: statusResponse.reference,
            paidAt: statusResponse.paidAt
          });
        } else {
          setError('การชำระเงินไม่สำเร็จ');
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setError('เกิดข้อผิดพลาดในการตรวจสอบการชำระเงิน');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleViewOrders = () => {
    navigate('/orders');
  };

  if (loading) {
    return (
      <div className="payment-result-container">
        <div className="loading-spinner"></div>
        <p>กำลังตรวจสอบการชำระเงิน...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-result-container">
        <div className="payment-error">
          <div className="error-icon">❌</div>
          <h2>เกิดข้อผิดพลาด</h2>
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={handleBackToHome} className="btn-primary">
              กลับสู่หน้าหลัก
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!paymentResult) {
    return (
      <div className="payment-result-container">
        <div className="payment-error">
          <div className="error-icon">⚠️</div>
          <h2>ไม่พบข้อมูลการชำระเงิน</h2>
          <p>กรุณาติดต่อฝ่ายบริการลูกค้าหากมีปัญหา</p>
          <div className="error-actions">
            <button onClick={handleBackToHome} className="btn-primary">
              กลับสู่หน้าหลัก
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-result-container">
      <div className="payment-success">
        <div className="success-icon">✅</div>
        <h2>การชำระเงินสำเร็จ!</h2>
        <p>ขอบคุณสำหรับการสั่งซื้อ</p>
        
        <div className="payment-details">
          <h3>รายละเอียดการชำระเงิน</h3>
          <div className="detail-row">
            <span>หมายเลขธุรกรรม:</span>
            <strong>{paymentResult.transactionId}</strong>
          </div>
          <div className="detail-row">
            <span>จำนวนเงิน:</span>
            <strong>฿{paymentResult.amount.toLocaleString()}</strong>
          </div>
          {paymentResult.reference && (
            <div className="detail-row">
              <span>หมายเลขอ้างอิง:</span>
              <strong>{paymentResult.reference}</strong>
            </div>
          )}
          {paymentResult.paidAt && (
            <div className="detail-row">
              <span>เวลาที่ชำระ:</span>
              <strong>{new Date(paymentResult.paidAt).toLocaleString('th-TH')}</strong>
            </div>
          )}
        </div>
        
        <div className="success-actions">
          <button onClick={handleViewOrders} className="btn-primary">
            ดูคำสั่งซื้อของฉัน
          </button>
          <button onClick={handleBackToHome} className="btn-secondary">
            กลับสู่หน้าหลัก
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
