import React, { useState } from 'react';
import { FaShoppingBag, FaSearch, FaFacebook, FaInstagram } from 'react-icons/fa';
import { SiTiktok } from 'react-icons/si';
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
      {/* *** แก้ไขส่วนนี้ - รวม Header Container *** */}
      <div className="header-container">
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
                <a href="#" className="social-link">
                  <FaFacebook />
                </a>
                <a href="#" className="social-link">
                  <FaInstagram />
                </a>
                <a href="#" className="social-link">
                  <SiTiktok />
                </a>
              </div>
            </div>
            <div className="header-top-right">
              <a href="#" className="header-link">🔔 Notifications</a>
              <span className="separator">|</span>
              <a href="#" className="header-link">❓ Help</a>
              <span className="separator">|</span>
              <a href="#" className="header-link">🌐 English</a>
              <span className="separator">|</span>
              <a href="#" className="header-link">Sign Up</a>
              <span className="separator">|</span>
              <a href="#" className="header-link">Log In</a>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="header-main">
          <div className="container">
            <div className="header-content">
              {/* Logo */}
              <div className="logo">
                <a href="/" className="logo-link">
                  <FaShoppingBag className="logo-icon" />
                  <span className="logo-text">Shopee</span>
                </a>
              </div>

              {/* Search Section */}
              <div className="search-section">
                <form className="search-form" onSubmit={handleSearch}>
                  <div className="search-container">
                    <input
                      type="text"
                      className="search-input"
                      placeholder="ค้นหาสินค้า เช่น iPhone 15, Nike, Samsung"
                      value={searchQuery}
                      onChange={handleInputChange}
                    />
                    <button type="submit" className="search-button">
                      <FaSearch />
                    </button>
                  </div>
                </form>
                <div className="popular-keywords">
                  <a href="#" className="keyword">iPhone 15</a>
                  <a href="#" className="keyword">Air Jordan</a>
                  <a href="#" className="keyword">MacBook</a>
                  <a href="#" className="keyword">Samsung S24</a>
                  <a href="#" className="keyword">Nike</a>
                </div>
              </div>

              {/* Cart */}
              <div className="cart-section">
                <a href="/cart" className="cart-link">
                  <div className="cart-icon-container">
                    <FaShoppingBag className="cart-icon" />
                    {cartCount > 0 && (
                      <span className="cart-badge">{cartCount}</span>
                    )}
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>   
    </>
  );
};

export default Header;