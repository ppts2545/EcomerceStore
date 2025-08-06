import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const AuthError: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const error = urlParams.get('error') || 'unknown_error';

    // Show error message
    alert('❌ เข้าสู่ระบบไม่สำเร็จ: ' + error);
    
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
      color: 'red'
    }}>
      <h2>❌ เข้าสู่ระบบไม่สำเร็จ</h2>
      <p>กำลังกลับไปหน้าหลัก...</p>
    </div>
  );
};

export default AuthError;
