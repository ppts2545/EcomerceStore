import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

import { getMyStores } from '../../services/StoreService';
import type { Store } from '../../services/StoreService';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
}

interface HeaderProps {
  cartCount: number;
  onSearch: (query: string) => void;
  onAddProduct: () => void;
  isAdmin: boolean;
  user: User | null;
  onLoginClick: () => void;
  onLogout: () => void;
  onCartClick: () => void;
}

const Header: React.FC<HeaderProps> = ({
  cartCount,
  onSearch,
  onAddProduct,
  isAdmin,
  user,
  onLoginClick,
  onLogout,
  onCartClick
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [myStores, setMyStores] = useState<Store[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) getMyStores().then(setMyStores);
    else setMyStores([]);
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery.trim());
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    onSearch(q);
  };

  return (
    <header className="shopease-header">
      {/* Utility bar */}
      <div className="utility-bar">
        <div className="container utility-inner">
          <nav className="utility-left" aria-label="secondary">
            <button className="u-link" onClick={() => navigate('/seller-center')}>Seller Centre</button>
            <span className="u-sep">|</span>
            <button className="u-link" onClick={() => navigate('/create-store')}>เปิดร้านค้า</button>
            <span className="u-sep">|</span>
            <button className="u-link" onClick={() => navigate('/download')}>ดาวน์โหลด</button>
            <span className="u-sep">|</span>
            <span className="u-muted">ติดตามเรา</span>
            <a className="u-icon" href="#" aria-label="Facebook">📘</a>
            <a className="u-icon" href="#" aria-label="Instagram">📸</a>
            <a className="u-icon" href="#" aria-label="YouTube">▶️</a>
          </nav>

          <div className="utility-right">
            <button className="u-link" onClick={() => navigate('/notifications')}>
              🔔 การแจ้งเตือน
            </button>
            <span className="u-sep">|</span>
            <button className="u-link" onClick={() => navigate('/help')}>
              ❓ ช่วยเหลือ
            </button>
            <span className="u-sep">|</span>
            <button className="u-link" aria-label="Language">🌐 ไทย</button>
            <span className="u-sep">|</span>

            {/* Auth */}
            {user ? (
              <div className="user-chip" onClick={() => setShowUserMenu(!showUserMenu)}>
                <span className="chip-avatar">{user.firstName.charAt(0).toUpperCase()}</span>
                <span className="chip-name">{user.firstName}</span>
                <span className="chip-arrow">▾</span>
              </div>
            ) : (
              <button className="u-link" onClick={onLoginClick}>🔐 เข้าสู่ระบบ</button>
            )}
          </div>
        </div>
      </div>

      {/* Main row: brand + search + cart */}
      <div className="main-bar">
        <div className="container main-inner">
          <div className="brand" onClick={() => navigate('/')}>
            <div className="brand-badge">S</div>
            <div className="brand-text">
              <div className="brand-title">ShopEase</div>
              <div className="brand-sub">Premium Store</div>
            </div>
          </div>

          <div className="search-wrap">
            <form className="search-form" onSubmit={handleSubmit} role="search" aria-label="ค้นหาสินค้า">
              <input
                className="search-field"
                type="text"
                value={searchQuery}
                onChange={handleChange}
                placeholder="ค้นหาสินค้าและร้านค้า"
                autoComplete="off"
              />
              <button type="submit" className="search-btn" aria-label="ค้นหา">🔎</button>
            </form>

            <div className="hot-queries" aria-label="คำค้นยอดนิยม">
              {['Gravity Move', 'เคสทนร้อน', 'Huawei Watch Fit 4', 'เคส Yokohama', 'สายชาร์จ', 'LEGO Shark', 'แหก', 'iPhone'].map((tag) => (
                <button
                  key={tag}
                  className="hot-link"
                  onClick={() => {
                    setSearchQuery(tag);
                    onSearch(tag);
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="actions">
            {isAdmin && (
              <button className="admin-add" onClick={onAddProduct} title="เพิ่มสินค้า">
                ➕
              </button>
            )}

            <button className="cart-pill" onClick={onCartClick} aria-label="ตะกร้าสินค้า">
              🛒
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
          </div>
        </div>
      </div>

      {/* User dropdown */}
      {user && showUserMenu && (
        <>
          <div className="user-menu">
            <div className="menu-header">
              <div className="menu-avatar">{user.firstName.charAt(0).toUpperCase()}</div>
              <div className="menu-meta">
                <div className="menu-name">{user.firstName} {user.lastName}</div>
                <div className="menu-email">{user.email}</div>
              </div>
            </div>

            <div className="menu-group">
              {myStores.length === 1 && (
                <button className="menu-item" onClick={() => navigate(`/store/${myStores[0].id}`)}>🏪 หน้าร้านของฉัน</button>
              )}
              {myStores.length > 1 && (
                <>
                  <div className="menu-label">ร้านค้าของฉัน</div>
                  {myStores.map((s) => (
                    <button key={s.id} className="menu-item" onClick={() => navigate(`/store/${s.id}`)}>🏪 {s.name}</button>
                  ))}
                </>
              )}
            </div>

            <div className="menu-group">
              <button className="menu-item" onClick={() => navigate('/profile')}>👤 โปรไฟล์ของฉัน</button>
              <button className="menu-item" onClick={() => navigate('/wallet')}>💰 กระเป๋าเงิน</button>
              <button className="menu-item" onClick={() => navigate('/payment-history')}>📊 ประวัติการชำระเงิน</button>
              <button className="menu-item" onClick={() => navigate('/orders/history')}>📦 คำสั่งซื้อของฉัน</button>
              <button className="menu-item">❤️ รายการโปรด</button>
              <button className="menu-item">🎟️ คูปองของฉัน</button>
            </div>

            {isAdmin && (
              <div className="menu-group">
                <div className="menu-label">สำหรับผู้ดูแล</div>
                <button className="menu-item" onClick={() => navigate('/admin-finance')}>📈 แดชบอร์ดการเงิน</button>
                <button className="menu-item" onClick={() => navigate('/admin')}>⚙️ จัดการระบบ</button>
              </div>
            )}

            <div className="menu-group">
              <button
                className="menu-item danger"
                onClick={() => {
                  setShowUserMenu(false);
                  onLogout();
                }}
              >
                🚪 ออกจากระบบ
              </button>
            </div>
          </div>

          <div className="menu-backdrop" onClick={() => setShowUserMenu(false)} />
        </>
      )}
    </header>
  );
};

export default Header;