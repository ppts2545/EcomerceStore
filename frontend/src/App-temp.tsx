import { useState, useEffect, useCallback } from 'react'
import './App.css'
import Header from './components/Header/Header'
import BannerHotword from './components/Banner-Hotword/Banner-Hotword'
import CategorySection from './components/Category-innerMain-Section/CategorySection'
import AddProductForm from './components/Add Product/AddProductForm'
import EditProductForm from './components/Add Product/EditProductForm'
import AuthModal from './components/Auth/AuthModal'
import Cart from './components/Cart/Cart'
import AuthService, { type User } from './services/AuthService'
import CartService from './services/CartService'
import ProductDetail from './components/ProductDetail/ProductDetail'

interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  alt?: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
  media?: MediaItem[]; // Additional media items for slider
}

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [productQuantity, setProductQuantity] = useState(1); // เพิ่ม state สำหรับปริมาณสินค้า
  
  // 🔐 Authentication states
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // 🛒 Cart states
  const [showCart, setShowCart] = useState(false);

  // 🛣️ ตรวจสอบว่าอยู่ในหน้า Admin หรือไม่
  const isAdminPage = currentPath === '/admin';
  const isProductDetailPage = currentPath.startsWith('/product/');
  
  // 🔍 Get current product ID from URL
  const getProductIdFromPath = () => {
    const match = currentPath.match(/\/product\/(\d+)/);
    return match ? parseInt(match[1]) : null;
  };
  
  const currentProduct = isProductDetailPage 
    ? products.find(p => p.id === getProductIdFromPath()) 
    : null;

  // 🔐 Admin Authentication - ใช้ useCallback เพื่อป้องกัน dependency warning
  const handleAdminLogin = useCallback(() => {
    if (!isAdminPage) {
      alert('❌ ต้องเข้าหน้า /admin เท่านั้นถึงจะใช้งาน Admin ได้');
      window.history.pushState({}, '', '/admin');
      setCurrentPath('/admin');
      return;
    }

    const password = prompt('🔐 กรุณาใส่รหัสผ่าน Admin:');
    if (password === 'admin123') {
      setIsAdmin(true);
      alert('✅ เข้าสู่ระบบ Admin สำเร็จ!');
    } else if (password !== null) {
      alert('❌ รหัสผ่านไม่ถูกต้อง!');
      window.history.pushState({}, '', '/');
      setCurrentPath('/');
    }
  }, [isAdminPage]);

  // 🚪 Admin Logout
  const handleAdminLogout = useCallback(() => {
    setIsAdmin(false);
    setIsEditMode(false);
    alert('✅ ออกจากระบบ Admin แล้ว');
    window.history.pushState({}, '', '/');
    setCurrentPath('/');
  }, []);

  // 🎯 ฟังการเปลี่ยนแปลง URL
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  // 🔄 Auto Admin mode เมื่ออยู่ในหน้า /admin
  useEffect(() => {
    if (isAdminPage && !isAdmin) {
      handleAdminLogin();
    } else if (!isAdminPage && isAdmin) {
      handleAdminLogout();
    }
  }, [isAdminPage, isAdmin, handleAdminLogin, handleAdminLogout]);

  // ✅ เรียก API เพื่อดึงข้อมูลสินค้า
  useEffect(() => {
    fetchProducts();
    // Load current user from localStorage
    loadCurrentUser();
    // เริ่มต้น Auto Keep-Alive สำหรับ Session
    AuthService.startAutoKeepAliveWithControl();
    
    // Cleanup function
    return () => {
      AuthService.stopAutoKeepAlive();
    };
  }, []);

  // 🔐 Load current user
  const loadCurrentUser = async () => {
    try {
      const currentUser = await AuthService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  // 🔐 Authentication handlers
  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await AuthService.login({ email, password });
      
      if (response.success && response.user) {
        setUser(response.user);
        setShowAuthModal(false);
        alert(`✅ ยินดีต้อนรับ ${response.user.firstName}!`);
      } else {
        throw new Error(response.message || 'การเข้าสู่ระบบล้มเหลว');
      }
    } catch (error) {
      throw error; // Re-throw to let AuthModal handle the error display
    }
  };

  const handleRegister = async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
  }) => {
    try {
      const response = await AuthService.register(userData);
      
      if (response.success && response.user) {
        setUser(response.user);
        setShowAuthModal(false);
        alert(`✅ สมัครสมาชิกสำเร็จ! ยินดีต้อนรับ ${response.user.firstName}!`);
      } else {
        throw new Error(response.message || 'การสมัครสมาชิกล้มเหลว');
      }
    } catch (error) {
      throw error; // Re-throw to let AuthModal handle the error display
    }
  };

  const handleLogout = async () => {
    try {
      await AuthService.logout();
      setUser(null);
      setCartCount(0); // รีเซ็ต cart count เมื่อ logout
      // The AuthService.logout() will handle the page reload
    } catch {
      console.error('Logout error');
      // Fallback logout
      setUser(null);
      setCartCount(0);
      alert('✅ ออกจากระบบเรียบร้อยแล้ว');
    }
  };

  // 🛒 Cart functions
  const updateCartCount = async () => {
    try {
      const count = await CartService.getCartCount();
      setCartCount(count);
    } catch (error) {
      console.error('Error updating cart count:', error);
    }
  };

  const loadCartItems = useCallback(async () => {
    if (!user) return;
    try {
      await CartService.getCartItems();
    } catch (error) {
      console.error('Error loading cart items:', error);
    }
  }, [user]);

  const handleAddToCart = async (productId: number, quantity: number = 1) => {
    if (!user) {
      setShowAuthModal(true);
      alert('กรุณาเข้าสู่ระบบก่อนเพิ่มสินค้าลงตะกร้า');
      return;
    }

    try {
      await CartService.addToCart(productId, quantity);
      await updateCartCount();
      alert('✅ เพิ่มสินค้าลงตะกร้าเรียบร้อยแล้ว!');
    } catch (error) {
      alert('❌ ไม่สามารถเพิ่มสินค้าลงตะกร้าได้');
    }
  };

  // 🔄 Reset productQuantity เมื่อเปลี่ยนสินค้า
  useEffect(() => {
    setProductQuantity(1);
  }, [currentPath]);

  // 🛒 Load cart when user changes
  useEffect(() => {
    if (user) {
      loadCartItems();
      updateCartCount();
    } else {
      setCartCount(0);
    }
  }, [user, loadCartItems]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8082/api/products');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: Product[] = await response.json();
      setProducts(data);
      setFilteredProducts(data);
      console.log('✅ Products loaded:', data);
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      setError('Failed to load products. Make sure backend is running on port 8082.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Search functionality
  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setFilteredProducts(products);
      return;
    }
    
    const filtered = products.filter(product => 
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.description.toLowerCase().includes(query.toLowerCase())
    );
    
    setFilteredProducts(filtered);
    console.log(`🔍 Search "${query}" found ${filtered.length} products`);
  };



  // ✏️ Toggle Edit Mode - ทำงานเฉพาะใน /admin
  const handleToggleEditMode = () => {
    if (!isAdminPage) {
      alert('❌ ต้องอยู่ในหน้า /admin เท่านั้น');
      return;
    }
    if (!isAdmin) {
      handleAdminLogin();
      return;
    }
    setIsEditMode(!isEditMode);
  };

  // ✅ Function สำหรับเพิ่มสินค้าใหม่ - เฉพาะใน /admin
  const handleAddProduct = async (productData: Omit<Product, 'id'>) => {
    if (!isAdminPage || !isAdmin) {
      alert('❌ ต้องเป็น Admin ในหน้า /admin เท่านั้นที่สามารถเพิ่มสินค้าได้');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:8082/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newProduct = await response.json();
      
      setProducts(prev => [...prev, newProduct]);
      setFilteredProducts(prev => [...prev, newProduct]);
      setShowAddForm(false);
      
      alert(`✅ เพิ่มสินค้า "${newProduct.name}" สำเร็จ!`);
      
    } catch (error) {
      console.error('Error adding product:', error);
      alert('❌ เกิดข้อผิดพลาดในการเพิ่มสินค้า กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Function สำหรับแก้ไขสินค้า - เฉพาะใน /admin (หรือเมื่อสินค้าหมด)
  const handleEditProduct = async (productData: Omit<Product, 'id'>) => {
    if (!isAdminPage || !isAdmin) {
      alert('❌ ต้องเป็น Admin ในหน้า /admin เท่านั้น');
      return;
    }

    if (!editingProduct) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch(`http://localhost:8082/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedProduct = await response.json();
      
      setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
      setFilteredProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
      setEditingProduct(null);
      
      alert(`✅ แก้ไขสินค้า "${updatedProduct.name}" สำเร็จ!`);
      
    } catch (error) {
      console.error('Error updating product:', error);
      alert('❌ เกิดข้อผิดพลาดในการแก้ไขสินค้า กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Function สำหรับลบสินค้า - เฉพาะใน /admin
  const handleDeleteProduct = async (productId: number, productName: string) => {
    if (!isAdminPage || !isAdmin || !isEditMode) {
      alert('❌ ต้องเป็น Admin ในหน้า /admin และเปิดโหมดแก้ไขเท่านั้น');
      return;
    }

    if (!window.confirm(`คุณแน่ใจหรือไม่ที่จะลบสินค้า "${productName}"?`)) {
      return;
    }

    setIsDeleting(productId);
    try {
      const response = await fetch(`http://localhost:8082/api/products/${productId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      setProducts(prev => prev.filter(p => p.id !== productId));
      setFilteredProducts(prev => prev.filter(p => p.id !== productId));
      
      alert(`✅ ลบสินค้า "${productName}" สำเร็จ!`);
      
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('❌ เกิดข้อผิดพลาดในการลบสินค้า กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsDeleting(null);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        🔄 Loading products...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        padding: '20px',
        textAlign: 'center'
      }}>
        <h2 style={{ color: '#e74c3c' }}>❌ Error</h2>
        <p>{error}</p>
        <button 
          onClick={fetchProducts}
          style={{
            padding: '10px 20px',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          🔄 Try Again
        </button>
      </div>
    );
  }

  return (
    <>
      {/* ✅ Header with Search Bar */}
      <Header 
        cartCount={cartCount} 
        onSearch={handleSearch}
        onAddProduct={() => setShowAddForm(true)}
        isAdmin={isAdmin && isAdminPage} // แสดงปุ่มเฉพาะใน /admin
        user={user}
        onLoginClick={() => setShowAuthModal(true)}
        onLogout={handleLogout}
        onCartClick={() => setShowCart(true)}
      />
      
      {/* 🔐 Admin Control Panel - แสดงเฉพาะใน /admin */}
      {isAdminPage && (
        <div style={{
          backgroundColor: isAdmin ? (isEditMode ? '#28a745' : '#17a2b8') : '#6c757d',
          color: 'white',
          padding: '10px 0',
          textAlign: 'center',
          borderBottom: '2px solid rgba(255,255,255,0.2)'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '15px'
            }}>
              {/* Status Display */}
              <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                {!isAdmin ? (
                  <>🔒 Admin Page - กรุณาเข้าสู่ระบบ</>
                ) : isEditMode ? (
                  <>✏️ Edit Mode - สามารถแก้ไข/ลบสินค้าได้</>
                ) : (
                  <>👤 Admin Mode - พร้อมจัดการสินค้า</>
                )}
              </div>

              {/* Admin Controls */}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                {!isAdmin ? (
                  <button
                    onClick={handleAdminLogin}
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      border: '2px solid rgba(255,255,255,0.3)',
                      padding: '8px 16px',
                      borderRadius: '20px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 'bold',
                      transition: 'all 0.3s'
                    }}
                  >
                    🔐 เข้าสู่ระบบ Admin
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleToggleEditMode}
                      style={{
                        backgroundColor: isEditMode ? '#dc3545' : '#28a745',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: 'bold',
                        transition: 'all 0.3s'
                      }}
                    >
                      {isEditMode ? '🔒 ปิดโหมดแก้ไข' : '✏️ เปิดโหมดแก้ไข'}
                    </button>

                    <button
                      onClick={handleAdminLogout}
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        border: '2px solid rgba(255,255,255,0.3)',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: 'bold',
                        transition: 'all 0.3s'
                      }}
                    >
                      🚪 ออกจากระบบ
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <main style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
        {/* Show Banner and Category only when NOT on product detail page */}
        {!isProductDetailPage && (
          <>
            <BannerHotword />
            <CategorySection />
          </>
        )}
        
        <section style={{ padding: isProductDetailPage ? '20px 0' : '20px 0' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 15px' }}>
            
            {/* URL Info Panel - Hide on product detail page */}
            {!isProductDetailPage && (
              <div style={{
                backgroundColor: 'white',
                padding: '10px 20px',
                borderRadius: '8px',
                marginBottom: '20px',
                textAlign: 'center',
                border: `2px solid ${isAdminPage ? '#28a745' : '#17a2b8'}`
              }}>
                <p style={{ margin: 0, fontSize: '14px' }}>
                  📍 <strong>Current URL:</strong> {currentPath} 
                  {isAdminPage ? (
                    <span style={{ color: '#28a745', fontWeight: 'bold' }}> - Admin Page ✅</span>
                  ) : (
                    <span style={{ color: '#666' }}> - Guest Page (เข้า <a href="/admin" onClick={(e) => {
                      e.preventDefault();
                      window.history.pushState({}, '', '/admin');
                      setCurrentPath('/admin');
                    }} style={{ color: '#007bff' }}>/admin</a> เพื่อจัดการสินค้า)</span>
                  )}
                </p>
              </div>
            )}

            {/* 🛍️ Product Detail Page */}
            {isProductDetailPage ? (
              <ProductDetail 
                product={currentProduct || null}
                onAddToCart={handleAddToCart}
                loading={loading}
