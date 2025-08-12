import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const AuthError: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const error = urlParams.get('error') || 'unknown_error';

    console.error('❌ OAuth2 Error:', error);
    
    // Redirect to home page after 3 seconds
    setTimeout(() => {
      navigate('/');
    }, 3000);
  }, [location, navigate]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      flexDirection: 'column',
      backgroundColor: '#f5f5f5',
      fontFamily: 'var(--font-family)'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        textAlign: 'center',
        minWidth: '300px'
      }}>
        <div style={{
          fontSize: '48px',
          marginBottom: '20px',
          animation: 'fadeIn 0.5s ease-in-out'
        }}>❌</div>
        <h2 style={{
          color: '#e74c3c',
          margin: '0 0 10px 0',
          fontSize: '24px',
          fontWeight: '500'
        }}>เข้าสู่ระบบไม่สำเร็จ</h2>
        <p style={{
          color: '#666',
          margin: '0 0 20px 0',
          fontSize: '16px'
        }}>กำลังกลับไปหน้าหลัก...</p>
        <div className="spinner" style={{
          width: '20px',
          height: '20px',
          border: '2px solid #e0e0e0',
          borderTop: '2px solid #e74c3c',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto'
        }}></div>
      </div>
    </div>
  );
};

export default AuthError;
