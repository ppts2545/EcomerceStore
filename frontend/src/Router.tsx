import React from 'react';
import { Routes, Route } from 'react-router-dom';
import App from './App';
import AuthSuccess from './components/Auth/AuthSuccess';
import AuthError from './components/Auth/AuthError';
import Payment from './components/Payment/Payment';
import OrderSuccess from './components/Order/OrderSuccess';
import Checkout from './components/Checkout/Checkout';
import UserProfileNew from './components/UserProfile/UserProfileNew';

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
      <Route path="/order-success/:orderNumber" element={<OrderSuccess />} />
      <Route path="/profile" element={<UserProfileNew />} />
    </Routes>
  );
};

export default Router;
