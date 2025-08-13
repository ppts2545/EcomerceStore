// ePay Payment Gateway Service
// API URL: https://epay.tonow.net/689b6f2882c7bd60a6ef4bc6

export interface EPayPaymentRequest {
  amount: number;
  orderId: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  description?: string;
  returnUrl?: string;
  cancelUrl?: string;
  webhookUrl?: string;
}

export interface EPayPaymentResponse {
  success: boolean;
  paymentUrl?: string;
  transactionId?: string;
  qrCode?: string;
  message?: string;
  error?: string;
}

export interface EPayStatusResponse {
  success: boolean;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  transactionId: string;
  amount: number;
  paidAmount?: number;
  paidAt?: string;
  method?: string;
  reference?: string;
}

class EPayService {
  private readonly baseUrl = 'https://epay.tonow.net/689b6f2882c7bd60a6ef4bc6';
  private readonly apiKey = import.meta.env.VITE_EPAY_API_KEY || '';

  // สร้างการชำระเงิน
  async createPayment(paymentData: EPayPaymentRequest): Promise<EPayPaymentResponse> {
    try {
      console.log('🔄 Creating ePay payment:', paymentData);
      
      const requestBody = {
        amount: paymentData.amount,
        order_id: paymentData.orderId,
        customer_name: paymentData.customerName,
        customer_email: paymentData.customerEmail,
        customer_phone: paymentData.customerPhone,
        description: paymentData.description || `การสั่งซื้อ #${paymentData.orderId}`,
        return_url: paymentData.returnUrl || `${window.location.origin}/payment/success`,
        cancel_url: paymentData.cancelUrl || `${window.location.origin}/payment/cancel`,
        webhook_url: paymentData.webhookUrl
      };

      const response = await fetch(`${this.baseUrl}/api/payment/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('✅ ePay payment created successfully:', data);
        return {
          success: true,
          paymentUrl: data.payment_url,
          transactionId: data.transaction_id,
          qrCode: data.qr_code,
          message: data.message
        };
      } else {
        console.error('❌ ePay payment creation failed:', data);
        return {
          success: false,
          error: data.message || 'การสร้างการชำระเงินล้มเหลว'
        };
      }
    } catch (error) {
      console.error('❌ ePay service error:', error);
      return {
        success: false,
        error: 'เกิดข้อผิดพลาดในการเชื่อมต่อกับระบบชำระเงิน'
      };
    }
  }

  // ตรวจสอบสถานะการชำระเงิน
  async checkPaymentStatus(transactionId: string): Promise<EPayStatusResponse> {
    try {
      console.log('🔍 Checking ePay payment status:', transactionId);
      
      const response = await fetch(`${this.baseUrl}/api/payment/status/${transactionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('✅ ePay status checked successfully:', data);
        return {
          success: true,
          status: data.status,
          transactionId: data.transaction_id,
          amount: data.amount,
          paidAmount: data.paid_amount,
          paidAt: data.paid_at,
          method: data.payment_method,
          reference: data.reference
        };
      } else {
        console.error('❌ ePay status check failed:', data);
        return {
          success: false,
          status: 'failed',
          transactionId,
          amount: 0
        };
      }
    } catch (error) {
      console.error('❌ ePay status check error:', error);
      return {
        success: false,
        status: 'failed',
        transactionId,
        amount: 0
      };
    }
  }

  // ยกเลิกการชำระเงิน
  async cancelPayment(transactionId: string): Promise<{ success: boolean; message?: string }> {
    try {
      console.log('❌ Cancelling ePay payment:', transactionId);
      
      const response = await fetch(`${this.baseUrl}/api/payment/cancel/${transactionId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('✅ ePay payment cancelled successfully:', data);
        return {
          success: true,
          message: data.message
        };
      } else {
        console.error('❌ ePay cancellation failed:', data);
        return {
          success: false,
          message: data.message || 'การยกเลิกล้มเหลว'
        };
      }
    } catch (error) {
      console.error('❌ ePay cancellation error:', error);
      return {
        success: false,
        message: 'เกิดข้อผิดพลาดในการยกเลิกการชำระเงิน'
      };
    }
  }

  // สำหรับ QR Code Payment
  async generateQRCode(paymentData: EPayPaymentRequest): Promise<EPayPaymentResponse> {
    try {
      console.log('📱 Generating ePay QR Code:', paymentData);
      
      const requestBody = {
        amount: paymentData.amount,
        order_id: paymentData.orderId,
        description: paymentData.description || `การสั่งซื้อ #${paymentData.orderId}`,
        payment_type: 'qr_code'
      };

      const response = await fetch(`${this.baseUrl}/api/payment/qr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('✅ ePay QR Code generated successfully:', data);
        return {
          success: true,
          qrCode: data.qr_code,
          transactionId: data.transaction_id,
          message: data.message
        };
      } else {
        console.error('❌ ePay QR Code generation failed:', data);
        return {
          success: false,
          error: data.message || 'การสร้าง QR Code ล้มเหลว'
        };
      }
    } catch (error) {
      console.error('❌ ePay QR Code error:', error);
      return {
        success: false,
        error: 'เกิดข้อผิดพลาดในการสร้าง QR Code'
      };
    }
  }
}

export default new EPayService();
