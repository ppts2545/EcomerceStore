import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthService from '../../services/AuthService';

const AuthSuccess: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const token = urlParams.get('token');
    const email = urlParams.get('email');
    const name = urlParams.get('name');

    console.log('🔍 AuthSuccess received:', { token: !!token, email, name });

    if (token && email) {
      // Store token and user info
      localStorage.setItem('authToken', token);
      localStorage.setItem('userEmail', email);
      if (name) localStorage.setItem('userName', name);
      
      // 🔄 Refresh user session from backend
      AuthService.getCurrentUser().then((user) => {
        console.log('✅ OAuth2 user loaded:', user);
      }).catch((error) => {
        console.error('❌ Error loading OAuth2 user:', error);
      });
      
      // Notify parent window (if opened in popup)
      if (window.opener) {
        window.opener.postMessage({
          type: 'OAUTH_SUCCESS',
          token: token,
          email: email,
          name: name
        }, '*');
        window.close();
      } else {
        // Redirect to main page
        alert(`✅ เข้าสู่ระบบสำเร็จ!\nสวัสดี ${name || email}`);
        window.location.href = 'http://localhost:5174/';
      }
    } else if (email && !token) {
      // OAuth2 success but no token (debugging)
      alert(`🔍 OAuth2 Success!\nEmail: ${email}\nName: ${name}\nแต่ไม่มี token`);
      console.log('🔍 OAuth2 Success but no token:', { email, name });
      window.location.href = 'http://localhost:5174/';
    } else {
      // Handle error
      alert('❌ เข้าสู่ระบบไม่สำเร็จ - ไม่มีข้อมูล token หรือ email');
      console.log('❌ Missing token or email:', { token, email, name });
      navigate('/');
    }
  }, [location, navigate]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      flexDirection: 'column'
    }}>
      <h2>🔄 กำลังเข้าสู่ระบบ...</h2>
      <p>กรุณารอสักครู่</p>
    </div>
  );
};

export default AuthSuccess;
