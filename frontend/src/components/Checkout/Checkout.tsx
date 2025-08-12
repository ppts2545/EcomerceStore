import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Checkout.css';

interface CartItem {
  id: number;
  productId: number;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  subtotal: number;
}

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    shippingAddress: '',
    phoneNumber: ''
  });

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      const response = await fetch('http://localhost:8082/api/cart', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const items = await response.json();
        setCartItems(items);
      }
    } catch (error) {
      console.error('Error fetching cart items:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.shippingAddress.trim()) {
      alert('กรุณากรอกที่อยู่จัดส่ง');
      return;
    }
    
    if (!formData.phoneNumber.trim()) {
      alert('กรุณากรอกเบอร์โทรศัพท์');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('http://localhost:8082/api/orders/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const result = await response.json();
        navigate(`/order-success/${result.orderNumber}`);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'เกิดข้อผิดพลาดในการสั่งซื้อ');
      }
    } catch (error) {
      console.error('Error during checkout:', error);
      alert('เกิดข้อผิดพลาดในการสั่งซื้อ');
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('th-TH').format(price);
  };

  if (loading) {
    return (
      <div className="checkout-loading">
        <div className="loading-spinner"></div>
        <p>กำลังโหลด...</p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="checkout-empty">
        <h2>ตะกร้าสินค้าว่าง</h2>
        <p>กรุณาเพิ่มสินค้าในตะกร้าก่อนทำการสั่งซื้อ</p>
        <button onClick={() => navigate('/')} className="back-shopping-btn">
          เลือกซื้อสินค้า
        </button>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <h1>ขั้นตอนการสั่งซื้อ</h1>
        <div className="breadcrumb">
          <span>ตะกร้าสินค้า</span>
          <span className="separator">→</span>
          <span className="active">ชำระเงิน</span>
          <span className="separator">→</span>
          <span>เสร็จสิ้น</span>
        </div>
      </div>

      <div className="checkout-content">
        <div className="checkout-form">
          <div className="form-section">
            <h2>ข้อมูลการจัดส่ง</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="shippingAddress">ที่อยู่จัดส่ง *</label>
                <textarea
                  id="shippingAddress"
                  name="shippingAddress"
                  value={formData.shippingAddress}
                  onChange={handleInputChange}
                  placeholder="กรอกที่อยู่สำหรับจัดส่งสินค้า"
                  rows={4}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="phoneNumber">เบอร์โทรศัพท์ *</label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="08x-xxx-xxxx"
                  required
                />
              </div>

              <div className="payment-method">
                <h3>วิธีการชำระเงิน</h3>
                <div className="payment-option selected">
                  <input type="radio" id="cod" name="payment" value="cod" checked readOnly />
                  <label htmlFor="cod">
                    <span className="payment-icon">💰</span>
                    ชำระเงินปลายทาง (COD)
                  </label>
                </div>
              </div>
            </form>
          </div>
        </div>

        <div className="order-summary">
          <div className="summary-card">
            <h2>สรุปคำสั่งซื้อ</h2>
            
            <div className="order-items">
              {cartItems.map((item) => (
                <div key={item.id} className="summary-item">
                  <div className="item-image">
                    <img src={item.productImage || '/api/placeholder/60/60'} alt={item.productName} />
                  </div>
                  <div className="item-details">
                    <h4>{item.productName}</h4>
                    <div className="item-price-info">
                      <span className="quantity">จำนวน: {item.quantity}</span>
                      <span className="price">฿{formatPrice(item.subtotal)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="summary-totals">
              <div className="total-row subtotal">
                <span>ยอดรวมสินค้า:</span>
                <span>฿{formatPrice(totalAmount)}</span>
              </div>
              <div className="total-row shipping">
                <span>ค่าจัดส่ง:</span>
                <span>ฟรี</span>
              </div>
              <div className="total-row grand-total">
                <span>ยอดรวมทั้งหมด:</span>
                <span>฿{formatPrice(totalAmount)}</span>
              </div>
            </div>

            <button 
              type="submit"
              onClick={handleSubmit}
              disabled={submitting}
              className="confirm-order-btn"
            >
              {submitting ? 'กำลังดำเนินการ...' : 'ยืนยันการสั่งซื้อ'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
