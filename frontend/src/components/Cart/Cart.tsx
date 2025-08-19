import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Cart.css';
import CartService, { type CartItem } from '../../services/CartService';
import AuthService, { type User } from '../../services/AuthService';

/** ========= Helpers / Config ========= */
const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8082').replace(/\/$/, '');

// ตั้ง EXCHANGE_THB=35 ถ้าราคาในตะกร้าเป็น USD; ถ้าเป็นบาทอยู่แล้วให้ 1
const EXCHANGE_THB = 1;

const FALLBACK_72 =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72"><rect width="100%" height="100%" fill="%23f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-family="Arial" font-size="10">No Image</text></svg>';

const toAbsolute = (u?: string): string => {
  if (!u) return '';
  if (/^(https?:|data:|blob:)/i.test(u)) return u;
  return `${API_BASE}/${u.replace(/^\/+/, '')}`;
};

const pickItemImage = (item: any): string | undefined => {
  return (
    item.productImageUrl ?? // <-- from backend DTO
    item.productImage ??
    item.imageUrl ??
    item.imageURL ??
    item.image ??
    item.thumbnail ??
    (Array.isArray(item.mediaItems) && item.mediaItems.find((m: any) => m.type === 'image')?.url)
  );
};

const imageSrcFor = (item: any): string => {
  const raw = pickItemImage(item);
  const abs = toAbsolute(raw);
  return abs || FALLBACK_72;
};

const formatTHB = (n: number) => `฿${Math.round(n).toLocaleString()}`;

/** =================================== */

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
      // ล็อกสกอลล์หน้าหลักเมื่อเปิด sidebar
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isOpen]);

  const loadCurrentUser = async () => {
    try {
      const currentUser = await AuthService.getCurrentUser();
      setUser(currentUser);
    } catch {
      setUser(null);
    }
  };

  const loadCartItems = async () => {
    setLoading(true);
    try {
      const items = await CartService.getCartItems();
      const itemsWithSelection = items.map((item: any) => ({
        ...item,
        selected: item.selected !== undefined ? item.selected : item.stock > 0,
      }));
      setCartItems(itemsWithSelection);
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle selection
  const handleItemSelection = async (itemId: number) => {
    const target = cartItems.find((i) => i.id === itemId);
    if (!target || target.stock === 0) return;
    const nextSel = !target.selected;

    setCartItems((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, selected: nextSel } : it))
    );

    try {
      await CartService.updateItemSelection(itemId, nextSel);
    } catch (e) {
      // rollback if failed
      setCartItems((prev) =>
        prev.map((it) => (it.id === itemId ? { ...it, selected: !nextSel } : it))
      );
    }
  };

  // Select/Deselect all
  const handleSelectAll = async () => {
    const avail = cartItems.filter((i) => i.stock > 0);
    const allSelected = avail.every((i) => i.selected);
    const next = !allSelected;

    setCartItems((prev) =>
      prev.map((i) => ({ ...i, selected: i.stock > 0 ? next : false }))
    );

    try {
      await Promise.all(avail.map((i) => CartService.updateItemSelection(i.id, next)));
    } catch (e) {
      // ถ้าพลาด ไม่ rollback รายตัว (UX: ผู้ใช้จะลองใหม่)
      console.error(e);
    }
  };

  const updateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      await removeItem(itemId);
      return;
    }
    const item = cartItems.find((i) => i.id === itemId);
    if (!item) return;
    if (newQuantity > item.stock) return;

    // optimistic
    setCartItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, quantity: newQuantity } : i))
    );

    try {
      await CartService.updateQuantity(itemId, newQuantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
      // reload from server on error
      loadCartItems();
    }
  };

  const removeItem = async (itemId: number) => {
    try {
      await CartService.removeItem(itemId);
      setCartItems((prev) => prev.filter((i) => i.id !== itemId));
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
    const selectedItems = cartItems.filter((i) => i.selected && i.stock > 0);
    if (selectedItems.length === 0) {
      alert('กรุณาเลือกสินค้าที่ต้องการชำระเงิน');
      return;
    }
    onClose();
    navigate('/checkout');
  };

  if (!isOpen) return null;

  // computed
  const allAvailable = cartItems.filter((i) => i.stock > 0);
  const allSelected = allAvailable.every((i) => i.selected);
  const selectedCount = allAvailable.filter((i) => i.selected).length;
  const totalItems = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const selectedQty = cartItems
    .filter((i) => i.selected && i.stock > 0)
    .reduce((sum, i) => sum + i.quantity, 0);
  const selectedTotal = cartItems
    .filter((i) => i.selected && i.stock > 0)
    .reduce((sum, i) => sum + i.price * EXCHANGE_THB * i.quantity, 0);

  return (
    <div className="cart-overlay" onClick={onClose}>
      <aside className="cart-sidebar" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <header className="cart-header">
          <div className="cart-title">
            <h2>ตะกร้าสินค้า</h2>
            {user && <span className="cart-user">สำหรับ: {user.firstName}</span>}
          </div>
          <button className="cart-close" onClick={onClose} aria-label="ปิด">×</button>
        </header>

        {/* Content */}
        <div className="cart-content">
          {loading ? (
            <div className="cart-loading">
              <div className="loading-spinner" />
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
              {/* Select All */}
              <div className="select-all-row">
                <label className="checkbox pill">
                  <input
                    type="checkbox"
                    checked={allAvailable.length > 0 && allSelected}
                    onChange={handleSelectAll}
                  />
                  <span className="checkmark" />
                  เลือกทั้งหมด ({selectedCount}/{allAvailable.length})
                </label>
                <button className="clear-all" onClick={clearCart}>
                  ลบทั้งหมด
                </button>
              </div>

              {/* Items */}
              <div className="cart-items">
                {cartItems.map((item) => {
                  const unit = item.price * EXCHANGE_THB;
                  const rowTotal = unit * item.quantity;
                  const img = imageSrcFor(item);
                  return (
                    <div
                      key={item.id}
                      className={`cart-item ${item.stock === 0 ? 'out' : ''} ${item.selected ? 'selected' : ''}`}
                    >
                      {/* Checkbox */}
                      <label className="checkbox square">
                        <input
                          type="checkbox"
                          checked={!!item.selected}
                          onChange={() => handleItemSelection(item.id)}
                          disabled={item.stock === 0}
                        />
                        <span className="checkmark" />
                      </label>

                      {/* Image */}
                      <div className="item-image">
                        <img
                          crossOrigin="anonymous"
                          src={img}
                          alt={item.productName}
                          onError={(e) => {
                            const el = e.currentTarget as HTMLImageElement;
                            if (el.dataset.fallbackApplied) return;
                            el.dataset.fallbackApplied = '1';
                            el.src = FALLBACK_72;
                          }}
                        />
                        {item.stock === 0 && <div className="badge-out">หมด</div>}
                      </div>

                      {/* Details */}
                      <div className="item-info">
                        <div className="item-name">{item.productName}</div>

                        {item.description && (
                          <div className="item-desc">{item.description}</div>
                        )}

                        <div className="row meta">
                          <div className="unit-price">{formatTHB(unit)} / ชิ้น</div>
                          <div className="stock">คงเหลือ: {item.stock}</div>
                        </div>

                        <div className="row actions">
                          <div className="qty">
                            <button
                              className="step"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              aria-label="ลดจำนวน"
                            >
                              −
                            </button>
                            <span className="value">{item.quantity}</span>
                            <button
                              className="step"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.stock}
                              aria-label="เพิ่มจำนวน"
                            >
                              +
                            </button>
                          </div>
                          <div className="rowtotal">{formatTHB(rowTotal)}</div>
                        </div>
                      </div>

                      {/* Remove */}
                      <button
                        className="remove"
                        onClick={() => removeItem(item.id)}
                        title="ลบสินค้า"
                        aria-label="ลบสินค้า"
                      >
                        🗑️
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Sticky Footer Summary */}
        {cartItems.length > 0 && (
          <footer className="cart-footer">
            <div className="summary">
              <div className="sum-left">
                <div>ทั้งหมด: <strong>{totalItems}</strong> ชิ้น</div>
                <div>ที่เลือก: <strong>{selectedQty}</strong> ชิ้น</div>
              </div>
              <div className="sum-right">
                <div className="sum-title">ยอดรวม</div>
                <div className="sum-total">{formatTHB(selectedTotal)}</div>
              </div>
            </div>

            <button
              className="checkout"
              onClick={handleCheckout}
              disabled={selectedCount === 0}
            >
              ชำระเงิน
              {selectedCount > 0 && (
                <span className="pill">{selectedCount} รายการ</span>
              )}
            </button>
          </footer>
        )}
      </aside>
    </div>
  );
};

export default Cart;