import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Cart.css';
import CartService, { type CartItem } from '../../services/CartService';
import AuthService, { type User } from '../../services/AuthService';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

const Cart: React.FC<CartProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
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
      // Set default selection state - เลือกทุกรายการที่มีสต็อก
      const itemsWithSelection = items.map(item => ({
        ...item,
        selected: item.selected !== undefined ? item.selected : item.stock > 0
      }));
      setCartItems(itemsWithSelection);
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle selection state ของสินค้า
  const handleItemSelection = async (itemId: number) => {
    const item = cartItems.find(item => item.id === itemId);
    if (!item || item.stock === 0) return; // ไม่สามารถเลือกสินค้าที่หมดสต็อกได้

    const newSelected = !item.selected;
    
    // Update local state immediately for better UX
    setCartItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, selected: newSelected }
        : item
    ));

    // Update server state
    await CartService.updateItemSelection(itemId, newSelected);
  };

  // Select/Deselect all available items
  const handleSelectAll = async () => {
    const availableItems = cartItems.filter(item => item.stock > 0);
    const allSelected = availableItems.every(item => item.selected);
    const newSelectedState = !allSelected;

    // Update local state
    setCartItems(prev => prev.map(item => ({
      ...item,
      selected: item.stock > 0 ? newSelectedState : false
    })));

    // Update server state for each item
    for (const item of availableItems) {
      await CartService.updateItemSelection(item.id, newSelectedState);
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

  const handleCheckout = () => {
    if (!user) {
      alert('กรุณาเข้าสู่ระบบก่อนทำการชำระเงิน');
      return;
    }

    const selectedItems = cartItems.filter(item => item.selected);
    if (selectedItems.length === 0) {
      alert('กรุณาเลือกสินค้าที่ต้องการชำระเงิน');
      return;
    }

    // Close cart and navigate to checkout
    onClose();
    navigate('/checkout');
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
              {/* Select All Header */}
              <div className="select-all-section">
                <label className="select-all-checkbox">
                  <input
                    type="checkbox"
                    checked={cartItems.filter(item => item.stock > 0).every(item => item.selected)}
                    onChange={handleSelectAll}
                  />
                  <span className="checkmark"></span>
                  เลือกทั้งหมด ({cartItems.filter(item => item.stock > 0 && item.selected).length}/{cartItems.filter(item => item.stock > 0).length})
                </label>
              </div>

              {/* Cart Items */}
              <div className="cart-items">
                {cartItems.map((item) => (
                  <div key={item.id} className={`cart-item ${item.stock === 0 ? 'out-of-stock' : ''} ${item.selected ? 'selected' : ''}`}>
                    {/* Selection Checkbox */}
                    <div className="item-selection">
                      <label className="item-checkbox">
                        <input
                          type="checkbox"
                          checked={item.selected || false}
                          onChange={() => handleItemSelection(item.id)}
                          disabled={item.stock === 0}
                        />
                        <span className="checkmark"></span>
                      </label>
                    </div>

                    <div className="item-image">
                      <img 
                        src={item.productImage || '/placeholder-product.jpg'} 
                        alt={item.productName}
                      />
                      {item.stock === 0 && (
                        <div className="out-of-stock-overlay">หมด</div>
                      )}
                    </div>
                    
                    <div className="item-details">
                      <h4 className="item-name">
                        {item.productName}
                        {item.stock === 0 && <span className="stock-badge">สินค้าหมด</span>}
                      </h4>
                      {item.description && (
                        <p className="item-description">{item.description}</p>
                      )}
                      <div className="item-price-info">
                        <span className="unit-price">฿{(item.price * 35).toLocaleString()} / ชิ้น</span>
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
                        <strong>รวม: ฿{(item.price * item.quantity * 35).toLocaleString()}</strong>
                        {!item.selected && item.stock > 0 && (
                          <span className="not-selected-note">ไม่รวมในการคำนวณ</span>
                        )}
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
                  <span>สินค้าทั้งหมด:</span>
                  <span>{cartItems.reduce((total, item) => total + item.quantity, 0)} ชิ้น</span>
                </div>
                <div className="summary-row">
                  <span>สินค้าที่เลือก:</span>
                  <span>{CartService.getSelectedCount(cartItems)} รายการ</span>
                </div>
                <div className="summary-row">
                  <span>จำนวนที่เลือก:</span>
                  <span>{cartItems.filter(item => item.selected && item.stock > 0).reduce((total, item) => total + item.quantity, 0)} ชิ้น</span>
                </div>
                <div className="summary-row total">
                  <span>ยอดรวม (เฉพาะที่เลือก):</span>
                  <span>฿{CartService.calculateSelectedTotal(cartItems).toLocaleString()}</span>
                </div>
                {cartItems.some(item => !item.selected && item.stock > 0) && (
                  <div className="summary-note">
                    * รวมเฉพาะสินค้าที่เลือกไว้เท่านั้น
                  </div>
                )}
              </div>

              {/* Cart Actions */}
              <div className="cart-actions">
                <button className="clear-cart-btn" onClick={clearCart}>
                  ลบทั้งหมด
                </button>
                <button 
                  className="checkout-btn" 
                  onClick={handleCheckout}
                  disabled={CartService.getSelectedCount(cartItems) === 0}
                >
                  ชำระเงิน ({CartService.getSelectedCount(cartItems)} รายการ)
                  {CartService.getSelectedCount(cartItems) > 0 && (
                    <span className="checkout-total">
                      ฿{CartService.calculateSelectedTotal(cartItems).toLocaleString()}
                    </span>
                  )}
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
