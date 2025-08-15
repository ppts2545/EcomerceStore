import React, { useState } from 'react';
import './AuthModal.css';
import AuthService from '../../services/AuthService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (userData: RegisterData) => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin, onRegister }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phoneNumber: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError(null);
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('กรุณากรอกอีเมลและรหัสผ่าน');
      return false;
    }

    if (!isLoginMode) {
      if (!formData.firstName || !formData.lastName) {
        setError('กรุณากรอกชื่อและนามสกุล');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('รหัสผ่านไม่ตรงกัน');
        return false;
      }
      if (formData.password.length < 6) {
        setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
        return false;
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('รูปแบบอีเมลไม่ถูกต้อง');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setError(null);

    try {
      if (isLoginMode) {
        await onLogin(formData.email, formData.password);
      } else {
        await onRegister({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phoneNumber || undefined
        });
      }
      
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        phoneNumber: ''
      });
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = () => {
    setIsLoginMode(!isLoginMode);
    setIsForgotPassword(false);
    setError(null);
    setSuccessMessage(null);
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      phoneNumber: ''
    });
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError('กรุณากรอกอีเมลของคุณ');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await AuthService.forgotPassword(formData.email);
      
      if (response.success) {
        setSuccessMessage('ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว');
        setIsForgotPassword(true);
      } else {
        setError(response.message || 'เกิดข้อผิดพลาดในการส่งอีเมล');
      }
    } catch {
      setError('เกิดข้อผิดพลาดในการส่งอีเมล กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth2Login = (provider: string) => {
    onClose(); // Close modal before redirecting
    // Redirect to OAuth2 authorization endpoint
    if (provider === 'google') {
  window.location.href = `http://localhost:8082/oauth2/authorization/${provider}`;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <div className="auth-modal-header">
          <h2>{isLoginMode ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}</h2>
          <button className="auth-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="auth-modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="อีเมล"
                value={formData.email}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>

            {!isLoginMode && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <input
                      type="text"
                      name="firstName"
                      placeholder="ชื่อ"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="text"
                      name="lastName"
                      placeholder="นามสกุล"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <input
                    type="tel"
                    name="phoneNumber"
                    placeholder="เบอร์โทรศัพท์ (ไม่จำเป็น)"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>
              </>
            )}

            <div className="form-group">
              <input
                type="password"
                name="password"
                placeholder="รหัสผ่าน"
                value={formData.password}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>

            {!isLoginMode && (
              <div className="form-group">
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="ยืนยันรหัสผ่าน"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
            )}

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="success-message">
                {successMessage}
              </div>
            )}

            {isLoginMode && !isForgotPassword && (
              <div className="forgot-password">
                <button 
                  type="button" 
                  className="forgot-btn"
                  onClick={handleForgotPassword}
                  disabled={isLoading}
                >
                  ลืมรหัสผ่าน?
                </button>
              </div>
            )}

            <button 
              type="submit" 
              className="submit-btn"
              disabled={isLoading || isForgotPassword}
            >
              {isLoading ? (
                <span className="loading-spinner">⏳</span>
              ) : (
                isLoginMode ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'
              )}
            </button>
          </form>

          <div className="divider">
            <span>หรือ</span>
          </div>

          <div className="social-login">
            <button 
              className="social-btn facebook"
              onClick={() => handleOAuth2Login('facebook')}
              disabled={isLoading}
            >
              <span className="social-icon">📘</span>
              Facebook
            </button>
            <button 
              className="social-btn google"
              onClick={() => handleOAuth2Login('google')}
              disabled={isLoading}
            >
              <span className="social-icon">🔍</span>
              Google
            </button>
          </div>

          <div className="auth-switch">
            {isLoginMode ? (
              <p>
                ยังไม่มีบัญชี? 
                <button 
                  type="button" 
                  className="switch-btn" 
                  onClick={switchMode}
                >
                  สมัครสมาชิก
                </button>
              </p>
            ) : (
              <p>
                มีบัญชีแล้ว? 
                <button 
                  type="button" 
                  className="switch-btn" 
                  onClick={switchMode}
                >
                  เข้าสู่ระบบ
                </button>
              </p>
            )}
          </div>

          {!isLoginMode && (
            <div className="terms">
              <p>
                การสมัครสมาชิกแสดงว่าคุณยอมรับ
                <a href="#"> เงื่อนไขการใช้งาน</a> และ
                <a href="#"> นโยบายความเป็นส่วนตัว</a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
