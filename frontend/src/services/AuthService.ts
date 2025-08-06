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
      await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('❌ Logout error:', error);
    } finally {
      // Clear local state regardless of API call success
      this.currentUser = null;
      this.token = null;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }

  // 👤 Get Current User
  async getCurrentUser(): Promise<User | null> {
    // First check if we have user in memory
    if (this.currentUser) {
      return this.currentUser;
    }

    // Then check localStorage
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      try {
        this.currentUser = JSON.parse(storedUser);
        this.token = storedToken;
        
        // Verify with backend
        const response = await fetch(`${API_BASE_URL}/me`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            this.currentUser = data.user;
            localStorage.setItem('user', JSON.stringify(this.currentUser));
            return this.currentUser;
          }
        }
      } catch (error) {
        console.error('❌ Error verifying user session:', error);
        // Clear invalid session
        this.logout();
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
}

// Export singleton instance
export default new AuthService();
