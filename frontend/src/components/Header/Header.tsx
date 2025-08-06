import React, { useState } from 'react';
import './Header.css';

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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  return (
    <header className="modern-header">
      {/* 📢 Announcement Bar */}
      <div className="announcement-bar">
        <div className="container">
          <div className="announcement-content">
            <span>
              🎉 ฟรีค่าจัดส่ง เมื่อซื้อครบ ฿299
            </span>
            <span>
              ⚡ Flash Sale ลดสูงสุด 90%
            </span>
            <span>
              🛡️ รับประกันสินค้าแท้ 100%
            </span>
          </div>
        </div>
      </div>

      {/* 🏪 Main Header */}
      <div className="main-header">
        <div className="container">
          <div className="header-content">
            {/* 🏷️ Logo Section */}
            <div className="logo-section">
              <h1 className="logo-text">
                <span className="logo-main">ShopEase</span>
                <span className="logo-sub">Premium Store</span>
              </h1>
            </div>

            {/* 🔍 Search Section */}
            <div className="search-section">
              <form onSubmit={handleSearchSubmit} className="search-form">
                <div className="search-input-group">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="ค้นหาสินค้า เช่น iPhone, เสื้อผ้า, กระเป๋า..."
                    className="search-input"
                    autoComplete="off"
                  />
                  <button type="submit" className="search-button">
                    🔍
                  </button>
                </div>
              </form>

              {/* 🔥 Popular Search Tags */}
              <div className="popular-searches">
                <span className="popular-label">ยอดนิยม:</span>
                {['iPhone 15', 'Nike', 'Samsung', 'Adidas', 'MacBook'].map((tag, index) => (
                  <button
                    key={index}
                    className="popular-tag"
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

            {/* 👤 User Section */}
            <div className="user-section">
              {/* 🛒 Cart Button */}
              <button className="cart-button" onClick={onCartClick}>
                <span className="cart-icon">🛒</span>
                <span className="cart-text">ตะกร้า</span>
                {cartCount > 0 && (
                  <span className="cart-badge">{cartCount}</span>
                )}
              </button>

              {/* 👤 User Menu */}
              <div className="user-menu-container">
                {user ? (
                  <div className="user-dropdown">
                    <button 
                      className="user-button"
                      onClick={() => setShowUserMenu(!showUserMenu)}
                    >
                      <span className="user-avatar">
                        {user.firstName.charAt(0).toUpperCase()}
                      </span>
                      <span className="user-name">{user.firstName}</span>
                      <span className="dropdown-arrow">▼</span>
                    </button>

                    {showUserMenu && (
                      <div className="user-dropdown-menu">
                        <div className="dropdown-header">
                          <div className="user-info">
                            <div className="user-avatar-large">
                              {user.firstName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="user-full-name">
                                {user.firstName} {user.lastName}
                              </div>
                              <div className="user-email">{user.email}</div>
                            </div>
                          </div>
                        </div>

                        <div className="dropdown-divider"></div>

                        <div className="dropdown-menu-items">
                          <button className="dropdown-item">
                            <span className="item-icon">👤</span>
                            โปรไฟล์ของฉัน
                          </button>
                          <button className="dropdown-item">
                            <span className="item-icon">📦</span>
                            คำสั่งซื้อของฉัน
                          </button>
                          <button className="dropdown-item">
                            <span className="item-icon">❤️</span>
                            รายการโปรด
                          </button>
                          <button className="dropdown-item">
                            <span className="item-icon">🎟️</span>
                            คูปองของฉัน
                          </button>
                          
                          <div className="dropdown-divider"></div>
                          
                          <button 
                            className="dropdown-item logout-item"
                            onClick={() => {
                              setShowUserMenu(false);
                              onLogout();
                            }}
                          >
                            <span className="item-icon">🚪</span>
                            ออกจากระบบ
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="auth-buttons">
                    <button className="login-button" onClick={onLoginClick}>
                      <span className="auth-icon">🔐</span>
                      เข้าสู่ระบบ
                    </button>
                  </div>
                )}
              </div>

              {/* 🛠️ Admin Controls */}
              {isAdmin && (
                <button className="admin-button" onClick={onAddProduct}>
                  <span className="admin-icon">➕</span>
                  <span className="admin-text">เพิ่มสินค้า</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Click outside handler for user menu */}
      {showUserMenu && (
        <div 
          className="dropdown-backdrop"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  );
};

export default Header;
