// Cart Service - ใช้สำหรับจัดการ Cart API calls (Session-based)
const API_BASE_URL = 'http://localhost:8082/api/session-cart';

export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  stock: number;
  description?: string;
  totalPrice?: number;
}

export interface AddToCartRequest {
  productId: number;
  quantity: number;
}

class CartService {
  
  // 🛒 ดึงสินค้าในตะกร้าของ user ปัจจุบัน (ใช้ session)
  async getCartItems(): Promise<CartItem[]> {
    try {
      const response = await fetch(`${API_BASE_URL}`, {
        method: 'GET',
        credentials: 'include', // ส่ง session cookies
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          console.warn('⚠️ User not authenticated for cart access');
          return [];
        }
        throw new Error('Failed to fetch cart items');
      }
      
      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('❌ Error fetching cart items:', error);
      return [];
    }
  }

  // ➕ เพิ่มสินค้าลงตะกร้า (ใช้ session)
  async addToCart(productId: number, quantity: number = 1): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/add`, {
        method: 'POST',
        credentials: 'include', // ส่ง session cookies
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productId, quantity })
      });
      
      const data = await response.json();
      
      if (data.success) {
        return true;
      } else {
        throw new Error(data.message || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('❌ Error adding to cart:', error);
      throw error;
    }
  }

  // 🔄 อัพเดทจำนวนสินค้า (ใช้ session)
  async updateQuantity(itemId: number, quantity: number): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/update/${itemId}`, {
        method: 'PUT',
        credentials: 'include', // ส่ง session cookies
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantity })
      });
      
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('❌ Error updating quantity:', error);
      return false;
    }
  }

  // 🗑️ ลบสินค้าออกจากตะกร้า (ใช้ session)
  async removeItem(itemId: number): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/remove/${itemId}`, {
        method: 'DELETE',
        credentials: 'include', // ส่ง session cookies
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('❌ Error removing item:', error);
      return false;
    }
  }

  // 🧹 ลบสินค้าทั้งหมดในตะกร้า (ใช้ session)
  async clearCart(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/clear`, {
        method: 'DELETE',
        credentials: 'include', // ส่ง session cookies
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('❌ Error clearing cart:', error);
      return false;
    }
  }

  // 📊 ดึงจำนวนสินค้าในตะกร้า (ใช้ session)
  async getCartCount(): Promise<number> {
    try {
      const response = await fetch(`${API_BASE_URL}/count`, {
        method: 'GET',
        credentials: 'include', // ส่ง session cookies
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        return 0;
      }
      
      const data = await response.json();
      return data.count || 0;
    } catch (error) {
      console.error('❌ Error getting cart count:', error);
      return 0;
    }
  }
}

// Export singleton instance
export default new CartService();
