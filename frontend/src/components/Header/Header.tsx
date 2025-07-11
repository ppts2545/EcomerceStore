import React, { useState } from 'react';
import './Header.css';

export interface HeaderProps {
  onSearch?: (query: string) => void;
  cartCount?: number;
}

const Header: React.FC<HeaderProps> = ({ onSearch, cartCount = 0 }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <>
      {/* Top Header */}
      <div className="header-top">
        <div className="container">
          <div className="header-top-left">
            <a href="#" className="header-link">Seller Centre</a>
            <span className="separator">|</span>
            <a href="#" className="header-link">Start Selling</a>
            <span className="separator">|</span>
            <a href="#" className="header-link">Download</a>
            <span className="separator">|</span>
            <span className="header-text">Follow us on</span>
            <div className="social-links">
              <a href="#" className="social-link">📘</a>
              <a href="#" className="social-link">📷</a>
            </div>
          </div>
          <div className="header-top-right">
            <a href="#" className="header-link">🔔 Notifications</a>
            <a href="#" className="header-link">❓ Help</a>
            <a href="#" className="header-link">🌐 English</a>
            <a href="#" className="header-link">Sign Up</a>
            <a href="#" className="header-link">Login</a>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="header-main">
        <div className="container">
          <div className="header-content">
            {/* Logo */}
            <div className="logo">
              <a href="/" className="logo-link">
                <div className="logo-icon">🛒</div>
                <span className="logo-text">Shopee</span>
              </a>
            </div>

            {/* Search Bar */}
            <div className="search-section">
              <form className="search-form" onSubmit={handleSearch}>
                <div className="search-container">
                  <input
                    type="text"
                    className="search-input"
                    placeholder="ค้นหาใน Shopee"
                    value={searchQuery}
                    onChange={handleInputChange}
                  />
                  <button type="submit" className="search-button">
                    🔍
                  </button>
                </div>
              </form>
              
              {/* Popular Keywords */}
              <div className="popular-keywords">
                <a href="#" className="keyword">เสื้อผ้าแฟชั่น</a>
                <a href="#" className="keyword">เครื่องใช้ไฟฟ้า</a>
                <a href="#" className="keyword">มือถือ</a>
                <a href="#" className="keyword">ของใช้ในบ้าน</a>
                <a href="#" className="keyword">อาหารและเครื่องดื่ม</a>
              </div>
            </div>

            {/* Cart */}
            <div className="cart-section">
              <a href="#" className="cart-link">
                <div className="cart-icon-container">
                  <span className="cart-icon">🛒</span>
                  {cartCount > 0 && (
                    <span className="cart-badge">{cartCount}</span>
                  )}
                </div>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="container">
          <div className="nav-content">
            <div className="nav-categories">
              <div className="categories-dropdown">
                <span className="categories-icon">☰</span>
                <span className="categories-text">หมวดหมู่สินค้า</span>
              </div>
            </div>
            
            <div className="nav-links">
              <a href="#" className="nav-link active">หน้าแรก</a>
              <a href="#" className="nav-link">Flash Sale</a>
              <a href="#" className="nav-link">Mall</a>
              <a href="#" className="nav-link">Live</a>
              <a href="#" className="nav-link">Voucher</a>
              <a href="#" className="nav-link">Coin</a>
            </div>

            <div className="nav-promotions">
              <div className="promo-banner">
                <span className="promo-text">🔥 Sale ลดสูงสุด 90%</span>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Header;
export { Header };
