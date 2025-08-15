// Session Management Service
import AuthService from './AuthService';

class SessionService {
  private sessionCheckInterval: number | null = null;
  private readonly CHECK_INTERVAL = 30000; // ตรวจสอบทุก 30 วินาที
  private sessionExpiredCallback: (() => void) | null = null;

  /**
   * เริ่มตรวจสอบ session status
   */
  startSessionMonitoring(onSessionExpired: () => void) {
    this.sessionExpiredCallback = onSessionExpired;
    
    // Clear existing interval if any
    this.stopSessionMonitoring();
    
    // Start monitoring
    this.sessionCheckInterval = setInterval(async () => {
      await this.checkSession();
    }, this.CHECK_INTERVAL);

    console.log('🔄 Session monitoring started');
  }

  /**
   * หยุดตรวจสอบ session
   */
  stopSessionMonitoring() {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
      this.sessionCheckInterval = null;
      console.log('⏹️ Session monitoring stopped');
    }
  }

  /**
   * ตรวจสอบสถานะ session
   */
  private async checkSession(): Promise<boolean> {
    try {
  const response = await fetch('http://localhost:8082/api/auth/me', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        console.warn('⚠️ Session expired - triggering logout');
        await this.handleSessionExpired();
        return false;
      }

      if (response.ok) {
        const data = await response.json();
        if (!data.success) {
          console.warn('⚠️ Session invalid - triggering logout');
          await this.handleSessionExpired();
          return false;
        }
        return true;
      }

      return true;
    } catch (error) {
      console.error('❌ Session check failed:', error);
      // Network error - don't logout, just log the error
      return true;
    }
  }

  /**
   * จัดการเมื่อ session หมดอายุ
   */
  private async handleSessionExpired() {
    // Stop monitoring to prevent multiple calls
    this.stopSessionMonitoring();

    // Clear local auth state
    AuthService.silentLogout();

    // Call callback function (usually to update UI state)
    if (this.sessionExpiredCallback) {
      this.sessionExpiredCallback();
    }
  }

  /**
   * ตรวจสอบ session ทันที (manual check)
   */
  async checkSessionNow(): Promise<boolean> {
    return await this.checkSession();
  }

  /**
   * Handle API errors that might indicate session expiration
   */
  handleApiError(status: number, data?: { success?: boolean; message?: string }): boolean {
    if (status === 401 || (data && !data.success && data.message?.includes('เข้าสู่ระบบ'))) {
      console.warn('🚨 API returned unauthorized - session likely expired');
      this.handleSessionExpired();
      return true; // Indicates session expired
    }
    return false; // Normal error, not session related
  }
}

export default new SessionService();
