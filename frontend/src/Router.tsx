import React from 'react';
import { Routes, Route } from 'react-router-dom';
import App from './App';
import AuthSuccess from './components/Auth/AuthSuccess';
import AuthError from './components/Auth/AuthError';

const Router: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/admin" element={<App />} />
      <Route path="/product/:id" element={<App />} />
      <Route path="/auth/success" element={<AuthSuccess />} />
      <Route path="/auth/error" element={<AuthError />} />
    </Routes>
  );
};

export default Router;
