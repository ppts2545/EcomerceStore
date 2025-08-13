import React from 'react';
import { Link } from 'react-router-dom';
import './PaymentResult.css';

const StripePaymentCancel: React.FC = () => {
  return (
    <div className="payment-result-container">
      <div className="payment-cancel">
        <div className="cancel-icon">⚠️</div>
        <h1>Payment Cancelled</h1>
        <p>Your payment was cancelled. No charges have been made to your account.</p>
        
        <div className="cancel-info">
          <h3>What happened?</h3>
          <ul>
            <li>You chose to cancel the payment</li>
            <li>Your cart items are still saved</li>
            <li>No money was charged from your account</li>
          </ul>
        </div>

        <div className="cancel-actions">
          <Link to="/cart" className="btn-primary">Return to Cart</Link>
          <Link to="/" className="btn-secondary">Continue Shopping</Link>
        </div>

        <div className="help-section">
          <p>Need help with checkout? <Link to="/contact">Contact our support team</Link></p>
        </div>
      </div>
    </div>
  );
};

export default StripePaymentCancel;
