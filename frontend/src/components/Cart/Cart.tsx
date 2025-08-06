import React, { useState, useEffect } from 'react';
import './Cart.css';
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

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

const Cart: React.FC<CartProps> = ({ isOpen, onClose }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadCartItems();
      loadCurrentUser();
    }
  }, [isOpen]);

  const loadCurrentUser = async () => {
    const currentUser = await AuthService.getCurrentUser();
    setUser(currentUser);
  };

  const loadCartItems = async () => {
    setLoading(true);
    try {
      const items = await CartService.getCartItems();
      setCartItems(items);
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      await removeItem(itemId);
      return;
    }

    try {
      await CartService.updateQuantity(itemId, newQuantity);
      setCartItems(items =>
        items.map(item =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const removeItem = async (itemId: number) => {
    try {
      await CartService.removeItem(itemId);
      setCartItems(items => items.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const clearCart = async () => {
    if (confirm('คุณต้องการลบสินค้าทั้งหมดในตะกร้าหรือไม่?')) {
      try {
        await CartService.clearCart();
        setCartItems([]);
      } catch (error) {
        console.error('Error clearing cart:', error);
      }
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  if (!isOpen) return null;

  return (
    <div className="cart-overlay" onClick={onClose}>
      <div className="cart-sidebar" onClick={(e) => e.stopPropagation()}>
        {/* Cart Header */}
        <div className="cart-header">
          <div className="cart-title">
            <h2>🛒 ตะกร้าสินค้า</h2>
            {user && (
              <span className="cart-user">สำหรับ: {user.firstName}</span>
            )}
          </div>
          <button className="cart-close" onClick={onClose}>×</button>
        </div>

        {/* Cart Content */}
        <div className="cart-content">
          {loading ? (
            <div className="cart-loading">
              <div className="loading-spinner">⏳</div>
              <p>กำลังโหลดตะกร้าสินค้า...</p>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="cart-empty">
              <div className="empty-icon">🛒</div>
              <h3>ตะกร้าสินค้าว่างเปล่า</h3>
              <p>เริ่มช้อปปิ้งเพื่อเพิ่มสินค้าลงในตะกร้า</p>
              <button className="continue-shopping" onClick={onClose}>
                เริ่มช้อปปิ้ง
              </button>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="cart-items">
                {cartItems.map((item) => (
                  <div key={item.id} className="cart-item">
                    <div className="item-image">
                      <img 
                        src={item.productImage || '/placeholder-product.jpg'} 
                        alt={item.productName}
                      />
                    </div>
                    
                    <div className="item-details">
                      <h4 className="item-name">{item.productName}</h4>
                      {item.description && (
                        <p className="item-description">{item.description}</p>
                      )}
                      <div className="item-price-info">
                        <span className="unit-price">฿{item.price.toLocaleString()} / ชิ้น</span>
                        <span className="stock-info">คงเหลือ: {item.stock} ชิ้น</span>
                      </div>
                      
                      <div className="quantity-controls">
                        <button 
                          className="qty-btn minus"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          −
                        </button>
                        <span className="quantity">{item.quantity}</span>
                        <button 
                          className="qty-btn plus"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                        >
                          +
                        </button>
                      </div>
                      
                      <div className="item-total">
                        <strong>รวม: ฿{(item.price * item.quantity).toLocaleString()}</strong>
                      </div>
                    </div>
                    
                    <button 
                      className="remove-btn"
                      onClick={() => removeItem(item.id)}
                      title="ลบสินค้า"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>

              {/* Cart Summary */}
              <div className="cart-summary">
                <div className="summary-row">
                  <span>จำนวนสินค้า:</span>
                  <span>{getTotalItems()} ชิ้น</span>
                </div>
                <div className="summary-row total">
                  <span>ยอดรวม:</span>
                  <span>฿{getTotalPrice().toLocaleString()}</span>
                </div>
              </div>

              {/* Cart Actions */}
              <div className="cart-actions">
                <button className="clear-cart-btn" onClick={clearCart}>
                  ลบทั้งหมด
                </button>
                <button className="checkout-btn">
                  ชำระเงิน
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;
