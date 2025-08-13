import React from 'react';
import { PaymentFlow } from '../components/Payment';

interface OrderData {
  orderId: string;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
  totalAmount: number;
}

interface TransactionResult {
  id: string;
  reference: string;
  amount: number;
  status: string;
  updatedAt: string;
}

const CheckoutPage: React.FC = () => {
  const orderData: OrderData = {
    orderId: 'ORD12345',
    items: [
      { name: 'iPhone 15 Pro', price: 39900, quantity: 1 },
      { name: 'AirPods Pro', price: 8900, quantity: 1 }
    ],
    totalAmount: 48800
  };

  const handlePaymentComplete = (result: TransactionResult) => {
    console.log('Payment completed:', result);
    // Handle successful payment
    // You can redirect to order confirmation page or show success message
    // window.location.href = '/order-success/' + orderData.orderId;
  };

  return (
    <div className="checkout-page">
      <PaymentFlow
        initialAmount={orderData.totalAmount}
        orderData={orderData}
        onPaymentComplete={handlePaymentComplete}
      />
    </div>
  );
};

export default CheckoutPage;
