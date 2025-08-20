import React, { useState, useEffect, useCallback } from 'react';
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

/** ถ้า API ของคุณมี slug ให้ร้านค้าไว้ด้วย ให้รองรับแบบ optional ไว้ */
type StoreWithSlug = Store & { slug?: string };

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
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const [showStoresSub, setShowStoresSub] = useState<boolean>(true); // keep open by default
  const [myStores, setMyStores] = useState<StoreWithSlug[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      getMyStores()
        .then((stores) => setMyStores(stores as StoreWithSlug[]))
        .catch(() => setMyStores([]));
    } else {
      setMyStores([]);
    }
  }, [user]);

  // Close menu on ESC
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowUserMenu(false); };
    document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSearch(searchQuery.trim());
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    onSearch(q);
  };

  const goStore = useCallback((s: StoreWithSlug) => {
    if (s.slug && s.slug.length > 0) navigate(`/store/${s.slug}`);
    else navigate(`/store/${s.id}`);
    setShowUserMenu(false);
  }, [navigate]);

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
            {/* ใช้ button เพื่อหลีกเลี่ยง # และคง a11y */}
            <button className="u-icon" aria-label="Facebook">📘</button>
            <button className="u-icon" aria-label="Instagram">📸</button>
            <button className="u-icon" aria-label="YouTube">▶️</button>
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
              <button
                className="user-chip"
                onClick={() => setShowUserMenu((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={showUserMenu}
              >
                <span className="chip-avatar">{user.firstName.charAt(0).toUpperCase()}</span>
                <span className="chip-name">{user.firstName}</span>
                <svg
                  className={`chip-caret ${showUserMenu ? 'rot' : ''}`}
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M7 10l5 5 5-5H7z"/>
                </svg>
              </button>
            ) : (
              <button className="u-link" onClick={onLoginClick}>🔐 เข้าสู่ระบบ</button>
            )}
          </div>
        </div>
      </div>

      {/* Main row: brand + search + cart */}
      <div className="main-bar">
        <div className="container main-inner">
          <div
            className="brand"
            onClick={() => navigate('/')}
            role="button"
            tabIndex={0}
            onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
              if (e.key === 'Enter') navigate('/');
            }}
            aria-label="กลับหน้าแรก"
          >
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
          <div className="user-menu" role="menu" aria-label="เมนูผู้ใช้">
            <div className="menu-header">
              <div className="menu-avatar">{user.firstName.charAt(0).toUpperCase()}</div>
              <div className="menu-meta">
                <div className="menu-name">{user.firstName} {user.lastName}</div>
                <div className="menu-email">{user.email}</div>
              </div>
            </div>

            {/* ร้านของฉัน (Dropdown) */}
            <div className={`menu-group stores ${showStoresSub ? 'open' : ''}`}>
              <button
                className="menu-item sub-trigger"
                onClick={() => setShowStoresSub((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={showStoresSub}
              >
                <span className="mi-ic">🏬</span>
                ร้านของฉัน
                <svg
                  className={`chev ${showStoresSub ? 'rot' : ''}`}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M7 10l5 5 5-5H7z"/>
                </svg>
              </button>

              {showStoresSub && (
                <div className="submenu" role="menu">
                  {myStores.length === 0 ? (
                    <div className="submenu-empty">
                      ยังไม่มีร้านที่คุณสร้าง
                      <button
                        className="link-create"
                        onClick={() => { setShowUserMenu(false); navigate('/create-store'); }}
                      >
                        + สร้างร้านใหม่
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="stores-list">
                        {myStores.map((s) => (
                          <button
                            key={s.id}
                            className="store-item"
                            onClick={() => goStore(s)}
                            role="menuitem"
                          >
                            <img
                              src={s.logoUrl ?? 'https://via.placeholder.com/36x36?text=%F0%9F%8F%AC'}
                              alt="โลโก้ร้าน"
                              onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                                e.currentTarget.src = 'https://via.placeholder.com/36x36?text=%3F';
                              }}
                            />
                            <span className="store-name">{s.name}</span>
                          </button>
                        ))}
                      </div>
                      <div className="submenu-actions">
                        <button
                          className="submenu-link"
                          onClick={() => { setShowUserMenu(false); navigate('/stores'); }}
                        >
                          ดูร้านทั้งหมด
                        </button>
                        <button
                          className="submenu-cta"
                          onClick={() => { setShowUserMenu(false); navigate('/create-store'); }}
                        >
                          + สร้างร้านใหม่
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="menu-group">
              <button className="menu-item" onClick={() => { setShowUserMenu(false); navigate('/profile'); }}>👤 โปรไฟล์ของฉัน</button>
              <button className="menu-item" onClick={() => { setShowUserMenu(false); navigate('/wallet'); }}>💰 กระเป๋าเงิน</button>
              <button className="menu-item" onClick={() => { setShowUserMenu(false); navigate('/payment-history'); }}>📊 ประวัติการชำระเงิน</button>
              <button className="menu-item" onClick={() => { setShowUserMenu(false); navigate('/orders/history'); }}>📦 คำสั่งซื้อของฉัน</button>
              <button className="menu-item" onClick={() => { setShowUserMenu(false); navigate('/favorites'); }}>❤️ รายการโปรด</button>
              <button className="menu-item" onClick={() => { setShowUserMenu(false); navigate('/coupons'); }}>🎟️ คูปองของฉัน</button>
            </div>

            {isAdmin && (
              <div className="menu-group">
                <div className="menu-label">สำหรับผู้ดูแล</div>
                <button className="menu-item" onClick={() => { setShowUserMenu(false); navigate('/admin-finance'); }}>📈 แดชบอร์ดการเงิน</button>
                <button className="menu-item" onClick={() => { setShowUserMenu(false); navigate('/admin'); }}>⚙️ จัดการระบบ</button>
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