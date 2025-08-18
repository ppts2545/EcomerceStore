import React from 'react';
import { Routes, Route } from 'react-router-dom';
import App from './App';
import AuthSuccess from './components/Auth/AuthSuccess';
import AuthError from './components/Auth/AuthError';
import Payment from './components/Payment/Payment';
import StorePage from './pages/StorePage';
import CreateStorePage from './pages/CreateStorePage';
import StripePaymentSuccess from './components/Payment/StripePaymentSuccess';
import StripePaymentCancel from './components/Payment/StripePaymentCancel';
import PaymentSuccessPage from './components/Payment/PaymentSuccessPage';
import OrderSuccess from './components/Order/OrderSuccess';
import Checkout from './components/Checkout/Checkout';
import UserProfileNew from './components/UserProfile/UserProfileNew';
import StripeTestPage from './pages/StripeTestPage';
// Import new payment components
import CheckoutPage from './pages/CheckoutPage';
import PaymentHistoryPage from './pages/PaymentHistoryPage';
import PaymentDemo from './components/Demo/PaymentDemo';
import UserWalletPage from './pages/UserWalletPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import OrderHistoryPage from './pages/OrderHistoryPage';

const Router: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/admin" element={<App />} />
      <Route path="/product/:id" element={<App />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/auth/success" element={<AuthSuccess />} />
      <Route path="/auth/error" element={<AuthError />} />
      <Route path="/payment" element={<Payment />} />
      <Route path="/payment/success" element={<StripePaymentSuccess />} />
      <Route path="/payment/cancel" element={<StripePaymentCancel />} />
      <Route path="/payment-success" element={<PaymentSuccessPage />} />
      <Route path="/order-success/:orderNumber" element={<OrderSuccess />} />
      <Route path="/profile" element={<UserProfileNew />} />
  <Route path="/store/:storeId" element={<StorePage />} />
  <Route path="/create-store" element={<CreateStorePage />} />
      {/* New payment system routes */}
      <Route path="/payment-flow" element={<CheckoutPage />} />
      <Route path="/payment-history" element={<PaymentHistoryPage />} />
      <Route path="/wallet" element={<UserWalletPage />} />
  <Route path="/admin-finance" element={<AdminDashboardPage />} />
  <Route path="/stripe-test" element={<StripeTestPage />} />
  <Route path="/payment-demo" element={<PaymentDemo />} />
  <Route path="/orders/history" element={<OrderHistoryPage />} />
    </Routes>
  );
};

export default Router;
