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
    <header className="header">
      <div className="header-container">
        {/* Logo Section */}
        <div className="header-left">
          <a href="/" className="logo">
            <div className="logo-icon">🛍️</div>
            <div className="logo-text">
              <div className="logo-brand">ShopZone</div>
              <div className="logo-tagline">Premium Store</div>
            </div>
          </a>
        </div>

        {/* Search Section */}
        <div className="header-search">
          <form onSubmit={handleSearchSubmit} className="search-form">
            <div className="search-icon">🔍</div>
            <input
              type="text"
              placeholder="ค้นหาสินค้า แบรนด์ หรือหมวดหมู่..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="search-input"
            />
            <button type="submit" className="search-btn">
              ค้นหา
            </button>
          </form>
        </div>

        {/* Action Buttons */}
        <div className="header-actions">
          {/* Cart Button */}
          <button className="action-btn cart-btn" onClick={onCartClick}>
            🛒
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </button>

          {/* Admin Panel Button */}
          {isAdmin && (
            <button className="action-btn" onClick={onAddProduct}>
              ⚙️
            </button>
          )}

          {/* User Section */}
          <div className="user-section">
            {user ? (
              <>
                <div className="user-profile">
                  <div className="user-avatar">
                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                  </div>
                  <div className="user-info">
                    <div className="user-name">
                      {user.firstName} {user.lastName}
                    </div>
                  </div>
                </div>
                <button className="logout-btn" onClick={onLogout}>
                  ออกจากระบบ
                </button>
              </>
            ) : (
              <div className="auth-buttons">
                <button className="auth-btn google-login-btn" onClick={onLoginClick}>
                  <span>🔐</span>
                  <span>เข้าสู่ระบบ</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
