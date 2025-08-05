import React, { useState } from 'react';
import './Header.css';

interface HeaderProps {
  cartCount: number;
  onSearch: (searchTerm: string) => void;
  onAddProduct: () => void;  // ← เพิ่ม prop ใหม่
  isAdmin?: boolean;         // ← เพิ่ม admin mode
}

const Header: React.FC<HeaderProps> = ({ cartCount, onSearch, onAddProduct, isAdmin = true }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo Section */}
        <div className="header-logo">
          <h1>🛒 E-Commerce Store</h1>
        </div>

        {/* Search Section */}
        <div className="header-search">
          <form onSubmit={handleSearchSubmit} className="search-form">
            <input
              type="text"
              placeholder="ค้นหาสินค้า..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-button">
              🔍
            </button>
          </form>
        </div>

        {/* Actions Section */}
        <div className="header-actions">
          {/* Admin: Add Product Button */}
          {isAdmin && (
            <button 
              onClick={onAddProduct}
              className="add-product-btn"
              title="เพิ่มสินค้าใหม่"
            >
              ➕ เพิ่มสินค้า
            </button>
          )}

          {/* Cart Button */}
          <div className="cart-container">
            <button className="cart-button">
              🛒
              {cartCount > 0 && (
                <span className="cart-count">{cartCount}</span>
              )}
            </button>
          </div>

          {/* User Menu */}
          <div className="user-menu">
            <button className="user-button">
              👤 Admin
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;