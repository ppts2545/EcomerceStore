import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Payment.css';
import CartService from '../../services/CartService';
import AuthService, { type User } from '../../services/AuthService';

interface CartItem {
  id: number;
  productId: number;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  stock: number;
  description?: string;
  totalPrice?: number;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description?: string;
}

interface ShippingMethod {
  id: string;
  name: string;
  price: number;
  estimatedDays: string;
}

const Payment: React.FC = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('credit-card');
  const [selectedShipping, setSelectedShipping] = useState('standard');
  const [isProcessing, setIsProcessing] = useState(false);

  // Shipping Information
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    notes: ''
  });

  // Payment Methods
  const paymentMethods: PaymentMethod[] = [
    {
      id: 'credit-card',
      name: 'บัตรเครดิต/เดบิต',
      icon: '💳',
      description: 'Visa, MasterCard, JCB'
    },
    {
      id: 'mobile-banking',
      name: 'Mobile Banking',
      icon: '📱',
      description: 'ธนาคารทุกธนาคาร'
    },
    {
      id: 'promptpay',
      name: 'พร้อมเพย์',
      icon: '🏦',
      description: 'QR Code ชำระเงิน'
    },
    {
      id: 'wallet',
      name: 'TrueMoney Wallet',
      icon: '👛',
      description: 'กระเป๋าเงินอิเล็กทรอนิกส์'
    },
    {
      id: 'cod',
      name: 'เก็บเงินปลายทาง',
      icon: '🚚',
      description: 'ชำระเมื่อได้รับสินค้า'
    }
  ];

  // Shipping Methods
  const shippingMethods: ShippingMethod[] = [
    {
      id: 'standard',
      name: 'จัดส่งธรรมดา',
      price: 50,
      estimatedDays: '3-5 วัน'
    },
    {
      id: 'express',
      name: 'จัดส่งด่วน',
      price: 100,
      estimatedDays: '1-2 วัน'
    },
    {
      id: 'same-day',
      name: 'จัดส่งในวันเดียว',
      price: 200,
      estimatedDays: 'วันเดียวกัน'
    }
  ];

  useEffect(() => {
    loadPaymentData();
  }, []);

  const loadPaymentData = async () => {
    try {
      const [currentUser, items] = await Promise.all([
        AuthService.getCurrentUser(),
        CartService.getCartItems()
      ]);

      setUser(currentUser);
      setCartItems(items);

      // Pre-fill user info if available
      if (currentUser) {
        setShippingInfo(prev => ({
          ...prev,
          fullName: `${currentUser.firstName} ${currentUser.lastName}`.trim(),
        }));
      }
    } catch (error) {
      console.error('Error loading payment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getTotalItems = () => cartItems.reduce((sum, item) => sum + item.quantity, 0);
  
  const getSubtotal = () => cartItems.reduce((sum, item) => sum + (item.price * item.quantity * 35), 0);
  
  const getShippingCost = () => {
    const method = shippingMethods.find(m => m.id === selectedShipping);
    return method ? method.price : 0;
  };
  
  const getTotalPrice = () => getSubtotal() + getShippingCost();

  const validateForm = () => {
    const required = ['fullName', 'phone', 'address', 'city', 'postalCode'];
    return required.every(field => shippingInfo[field as keyof typeof shippingInfo].trim() !== '');
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      alert('กรุณากรอกข้อมูลการจัดส่งให้ครบถ้วน');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Clear cart after successful payment
      await CartService.clearCart();
      
      // Show success message and redirect
      alert('🎉 ชำระเงินสำเร็จ! คำสั่งซื้อของคุณได้รับการยืนยันแล้ว');
      navigate('/order-success', { replace: true });
    } catch (error) {
      console.error('Payment error:', error);
      alert('❌ เกิดข้อผิดพลาดในการชำระเงิน กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user) {
    return (
      <div className="payment-container">
        <div className="payment-content">
          <div className="payment-error">
            <h2>❌ กรุณาเข้าสู่ระบบ</h2>
            <p>คุณต้องเข้าสู่ระบบก่อนทำการชำระเงิน</p>
            <button className="btn btn-primary" onClick={() => navigate('/')}>
              กลับหน้าหลัก
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="payment-container">
        <div className="payment-loading">
          <div className="spinner"></div>
          <p>กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="payment-container">
        <div className="payment-content">
          <div className="payment-error">
            <h2>🛒 ตะกร้าสินค้าว่าง</h2>
            <p>ไม่มีสินค้าในตะกร้าของคุณ</p>
            <button className="btn btn-primary" onClick={() => navigate('/')}>
              เลือกสินค้า
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-container">
      <div className="payment-header">
        <button className="back-button" onClick={() => navigate('/')}>
          ← กลับ
        </button>
        <h1>ชำระเงิน</h1>
      </div>

      <div className="payment-content">
        <div className="payment-left">
          {/* Shipping Information */}
          <div className="payment-section">
            <h3>📍 ข้อมูลการจัดส่ง</h3>
            <div className="shipping-form">
              <div className="form-row">
                <div className="form-group">
                  <label>ชื่อ-นามสกุล *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={shippingInfo.fullName}
                    onChange={handleInputChange}
                    placeholder="ชื่อ-นามสกุล"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>เบอร์โทรศัพท์ *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={shippingInfo.phone}
                    onChange={handleInputChange}
                    placeholder="0xx-xxx-xxxx"
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>ที่อยู่ *</label>
                <input
                  type="text"
                  name="address"
                  value={shippingInfo.address}
                  onChange={handleInputChange}
                  placeholder="บ้านเลขที่ ซอย ถนน แขวง/ตำบล"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>เขต/อำเภอ/จังหวัด *</label>
                  <input
                    type="text"
                    name="city"
                    value={shippingInfo.city}
                    onChange={handleInputChange}
                    placeholder="เช่น เขตบางรัก กรุงเทพมหานคร"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>รหัสไปรษณีย์ *</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={shippingInfo.postalCode}
                    onChange={handleInputChange}
                    placeholder="xxxxx"
                    maxLength={5}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>หมายเหตุ (ถ้ามี)</label>
                <textarea
                  name="notes"
                  value={shippingInfo.notes}
                  onChange={handleInputChange}
                  placeholder="คำแนะนำสำหรับการจัดส่ง..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Shipping Methods */}
          <div className="payment-section">
            <h3>🚚 วิธีการจัดส่ง</h3>
            <div className="shipping-methods">
              {shippingMethods.map(method => (
                <label key={method.id} className="shipping-method">
                  <input
                    type="radio"
                    name="shipping"
                    value={method.id}
                    checked={selectedShipping === method.id}
                    onChange={(e) => setSelectedShipping(e.target.value)}
                  />
                  <div className="method-info">
                    <div className="method-name">{method.name}</div>
                    <div className="method-details">
                      {method.estimatedDays} • ฿{method.price}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="payment-section">
            <h3>💳 วิธีการชำระเงิน</h3>
            <div className="payment-methods">
              {paymentMethods.map(method => (
                <label key={method.id} className="payment-method">
                  <input
                    type="radio"
                    name="payment"
                    value={method.id}
                    checked={selectedPaymentMethod === method.id}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  />
                  <div className="method-icon">{method.icon}</div>
                  <div className="method-info">
                    <div className="method-name">{method.name}</div>
                    {method.description && (
                      <div className="method-description">{method.description}</div>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="payment-right">
          <div className="order-summary">
            <h3>📋 สรุปคำสั่งซื้อ</h3>
            
            {/* Items */}
            <div className="order-items">
              {cartItems.map(item => (
                <div key={item.id} className="order-item">
                  <img src={item.productImage} alt={item.productName} />
                  <div className="item-details">
                    <div className="item-name">{item.productName}</div>
                    <div className="item-quantity">x{item.quantity}</div>
                  </div>
                  <div className="item-price">
                    ฿{(item.price * item.quantity * 35).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="order-totals">
              <div className="total-row">
                <span>ยอดรวมสินค้า ({getTotalItems()} ชิ้น)</span>
                <span>฿{getSubtotal().toLocaleString()}</span>
              </div>
              <div className="total-row">
                <span>ค่าจัดส่ง</span>
                <span>฿{getShippingCost()}</span>
              </div>
              <div className="total-row total">
                <span>ยอดรวมทั้งหมด</span>
                <span>฿{getTotalPrice().toLocaleString()}</span>
              </div>
            </div>

            {/* Place Order Button */}
            <button 
              className="place-order-btn"
              onClick={handlePlaceOrder}
              disabled={isProcessing || !validateForm()}
            >
              {isProcessing ? (
                <>
                  <div className="spinner-small"></div>
                  กำลังประมวลผล...
                </>
              ) : (
                `สั่งซื้อสินค้า ฿${getTotalPrice().toLocaleString()}`
              )}
            </button>

            {/* Security Notice */}
            <div className="security-notice">
              <div className="security-icon">🔒</div>
              <div>
                <div className="security-title">ชำระเงินอย่างปลอดภัย</div>
                <div className="security-text">
                  ข้อมูลของคุณได้รับการเข้ารหัสแบบ SSL
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
