import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StripeCheckoutButton from '../Payment/StripeCheckoutButton';
import BeautifulPayment from '../Payment/BeautifulPayment';
import AuthService from '../../services/AuthService';
import './NewCheckout.css';

// Use the same CartItem interface from CartService
export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  stock: number;
  description?: string;
  totalPrice?: number;
  selected?: boolean;
}

const NewCheckout: React.FC = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'stripe-checkout' | 'custom-ui'>('stripe-checkout');
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: ''
  });

  useEffect(() => {
    loadCheckoutData();

    // Listen for cart updates
    const handleCartUpdate = () => {
      loadCheckoutData();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  const loadCheckoutData = async () => {
    try {
      // Load user data
      const currentUser = await AuthService.getCurrentUser();

      if (currentUser && currentUser.email) {
        setCustomerInfo(prev => ({
          ...prev,
          name: currentUser.email,
          email: currentUser.email
        }));
      }

      // Load cart data from API
      const cartResponse = await fetch('http://localhost:8082/api/session-cart', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (cartResponse.ok) {
        const cartData = await cartResponse.json();
        if (cartData.success && cartData.data) {
          setCartItems(cartData.data);
        } else {
          setCartItems([]);
        }
      } else {
        console.error('Failed to load cart data:', cartResponse.status);
        // Fallback mock data
        setCartItems([
          {
            id: 1,
            productId: 1,
            productName: 'iPhone 15 Pro',
            productImage: '/api/placeholder/300/300',
            price: 39900,
            quantity: 1,
            stock: 10,
            description: 'สมาร์ทโฟนรุ่นล่าสุด'
          },
          {
            id: 2,
            productId: 2,
            productName: 'MacBook Air M3',
            productImage: '/api/placeholder/300/300',
            price: 42900,
            quantity: 1,
            stock: 5,
            description: 'แล็ปท็อปสำหรับการทำงาน'
          }
        ]);
      }
    } catch (error) {
      console.error('Error loading checkout data:', error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 100; // Fixed shipping cost
  const tax = Math.round(total * 0.07); // 7% VAT
  const finalTotal = total + shipping + tax;

  const handlePaymentSuccess = () => {
    navigate('/payment-success');
  };

  const handlePaymentError = (error: string) => {
    alert(`เกิดข้อผิดพลาด: ${error}`);
  };

  const handleQuantityChange = async (itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      await handleRemoveItem(itemId);
      return;
    }

    try {
      const item = cartItems.find(item => item.id === itemId);
      if (!item) return;

      const response = await fetch('http://localhost:8082/api/session-cart/update', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId: item.productId,
          quantity: newQuantity
        })
      });

      if (response.ok) {
        setCartItems(prev =>
          prev.map(itm =>
            itm.id === itemId ? { ...itm, quantity: newQuantity } : itm
          )
        );
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    try {
      const item = cartItems.find(item => item.id === itemId);
      if (!item) return;

      const response = await fetch(`http://localhost:8082/api/session-cart/remove/${item.productId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setCartItems(prev => prev.filter(itm => itm.id !== itemId));
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      }
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  if (loading) {
    return (
      <div className="checkout-loading">
        <div className="loading-spinner-large"></div>
        <p>กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="empty-checkout">
        <div className="empty-icon">🛒</div>
        <h2>ตะกร้าของคุณว่างเปล่า</h2>
        <p>ยังไม่มีสินค้าในตะกร้า กลับไปเลือกสินค้าก่อน</p>
        <button onClick={() => navigate('/')} className="shop-now-button">
          เลือกซื้อสินค้า
        </button>
      </div>
    );
  }

  return (
    <div className="new-checkout-container">
      <div className="checkout-header">
        <button onClick={() => navigate(-1)} className="back-button">
          ← กลับ
        </button>
        <h1>💳 ชำระเงิน</h1>
        <div className="checkout-steps">
          <span className="step active">1. ตรวจสอบสินค้า</span>
          <span className="step active">2. ชำระเงิน</span>
          <span className="step">3. เสร็จสิ้น</span>
        </div>
      </div>

      <div className="checkout-content">
        <div className="checkout-left">
          <div className="order-summary-card">
            <h3>📦 สรุปคำสั่งซื้อ</h3>
            <div className="items-list">
              {cartItems.map((item, index) => (
                <div key={index} className="checkout-item">
                  <img
                    src={item.productImage || '/placeholder-product.jpg'}
                    alt={item.productName}
                    className="item-image"
                  />
                  <div className="item-details">
                    <h4>{item.productName}</h4>
                    <div className="item-quantity-controls">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="qty-btn"
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span className="quantity-display">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="qty-btn"
                        disabled={item.quantity >= item.stock}
                      >
                        +
                      </button>
                    </div>
                    <p className="item-price">฿{item.price.toLocaleString()}</p>
                  </div>
                  <div className="item-actions">
                    <div className="item-total">
                      ฿{(item.price * item.quantity).toLocaleString()}
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="remove-btn"
                      title="ลบสินค้า"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="order-calculation">
              <div className="calc-row">
                <span>ราคาสินค้า</span>
                <span>฿{total.toLocaleString()}</span>
              </div>
              <div className="calc-row">
                <span>ค่าจัดส่ง</span>
                <span>฿{shipping.toLocaleString()}</span>
              </div>
              <div className="calc-row">
                <span>ภาษีมูลค่าเพิ่ม (7%)</span>
                <span>฿{tax.toLocaleString()}</span>
              </div>
              <div className="calc-row total">
                <span>รวมทั้งหมด</span>
                <span>฿{finalTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="customer-info-card">
            <h3>📋 ข้อมูลลูกค้า</h3>
            <div className="customer-form">
              <div className="form-row">
                <input
                  type="text"
                  placeholder="ชื่อ-นามสกุล"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                  className="form-input"
                />
                <input
                  type="email"
                  placeholder="อีเมล"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                  className="form-input"
                />
              </div>
              <div className="form-row">
                <input
                  type="tel"
                  placeholder="เบอร์โทรศัพท์"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                  className="form-input"
                />
                <input
                  type="text"
                  placeholder="รหัสไปรษณีย์"
                  value={customerInfo.postalCode}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, postalCode: e.target.value }))}
                  className="form-input"
                />
              </div>
              <textarea
                placeholder="ที่อยู่จัดส่ง"
                value={customerInfo.address}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                className="form-textarea"
                rows={3}
              />
            </div>
          </div>
        </div>

        <div className="checkout-right">
          <div className="payment-method-selector">
            <h3>💳 เลือกวิธีการชำระเงิน</h3>
            <div className="method-options">
              <button
                type="button"
                className={`method-option ${paymentMethod === 'stripe-checkout' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('stripe-checkout')}
              >
                <div className="method-icon">🛒</div>
                <div className="method-info">
                  <h4>Stripe Checkout</h4>
                  <p>หน้าชำระเงินสำเร็จรูป</p>
                </div>
              </button>
              <button
                type="button"
                className={`method-option ${paymentMethod === 'custom-ui' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('custom-ui')}
              >
                <div className="method-icon">💎</div>
                <div className="method-info">
                  <h4>Custom UI</h4>
                  <p>หน้าชำระเงินแบบกำหนดเอง</p>
                </div>
              </button>
            </div>
          </div>

          <div className="payment-component">
            {paymentMethod === 'stripe-checkout' ? (
              <StripeCheckoutButton
                cartItems={cartItems.map(item => ({
                  productId: item.productId,
                  productName: item.productName,
                  price: item.price,
                  quantity: item.quantity,
                  description: item.description
                }))}
                total={finalTotal}
                customerInfo={{
                  email: customerInfo.email,
                  name: customerInfo.name
                }}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            ) : (
              <BeautifulPayment
                cartItems={cartItems.map(item => ({
                  productId: item.productId,
                  productName: item.productName,
                  price: item.price,
                  quantity: item.quantity,
                  description: item.description
                }))}
                total={finalTotal}
                customerInfo={customerInfo}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewCheckout;