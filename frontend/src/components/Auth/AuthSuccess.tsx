import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthService from '../../services/AuthService';

const AuthSuccess: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const email = urlParams.get('email');
    const userId = urlParams.get('userId');
    const sessionId = urlParams.get('sessionId');

    console.log('🔍 AuthSuccess received:', { email, userId, sessionId });

    if (email && userId) {
      // 🔄 Load user data from backend using session
      AuthService.getCurrentUser().then((user) => {
        console.log('✅ OAuth2 user loaded via session:', user);
        
        // Store user info in localStorage for quick access
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userId', userId);
        if (user.name) localStorage.setItem('userName', user.name);
        
        console.log(`✅ OAuth2 login successful for ${user.name || email}`);
      }).catch((error) => {
        console.error('❌ Error loading OAuth2 user from session:', error);
      });
      
      // Notify parent window (if opened in popup)
      if (window.opener) {
        window.opener.postMessage({
          type: 'OAUTH_SUCCESS',
          email: email,
          userId: userId,
          sessionId: sessionId
        }, '*');
        window.close();
      } else {
        // Redirect to main page smoothly
        setTimeout(() => {
          window.location.href = 'http://localhost:5174/';
        }, 1000); // 1 second delay for user to see success message
      }
    } else {
      // Handle error - missing token or email
      alert('❌ เข้าสู่ระบบไม่สำเร็จ - ไม่มีข้อมูล token หรือ email');
      console.log('❌ Missing token or email:', { email, userId });
      navigate('/');
    }
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
        }}>✅</div>
        <h2 style={{
          color: '#27ae60',
          margin: '0 0 10px 0',
          fontSize: '24px',
          fontWeight: '500'
        }}>เข้าสู่ระบบสำเร็จ!</h2>
        <p style={{
          color: '#666',
          margin: '0 0 20px 0',
          fontSize: '16px'
        }}>กำลังนำท่านเข้าสู่หน้าหลัก...</p>
        <div className="spinner" style={{
          width: '20px',
          height: '20px',
          border: '2px solid #e0e0e0',
          borderTop: '2px solid #27ae60',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto'
        }}></div>
      </div>
    </div>
  );
};

export default AuthSuccess;
