import React, { useState, useEffect } from 'react';
import StripeService, { type StripeProduct } from '../../services/StripeService';
import StripePayment from './StripePayment';
import './PaymentProcessing.css';

interface PaymentData {
  amount: number;
  method: string;
  bankAccount?: string;
  accountName?: string;
  phoneNumber?: string;
  orderData?: {
    orderId: string;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
  };
}

interface PaymentProcessingProps {
  paymentData: PaymentData;
  onPaymentComplete: (result: TransactionStatus) => void;
  onPaymentError: (error: { message: string }) => void;
}

interface TransactionStatus {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'requires_payment';
  amount: number;
  method: string;
  createdAt: string;
  updatedAt: string;
  reference?: string;
  errorMessage?: string;
  clientSecret?: string;
}

const PaymentProcessing: React.FC<PaymentProcessingProps> = ({
  paymentData,
  onPaymentComplete,
  onPaymentError
}) => {
  const [transaction, setTransaction] = useState<TransactionStatus | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes timeout

  const processingSteps = [
    { id: 1, title: 'กำลังสร้างธุรกรรม', description: 'เตรียมข้อมูลการชำระเงิน' },
    { id: 2, title: 'ส่งข้อมูลไปยังธนาคาร', description: 'ติดต่อกับระบบธนาคาร' },
    { id: 3, title: 'ยืนยันการชำระเงิน', description: 'รอการยืนยันจากธนาคาร' },
    { id: 4, title: 'เสร็จสิ้น', description: 'การชำระเงินสำเร็จ' }
  ];

  const getStatusText = (status: string): string => {
    const statusMap: Record<string, string> = {
      pending: 'รอดำเนินการ',
      processing: 'กำลังประมวลผล',
      completed: 'สำเร็จ',
      failed: 'ล้มเหลว',
      cancelled: 'ยกเลิก'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string): string => {
    const colorMap: Record<string, string> = {
      pending: '#f39c12',
      processing: '#3498db',
      completed: '#27ae60',
      failed: '#e74c3c',
      cancelled: '#95a5a6',
      requires_payment: '#9b59b6'
    };
    return colorMap[status] || '#95a5a6';
  };

  // หลัก useEffect สำหรับเริ่มต้นการชำระเงิน
  useEffect(() => {
    const initiatePayment = async () => {
      try {
        // สร้าง transaction เริ่มต้น
        const initialTransaction: TransactionStatus = {
          id: `TXN${Date.now()}`,
          status: 'processing',
          amount: paymentData.amount,
          method: paymentData.method,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          reference: `REF${Date.now()}`
        };
        setTransaction(initialTransaction);

        // เริ่มขั้นตอนการประมวลผล
        for (let i = 0; i < processingSteps.length - 1; i++) {
          setCurrentStep(i);
          await new Promise(resolve => setTimeout(resolve, 1500));
        }

        // เรียกระบบชำระเงิน Stripe
        const response = await processPayment(paymentData);
        
        if (response.success && response.clientSecret) {
          // Store client secret for Stripe checkout
          const completedTransaction: TransactionStatus = {
            ...initialTransaction,
            status: 'requires_payment',
            updatedAt: new Date().toISOString(),
            clientSecret: response.clientSecret
          };
          setTransaction(completedTransaction);
          setCurrentStep(processingSteps.length - 1);
          
          // Redirect to Stripe payment after a short delay
          setTimeout(() => {
            onPaymentComplete(completedTransaction);
          }, 1000);
        } else {
          throw new Error(response.error || 'Payment failed');
        }

      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        const failedTransaction: TransactionStatus = {
          id: `TXN${Date.now()}`,
          status: 'failed',
          amount: paymentData.amount,
          method: paymentData.method,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          errorMessage: errorMessage
        };
        setTransaction(failedTransaction);
        onPaymentError({ message: errorMessage });
      }
    };

    initiatePayment();
  }, [paymentData, onPaymentComplete, onPaymentError, processingSteps.length]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0 && transaction?.status === 'processing') {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, transaction?.status]);

  // Real Stripe Payment Processing
  const processPayment = async (data: PaymentData): Promise<{success: boolean; error?: string; clientSecret?: string}> => {
    try {
      // Convert PaymentData to StripeProduct format
      const stripeProducts: StripeProduct[] = [
        {
          id: 'product_' + Date.now(),
          name: `Payment for ${data.method}`,
          description: `Payment of ${data.amount} THB`,
          price: data.amount,
          currency: 'thb',
          quantity: 1
        }
      ];

      // Create payment intent with Stripe
      const paymentIntent = await StripeService.createPaymentIntent(stripeProducts);
      
      return {
        success: true,
        clientSecret: paymentIntent.client_secret
      };
    } catch (error) {
      console.error('Stripe payment error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'การเชื่อมต่อกับระบบชำระเงินขัดข้อง กรุณาลองใหม่อีกครั้ง'
      };
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!transaction) {
    return (
      <div className="payment-processing-container">
        <div className="loading-spinner"></div>
        <p>กำลังเตรียมข้อมูล...</p>
      </div>
    );
  }

  return (
    <div className="payment-processing-container">
      <div className="transaction-header">
        <h2>สถานะการชำระเงิน</h2>
        <div className="transaction-info">
          <div className="transaction-id">
            <span>หมายเลขธุรกรรม: </span>
            <strong>{transaction.reference}</strong>
          </div>
          <div className="transaction-amount">
            <span>จำนวนเงิน: </span>
            <strong>฿{transaction.amount.toLocaleString()}</strong>
          </div>
        </div>
      </div>

      <div className="status-indicator">
        <div 
          className={`status-badge ${transaction.status}`}
          style={{ backgroundColor: getStatusColor(transaction.status) }}
        >
          {getStatusText(transaction.status)}
        </div>
      </div>

      {transaction.status === 'processing' && (
        <>
          <div className="processing-steps">
            {processingSteps.map((step, index) => (
              <div 
                key={step.id} 
                className={`step ${index <= currentStep ? 'completed' : ''} ${index === currentStep ? 'active' : ''}`}
              >
                <div className="step-number">
                  {index < currentStep ? '✓' : step.id}
                </div>
                <div className="step-content">
                  <h4>{step.title}</h4>
                  <p>{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="timeout-info">
            <p>เวลาที่เหลือ: <strong>{formatTime(timeLeft)}</strong></p>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${((300 - timeLeft) / 300) * 100}%` }}
              ></div>
            </div>
          </div>
        </>
      )}

      {transaction.status === 'completed' && (
        <div className="success-message">
          <div className="success-icon">✅</div>
          <h3>การชำระเงินสำเร็จ!</h3>
          <p>ธุรกรรมของคุณได้รับการยืนยันแล้ว</p>
          <div className="transaction-details">
            <div className="detail-row">
              <span>วันที่:</span>
              <span>{new Date(transaction.updatedAt).toLocaleString('th-TH')}</span>
            </div>
            <div className="detail-row">
              <span>วิธีการชำระ:</span>
              <span>{getPaymentMethodName(transaction.method)}</span>
            </div>
          </div>
        </div>
      )}

      {transaction.status === 'failed' && (
        <div className="error-message">
          <div className="error-icon">❌</div>
          <h3>การชำระเงินล้มเหลว</h3>
          <p>{transaction.errorMessage || 'เกิดข้อผิดพลาดในการประมวลผล'}</p>
          <div className="error-actions">
            <button 
              className="btn-retry"
              onClick={() => window.location.reload()}
            >
              ลองใหม่อีกครั้ง
            </button>
            <button 
              className="btn-cancel"
              onClick={() => onPaymentError({ message: 'User cancelled' })}
            >
              ยกเลิก
            </button>
          </div>
        </div>
      )}

      <div className="processing-animation">
        {transaction.status === 'processing' && (
          <div className="spinner-container">
            <div className="spinner"></div>
            <p>กรุณารอสักครู่...</p>
          </div>
        )}
      </div>
    </div>
  );
};

const getPaymentMethodName = (method: string): string => {
  const methodNames: Record<string, string> = {
    bank_transfer: 'โอนเงินผ่านธนาคาร',
    promptpay: 'พร้อมเพย์',
    truemoney: 'TrueMoney',
    credit_card: 'บัตรเครดิต/เดบิต'
  };
  return methodNames[method] || method;
};

export default PaymentProcessing;
