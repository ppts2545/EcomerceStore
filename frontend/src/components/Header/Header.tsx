import React, { useState } from 'react';
import './Header.css';
import type { User } from '../../services/AuthService';

interface HeaderProps {
  cartCount: number;
  onSearch: (searchTerm: string) => void;
  onAddProduct: () => void;
  isAdmin?: boolean;
  user?: User | null;
  onLoginClick: () => void;
  onLogout: () => void;
  onCartClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  cartCount, 
  onSearch, 
  onAddProduct, 
  isAdmin = false,
  user,
  onLoginClick,
  onLogout,
  onCartClick
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  return (
    <>
      {/* Top Bar - Shopee Style */}
      <div style={{
        backgroundColor: '#ee4d2d',
        color: 'white',
        padding: '4px 0',
        fontSize: '12px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, #ee4d2d 0%, #ff6533 100%)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 20px'
        }}>
          <div style={{ display: 'flex', gap: '20px' }}>
            <span>ขายฟรี</span>
            <span>ดาวน์โหลด</span>
            <span>ติดตาม Shopee ได้ที่</span>
            <span>📱 💬 📘</span>
          </div>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <span>🔔 การแจ้งเตือน</span>
            <span>❓ ช่วยเหลือ</span>
            <span>🌐 ภาษาไทย</span>
            
            {/* User Authentication Section */}
            {user ? (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <span>👤</span>
                  <span>{user.firstName}</span>
                  <span style={{ fontSize: '10px' }}>▼</span>
                </button>
                
                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: '0',
                    backgroundColor: 'white',
                    border: '1px solid #e0e0e0',
                    borderRadius: '4px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    minWidth: '160px',
                    zIndex: 1000,
                    marginTop: '5px'
                  }}>
                    <div style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid #f0f0f0',
                      color: '#333',
                      fontSize: '13px'
                    }}>
                      <div style={{ fontWeight: 'bold' }}>{user.firstName} {user.lastName}</div>
                      <div style={{ color: '#666', fontSize: '11px' }}>{user.email}</div>
                    </div>
                    
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        // Navigate to profile
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 16px',
                        background: 'none',
                        border: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: '12px',
                        color: '#333',
                        borderBottom: '1px solid #f0f0f0'
                      }}
                    >
                      👤 โปรไฟล์ของฉัน
                    </button>
                    
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        // Navigate to orders
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 16px',
                        background: 'none',
                        border: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: '12px',
                        color: '#333',
                        borderBottom: '1px solid #f0f0f0'
                      }}
                    >
                      📦 การซื้อของฉัน
                    </button>
                    
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onLogout();
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 16px',
                        background: 'none',
                        border: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: '12px',
                        color: '#333'
                      }}
                    >
                      🚪 ออกจากระบบ
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={onLoginClick}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  👤 เข้าสู่ระบบ
                </button>
                <button
                  onClick={onLoginClick}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  📝 สมัครสมาชิก
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header style={{
        backgroundColor: 'white',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '20px'
        }}>
          
          {/* Logo Section - Shopee Style */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            minWidth: '140px'
          }}>
            <div style={{
              fontSize: '28px',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #ee4d2d 0%, #ff6533 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '32px' }}>🛒</span>
              Shopee
            </div>
          </div>

          {/* Search Section - Shopee Style */}
          <div style={{ flex: 1, maxWidth: '840px' }}>
            <form onSubmit={handleSearchSubmit} style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'white',
              border: '2px solid #ee4d2d',
              borderRadius: '2px',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <input
                type="text"
                placeholder="ค้นหาใน Shopee"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  border: 'none',
                  outline: 'none',
                  fontSize: '14px',
                  backgroundColor: 'transparent'
                }}
              />
              <button 
                type="submit" 
                style={{
                  backgroundColor: '#ee4d2d',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#d73527';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ee4d2d';
                }}
              >
                🔍
              </button>
            </form>
            
            {/* Popular Keywords */}
            <div style={{
              display: 'flex',
              gap: '12px',
              marginTop: '8px',
              flexWrap: 'wrap'
            }}>
              {['iPhone 15', 'เสื้อผ้า', 'รองเท้า', 'เครื่องสำอาง', 'กระเป๋า'].map(keyword => (
                <button
                  key={keyword}
                  onClick={() => {
                    setSearchTerm(keyword);
                    onSearch(keyword);
                  }}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#666',
                    fontSize: '12px',
                    cursor: 'pointer',
                    padding: '2px 0',
                    textDecoration: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#ee4d2d';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#666';
                  }}
                >
                  {keyword}
                </button>
              ))}
            </div>
          </div>

          {/* Actions Section - Shopee Style */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            minWidth: '200px'
          }}>
            
            {/* Admin: Add Product Button */}
            {isAdmin && (
              <button 
                onClick={onAddProduct}
                style={{
                  backgroundColor: '#ee4d2d',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '2px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#d73527';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ee4d2d';
                }}
                title="เพิ่มสินค้าใหม่"
              >
                <span style={{ fontSize: '14px' }}>➕</span>
                เพิ่มสินค้า
              </button>
            )}

            {/* Cart Button - Shopee Style */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={onCartClick}
                style={{
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                fontSize: '24px',
                color: '#ee4d2d',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                🛒
                {cartCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    backgroundColor: '#ff4757',
                    color: 'white',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    padding: '2px 6px',
                    borderRadius: '10px',
                    minWidth: '18px',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </button>
            </div>

            {/* User Menu - Shopee Style */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              padding: '8px'
            }}>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: '#f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px'
              }}>
                👤
              </div>
              <span style={{
                fontSize: '14px',
                color: '#333',
                fontWeight: '500'
              }}>
                Admin
              </span>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;