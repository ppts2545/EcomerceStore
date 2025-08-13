import React from 'react';
import { TransactionHistory } from '../components/Payment';

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

const PaymentHistoryPage: React.FC = () => {
  const handleTransactionSelect = (transaction: Transaction) => {
    console.log('Selected transaction:', transaction);
    // You can show transaction details in a modal or navigate to detail page
  };

  return (
    <div className="payment-history-page">
      <div className="page-header">
        <h1>ประวัติการชำระเงิน</h1>
        <p>ดูรายการธุรกรรมการเงินทั้งหมดของคุณ</p>
      </div>
      
      <TransactionHistory
        onTransactionSelect={handleTransactionSelect}
      />
    </div>
  );
};

export default PaymentHistoryPage;
