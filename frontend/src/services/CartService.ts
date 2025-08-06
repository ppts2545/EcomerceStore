// Cart Service - ใช้สำหรับจัดการ Cart API calls
const API_BASE_URL = 'http://localhost:8082/api/cart';

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  stock: number;
  description?: string;
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
}

class CartService {
  
  // 🛒 ดึงสินค้าในตะกร้าของ user ปัจจุบัน
  async getCartItems(): Promise<CartItem[]> {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch cart items');
      }
      
      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('❌ Error fetching cart items:', error);
      return [];
    }
  }

  // ➕ เพิ่มสินค้าลงตะกร้า
  async addToCart(productId: string, quantity: number = 1): Promise<boolean> {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/add`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
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

  // 🔄 อัพเดทจำนวนสินค้า
  async updateQuantity(itemId: string, quantity: number): Promise<boolean> {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/update/${itemId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
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

  // 🗑️ ลบสินค้าออกจากตะกร้า
  async removeItem(itemId: string): Promise<boolean> {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/remove/${itemId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
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

  // 🧹 ลบสินค้าทั้งหมดในตะกร้า
  async clearCart(): Promise<boolean> {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/clear`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
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

  // 📊 ดึงจำนวนสินค้าในตะกร้า
  async getCartCount(): Promise<number> {
    try {
      const items = await this.getCartItems();
      return items.reduce((total, item) => total + item.quantity, 0);
    } catch (error) {
      console.error('❌ Error getting cart count:', error);
      return 0;
    }
  }
}

// Export singleton instance
export default new CartService();
