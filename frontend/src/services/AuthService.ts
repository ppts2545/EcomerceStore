// Authentication Service - Connect to Backend
const API_BASE_URL = 'http://localhost:8082/api/auth';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'ADMIN' | 'CUSTOMER';
  createdAt: string;
  lastLoginAt?: string;
  oauth2Provider?: string;
  phoneNumber?: string;
  address?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}

class AuthService {
  private currentUser: User | null = null;
  private token: string | null = null;

  // 🔐 Login
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies/session
        body: JSON.stringify(credentials)
      });
      
      const data = await response.json();
      
      if (data.success) {
        this.currentUser = data.user;
        this.token = data.token;
        
        // Store in localStorage for persistence
        localStorage.setItem('user', JSON.stringify(this.currentUser));
        if (this.token) {
          localStorage.setItem('token', this.token);
        }
      }
      
      return data;
    } catch (error) {
      console.error('❌ Login error:', error);
      
      return {
        success: false,
        message: 'เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง'
      };
    }
  }

  // 📝 Register
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies/session
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        this.currentUser = data.user;
        this.token = data.token;
        
        // Store in localStorage for persistence
        localStorage.setItem('user', JSON.stringify(this.currentUser));
        if (this.token) {
          localStorage.setItem('token', this.token);
        }
      }
      
      return data;
    } catch (error) {
      console.error('❌ Register error:', error);
      
      return {
        success: false,
        message: 'เกิดข้อผิดพลาดในการสมัครสมาชิก กรุณาลองใหม่อีกครั้ง'
      };
    }
  }

  // 🚪 Logout
  async logout(): Promise<void> {
    try {
      // Clear local state first
      this.currentUser = null;
      this.token = null;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');
      
      // Clear all cookies and session storage
      sessionStorage.clear();
      
      // Clear Google OAuth cookies by opening logout URL in hidden iframe
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = 'https://accounts.google.com/logout';
      document.body.appendChild(iframe);
      
      // Remove iframe after a short delay
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
      
      // Call backend logout to clear server session
      try {
        await fetch(`${API_BASE_URL}/logout`, {
          method: 'POST',
          credentials: 'include',
        });
      } catch {
        console.log('Backend logout call failed, continuing with client logout');
      }
      
      // Force complete page reload to clear all cached OAuth states
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
      
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Fallback: force reload
      window.location.reload();
    }
  }

  // 🔇 Silent Logout (for session expiration - no redirect)
  silentLogout(): void {
    console.log('🔇 Performing silent logout due to session expiration');
    
    // Clear local state only
    this.currentUser = null;
    this.token = null;
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    
    // Clear session storage
    sessionStorage.clear();
    
    // Don't redirect - just clear the state
    console.log('✅ Silent logout completed');
  }

  // 👤 Get Current User
  async getCurrentUser(): Promise<User | null> {
    try {
      // Always verify with backend first for session-based auth
      const response = await fetch(`${API_BASE_URL}/me`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          this.currentUser = data.user;
          localStorage.setItem('user', JSON.stringify(this.currentUser));
          return this.currentUser;
        }
      }
    } catch (error) {
      console.error('❌ Error verifying user session:', error);
    }

    // Fallback to localStorage if backend fails
    if (this.currentUser) {
      return this.currentUser;
    }

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        this.currentUser = JSON.parse(storedUser);
        return this.currentUser;
      } catch (error) {
        console.error('❌ Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }

    return null;
  }

  // ✅ Check Email Availability
  async checkEmailAvailability(email: string): Promise<{ available: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/check-email?email=${encodeURIComponent(email)}`, {
        credentials: 'include'
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Error checking email:', error);
      return {
        available: false,
        message: 'ไม่สามารถตรวจสอบอีเมลได้ในขณะนี้'
      };
    }
  }

  // 🔑 Forgot Password
  async forgotPassword(email: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Forgot password error:', error);
      
      return {
        success: false,
        message: 'เกิดข้อผิดพลาดในการส่งอีเมลรีเซ็ตรหัสผ่าน'
      };
    }
  }

  // 🔄 Reset Password
  async resetPassword(token: string, newPassword: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ token, newPassword })
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Reset password error:', error);
      
      return {
        success: false,
        message: 'เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน'
      };
    }
  }

  // 🔍 Helper methods
  isLoggedIn(): boolean {
    return this.currentUser !== null || !!localStorage.getItem('user');
  }

  getUser(): User | null {
    return this.currentUser || (localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null);
  }

  getToken(): string | null {
    return this.token || localStorage.getItem('token');
  }

  isAdmin(): boolean {
    const user = this.getUser();
    return user?.role === 'ADMIN';
  }

  // 💓 Keep Session Alive - เรียกทุก 30 นาที
  async keepSessionAlive(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/keep-alive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.success && data.user) {
        this.currentUser = data.user;
        console.log('✅ Session refreshed successfully');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Keep session alive error:', error);
      return false;
    }
  }

  // 📊 Get Session Info
  async getSessionInfo(): Promise<{
    success: boolean;
    isLoggedIn: boolean;
    sessionId?: string;
    maxInactiveInterval?: number;
    user?: User;
  } | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/session-info`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      
      return await response.json();
    } catch (error) {
      console.error('❌ Get session info error:', error);
      return null;
    }
  }

  // 🔄 Auto Keep-Alive Setup - เริ่มต้น auto refresh
  startAutoKeepAlive(): void {
    // เรียก keep-alive ทุก 30 นาที (1800000 ms)
    setInterval(async () => {
      const currentUser = await this.getCurrentUser();
      if (currentUser) {
        await this.keepSessionAlive();
      }
    }, 30 * 60 * 1000); // 30 minutes
  }

  // 🛑 Stop Auto Keep-Alive
  private keepAliveInterval: number | null = null;

  startAutoKeepAliveWithControl(): void {
    this.stopAutoKeepAlive(); // หยุดที่เก่าก่อน
    
    this.keepAliveInterval = window.setInterval(async () => {
      const sessionInfo = await this.getSessionInfo();
      if (sessionInfo?.isLoggedIn) {
        await this.keepSessionAlive();
      } else {
        this.stopAutoKeepAlive(); // หยุดถ้าไม่ได้ล็อกอิน
      }
    }, 30 * 60 * 1000); // 30 minutes
  }

  stopAutoKeepAlive(): void {
    if (this.keepAliveInterval) {
      window.clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }
  }
}

// Export singleton instance
export default new AuthService();
