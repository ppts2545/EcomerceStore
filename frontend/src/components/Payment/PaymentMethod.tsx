import React, { useState } from 'react';
import './PaymentMethod.css';

interface PaymentMethodProps {
  onMethodSelect: (method: string, data: any) => void;
  totalAmount: number;
  orderData: any;
}

const PaymentMethod: React.FC<PaymentMethodProps> = ({ 
  onMethodSelect, 
  totalAmount, 
  orderData 
}) => {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [bankAccount, setBankAccount] = useState('');
  const [accountName, setAccountName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const paymentMethods = [
    {
      id: 'bank_transfer',
      name: 'โอนเงินผ่านธนาคาร',
      icon: '🏦',
      description: 'โอนเงินผ่านแอปธนาคารหรือ ATM'
    },
    {
      id: 'promptpay',
      name: 'พร้อมเพย์ (PromptPay)',
      icon: '📱',
      description: 'โอนเงินผ่านพร้อมเพย์'
    },
    {
      id: 'truemoney',
      name: 'TrueMoney Wallet',
      icon: '💳',
      description: 'ชำระผ่าน TrueMoney'
    },
    {
      id: 'credit_card',
      name: 'บัตรเครดิต/เดบิต',
      icon: '💳',
      description: 'ชำระด้วยบัตรเครดิตหรือเดบิต'
    }
  ];

  const thailandBanks = [
    { code: 'SCB', name: 'ธนาคารไทยพาณิชย์', color: '#4c2c92' },
    { code: 'KBANK', name: 'ธนาคารกสิกรไทย', color: '#138f2d' },
    { code: 'BBL', name: 'ธนาคารกรุงเทพ', color: '#1e4598' },
    { code: 'KTB', name: 'ธนาคารกรุงไทย', color: '#1ba5e1' },
    { code: 'TMB', name: 'ธนาคารทหารไทย', color: '#1279be' },
    { code: 'BAY', name: 'ธนาคารกรุงศรีอยุธยา', color: '#fec43b' }
  ];

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
  };

  const handleSubmit = () => {
    if (!selectedMethod) {
      alert('กรุณาเลือกวิธีการชำระเงิน');
      return;
    }

    let paymentData = {
      method: selectedMethod,
      amount: totalAmount,
      orderData: orderData
    };

    switch (selectedMethod) {
      case 'bank_transfer':
        if (!bankAccount || !accountName) {
          alert('กรุณากรอกข้อมูลบัญชีธนาคารให้ครบถ้วน');
          return;
        }
        paymentData = {
          ...paymentData,
          bankAccount,
          accountName
        };
        break;
      case 'promptpay':
        if (!phoneNumber) {
          alert('กรุณากรอกเบอร์โทรศัพท์สำหรับพร้อมเพย์');
          return;
        }
        paymentData = {
          ...paymentData,
          phoneNumber
        };
        break;
    }

    onMethodSelect(selectedMethod, paymentData);
  };

  return (
    <div className="payment-method-container">
      <div className="payment-header">
        <h2>เลือกวิธีการชำระเงิน</h2>
        <div className="total-amount">
          <span>ยอดที่ต้องชำระ: </span>
          <strong>฿{totalAmount.toLocaleString()}</strong>
        </div>
      </div>

      <div className="payment-methods">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className={`payment-option ${selectedMethod === method.id ? 'selected' : ''}`}
            onClick={() => handleMethodSelect(method.id)}
          >
            <div className="method-icon">{method.icon}</div>
            <div className="method-info">
              <h3>{method.name}</h3>
              <p>{method.description}</p>
            </div>
            <div className="method-radio">
              <input
                type="radio"
                name="paymentMethod"
                checked={selectedMethod === method.id}
                onChange={() => {}}
              />
            </div>
          </div>
        ))}
      </div>

      {selectedMethod === 'bank_transfer' && (
        <div className="payment-details">
          <h3>ข้อมูลบัญชีธนาคาร</h3>
          <div className="bank-selection">
            <label>เลือกธนาคาร:</label>
            <select
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value)}
              required
            >
              <option value="">เลือกธนาคาร</option>
              {thailandBanks.map((bank) => (
                <option key={bank.code} value={bank.code}>
                  {bank.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>ชื่อบัญชี:</label>
            <input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="ชื่อเจ้าของบัญชี"
              required
            />
          </div>
        </div>
      )}

      {selectedMethod === 'promptpay' && (
        <div className="payment-details">
          <h3>ข้อมูลพร้อมเพย์</h3>
          <div className="form-group">
            <label>เบอร์โทรศัพท์:</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="08X-XXX-XXXX"
              pattern="[0-9]{10}"
              required
            />
          </div>
        </div>
      )}

      {selectedMethod === 'truemoney' && (
        <div className="payment-details">
          <h3>TrueMoney Wallet</h3>
          <div className="form-group">
            <label>เบอร์โทรศัพท์:</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="08X-XXX-XXXX"
              required
            />
          </div>
        </div>
      )}

      {selectedMethod === 'credit_card' && (
        <div className="payment-details">
          <h3>ข้อมูลบัตร</h3>
          <p className="info-text">
            คุณจะถูกนำไปยังหน้าที่ปลอดภัยเพื่อกรอกข้อมูลบัตร
          </p>
        </div>
      )}

      <div className="payment-actions">
        <button
          className="btn-confirm"
          onClick={handleSubmit}
          disabled={!selectedMethod}
        >
          ดำเนินการต่อ
        </button>
      </div>
    </div>
  );
};

export default PaymentMethod;
