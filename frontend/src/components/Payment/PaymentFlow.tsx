import React, { useState, useEffect } from 'react';
import PaymentMethod from './PaymentMethod';
import PaymentProcessing from './PaymentProcessing';
import TransactionHistory from './TransactionHistory';
import StripePayment from './StripePayment';
import StripeService, { type StripeProduct } from '../../services/StripeService';
import './PaymentFlow.css';

interface PaymentFlowProps {
  initialAmount?: number;
  orderData?: any;
  onPaymentComplete?: (result: any) => void;
}

type PaymentStep = 'method' | 'processing' | 'history' | 'completed';

interface Transaction {
  id: string;
  reference: string;
  amount: number;
  status: string;
  method: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  orderId?: string;
  refundAmount?: number;
  errorMessage?: string;
}

const PaymentFlow: React.FC<PaymentFlowProps> = ({
  initialAmount = 0,
  orderData = {},
  onPaymentComplete
}) => {
  const [currentStep, setCurrentStep] = useState<PaymentStep>('method');
  const [paymentData, setPaymentData] = useState<any>(null);
  const [completedTransaction, setCompletedTransaction] = useState<any>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const handleMethodSelect = (method: string, data: any) => {
    setPaymentData(data);
    setCurrentStep('processing');
  };

  const handlePaymentComplete = (result: any) => {
    setCompletedTransaction(result);
    setCurrentStep('completed');
    onPaymentComplete?.(result);
  };

  const handlePaymentError = (error: any) => {
    console.error('Payment error:', error);
    // You can add error handling here
    // For now, just go back to method selection
    setTimeout(() => {
      setCurrentStep('method');
    }, 3000);
  };

  const handleViewHistory = () => {
    setCurrentStep('history');
  };

  const handleBackToPayment = () => {
    setCurrentStep('method');
    setSelectedTransaction(null);
  };

  const handleTransactionSelect = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'method':
        return (
          <PaymentMethod
            onMethodSelect={handleMethodSelect}
            totalAmount={initialAmount}
            orderData={orderData}
          />
        );

      case 'processing':
        return (
          <PaymentProcessing
            paymentData={paymentData}
            onPaymentComplete={handlePaymentComplete}
            onPaymentError={handlePaymentError}
          />
        );

      case 'history':
        return (
          <TransactionHistory
            onTransactionSelect={handleTransactionSelect}
          />
        );

      case 'completed':
        return (
          <div className="payment-completed">
            <div className="success-animation">
              <div className="checkmark">
                <svg viewBox="0 0 24 24" className="checkmark-icon">
                  <path fill="none" stroke="currentColor" strokeWidth="2" d="M9 12l2 2 4-4"/>
                  <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
            </div>
            
            <h2>การชำระเงินสำเร็จ!</h2>
            <p>ธุรกรรมของคุณได้รับการยืนยันแล้ว</p>
            
            {completedTransaction && (
              <div className="transaction-summary">
                <div className="summary-row">
                  <span>หมายเลขอ้างอิง:</span>
                  <strong>{completedTransaction.reference}</strong>
                </div>
                <div className="summary-row">
                  <span>จำนวนเงิน:</span>
                  <strong className="amount">฿{completedTransaction.amount?.toLocaleString()}</strong>
                </div>
                <div className="summary-row">
                  <span>วันที่:</span>
                  <span>{new Date(completedTransaction.updatedAt).toLocaleString('th-TH')}</span>
                </div>
              </div>
            )}
            
            <div className="completion-actions">
              <button 
                className="btn-primary"
                onClick={() => window.location.href = '/orders'}
              >
                ดูคำสั่งซื้อ
              </button>
              <button 
                className="btn-secondary"
                onClick={handleViewHistory}
              >
                ดูประวัติการชำระเงิน
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="payment-flow-container">
      {/* Navigation Header */}
      <div className="payment-nav">
        <div className="nav-steps">
          <div className={`nav-step ${currentStep === 'method' ? 'active' : ''} ${['processing', 'completed'].includes(currentStep) ? 'completed' : ''}`}>
            <div className="step-number">1</div>
            <span>เลือกวิธีชำระ</span>
          </div>
          <div className="step-connector"></div>
          <div className={`nav-step ${currentStep === 'processing' ? 'active' : ''} ${currentStep === 'completed' ? 'completed' : ''}`}>
            <div className="step-number">2</div>
            <span>ประมวลผล</span>
          </div>
          <div className="step-connector"></div>
          <div className={`nav-step ${currentStep === 'completed' ? 'active completed' : ''}`}>
            <div className="step-number">3</div>
            <span>เสร็จสิ้น</span>
          </div>
        </div>

        {currentStep !== 'history' && (
          <button 
            className="btn-history"
            onClick={handleViewHistory}
          >
            📋 ดูประวัติการชำระเงิน
          </button>
        )}

        {currentStep === 'history' && (
          <button 
            className="btn-back"
            onClick={handleBackToPayment}
          >
            ← กลับไปชำระเงิน
          </button>
        )}
      </div>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <div className="transaction-modal-overlay" onClick={() => setSelectedTransaction(null)}>
          <div className="transaction-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>รายละเอียดธุรกรรม</h3>
              <button 
                className="btn-close"
                onClick={() => setSelectedTransaction(null)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-content">
              <div className="detail-grid">
                <div className="detail-item">
                  <label>หมายเลขอ้างอิง:</label>
                  <span className="reference-code">{selectedTransaction.reference}</span>
                </div>
                <div className="detail-item">
                  <label>จำนวนเงิน:</label>
                  <span className="amount">฿{selectedTransaction.amount.toLocaleString()}</span>
                </div>
                <div className="detail-item">
                  <label>สถานะ:</label>
                  <span className="status-badge" style={{
                    backgroundColor: getTransactionStatusColor(selectedTransaction.status)
                  }}>
                    {getTransactionStatusText(selectedTransaction.status)}
                  </span>
                </div>
                <div className="detail-item">
                  <label>วิธีการชำระ:</label>
                  <span>{getPaymentMethodName(selectedTransaction.method)}</span>
                </div>
                <div className="detail-item full-width">
                  <label>รายละเอียด:</label>
                  <span>{selectedTransaction.description}</span>
                </div>
                <div className="detail-item">
                  <label>วันที่สร้าง:</label>
                  <span>{new Date(selectedTransaction.createdAt).toLocaleString('th-TH')}</span>
                </div>
                <div className="detail-item">
                  <label>อัปเดตล่าสุด:</label>
                  <span>{new Date(selectedTransaction.updatedAt).toLocaleString('th-TH')}</span>
                </div>
                {selectedTransaction.orderId && (
                  <div className="detail-item">
                    <label>หมายเลขคำสั่งซื้อ:</label>
                    <span>{selectedTransaction.orderId}</span>
                  </div>
                )}
                {selectedTransaction.errorMessage && (
                  <div className="detail-item full-width error">
                    <label>ข้อผิดพลาด:</label>
                    <span>{selectedTransaction.errorMessage}</span>
                  </div>
                )}
                {selectedTransaction.refundAmount && (
                  <div className="detail-item">
                    <label>จำนวนเงินคืน:</label>
                    <span className="refund-amount">฿{selectedTransaction.refundAmount.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="payment-content">
        {renderCurrentStep()}
      </div>
    </div>
  );
};

// Helper functions
const getTransactionStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending: 'รอดำเนินการ',
    processing: 'กำลังประมวลผล',
    completed: 'สำเร็จ',
    failed: 'ล้มเหลว',
    cancelled: 'ยกเลิก',
    refunded: 'คืนเงิน'
  };
  return statusMap[status] || status;
};

const getTransactionStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    pending: '#f39c12',
    processing: '#3498db',
    completed: '#27ae60',
    failed: '#e74c3c',
    cancelled: '#95a5a6',
    refunded: '#9b59b6'
  };
  return colorMap[status] || '#95a5a6';
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

export default PaymentFlow;
