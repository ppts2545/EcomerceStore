import { useState, useEffect, useCallback } from 'react'
import './App.css'
import Header from './components/Header/Header'
import BannerHotword from './components/Banner-Hotword/Banner-Hotword'
import CategorySection from './components/Category-innerMain-Section/CategorySection'
import AddProductForm from './components/Add Product/AddProductForm'
import EditProductForm from './components/Add Product/EditProductForm'
import AuthModal from './components/Auth/AuthModal'
import Cart from './components/Cart/Cart'
import ProductRating from './components/Product Rating/ProductRating'
import AdminDashboard from './components/Admin/AdminDashboard'
import AuthService, { type User } from './services/AuthService'
import CartService from './services/CartService'
import SessionService from './services/SessionService'
import ProductDetail from './components/ProductDetail/ProductDetail'

interface MediaItem {
  id: string | number;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  alt?: string;
  displayOrder?: number;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
  category?: string;
  mediaItems?: MediaItem[]; // Backend media items
}

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  
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
      SessionService.stopSessionMonitoring();
    };
  }, []);

  // 🔐 Load current user
  const loadCurrentUser = async () => {
    try {
      const currentUser = await AuthService.getCurrentUser();
      setUser(currentUser);
      
      // Start session monitoring when user is authenticated
      if (currentUser) {
        SessionService.startSessionMonitoring(() => {
          // Handle session expiration
          setUser(null);
          setCartCount(0);
          alert('⚠️ เซสชันของคุณหมดอายุแล้ว กรุณาเข้าสู่ระบบใหม่อีกครั้ง');
        });
      } else {
        SessionService.stopSessionMonitoring();
      }
    } catch (error) {
      console.error('Error loading user:', error);
      SessionService.stopSessionMonitoring();
    }
  };

  // 🔐 Authentication handlers
  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await AuthService.login({ email, password });
      
      if (response.success && response.user) {
        setUser(response.user);
        setShowAuthModal(false);
        
        // Start session monitoring after successful login
        SessionService.startSessionMonitoring(() => {
          setUser(null);
          setCartCount(0);
          alert('⚠️ เซสชันของคุณหมดอายุแล้ว กรุณาเข้าสู่ระบบใหม่อีกครั้ง');
        });
        
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
        
        // Start session monitoring after successful registration
        SessionService.startSessionMonitoring(() => {
          setUser(null);
          setCartCount(0);
          alert('⚠️ เซสชันของคุณหมดอายุแล้ว กรุณาเข้าสู่ระบบใหม่อีกครั้ง');
        });
        
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
      // Stop session monitoring before logout
      SessionService.stopSessionMonitoring();
      
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

  //  Load cart when user changes
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
      
      // Add sample media data to some products for demo
      const productsWithMedia = data.map((product, index) => {
        // Add media to every 3rd product for demo
        if (index % 3 === 0) {
          return {
            ...product,
            media: [
              {
                id: `media-${product.id}-1`,
                type: 'image' as const,
                url: `https://picsum.photos/600/600?random=${product.id + 100}`,
                alt: `${product.name} - รูปที่ 2`
              },
              {
                id: `media-${product.id}-2`,
                type: 'image' as const,
                url: `https://picsum.photos/600/600?random=${product.id + 200}`,
                alt: `${product.name} - รูปที่ 3`
              },
              {
                id: `media-${product.id}-3`,
                type: 'video' as const,
                url: 'https://sample-videos.com/zip/10/mp4/480/SampleVideo_640x360_1mb.mp4',
                thumbnail: `https://picsum.photos/600/600?random=${product.id + 300}`,
                alt: `${product.name} - วีดีโอสาธิต`
              }
            ]
          };
        }
        return product;
      });
      
      setProducts(productsWithMedia);
      setFilteredProducts(productsWithMedia);
      console.log('✅ Products loaded with media:', productsWithMedia);
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
    console.log('🔧 handleAddProduct called!');
    console.log('Product data:', productData);
    console.log('isAdminPage:', isAdminPage);
    console.log('isAdmin:', isAdmin);
    console.log('user:', user);
    console.log('Current path:', currentPath);
    
    // สำหรับการทดสอบ - ข้ามการตรวจสอบ admin ชั่วคราว
    // if (!isAdminPage || !isAdmin) {
    //   console.log('❌ Not admin or not admin page');
    //   alert('❌ ต้องเป็น Admin ในหน้า /admin เท่านั้นที่สามารถเพิ่มสินค้าได้');
    //   return;
    // }

    console.log('✅ Starting API call...');
    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:8082/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData)
      });

      console.log('📡 API Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ API Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newProduct = await response.json();
      console.log('✅ New product created:', newProduct);
      
      setProducts(prev => [...prev, newProduct]);
      setFilteredProducts(prev => [...prev, newProduct]);
      setShowAddForm(false);
      
      alert(`✅ เพิ่มสินค้า "${newProduct.name}" สำเร็จ!`);
      
    } catch (error) {
      console.error('❌ Error adding product:', error);
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
    <div>
      {/* Check if this is admin page and user is logged in as admin */}
      {isAdminPage && isAdmin && user?.role === 'ADMIN' ? (
        <AdminDashboard />
      ) : (
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
                onCartClick={() => setShowCart(true)}
                loading={loading}
              />
            ) : (
              <>
                <div style={{
                  backgroundColor: 'white',
                  padding: '20px',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  border: '1px solid #e0e0e0'
                }}>
                  <h2 style={{ 
                    margin: '0 0 10px 0', 
                    color: '#ee4d2d',
                    textAlign: 'left',
                    fontSize: '18px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    🛍️ สินค้าทั้งหมด
                    <span style={{
                      fontSize: '14px',
                      color: '#666',
                      fontWeight: 'normal'
                    }}>
                      ({filteredProducts.length} รายการ)
                    </span>
                  </h2>
                  
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(188px, 1fr))', 
                    gap: '15px',
                    marginTop: '15px'
                  }}>
                    {loading ? (
                      Array.from({ length: 8 }).map((_, index) => (
                        <div key={index} style={{
                          backgroundColor: '#f5f5f5',
                          borderRadius: '2px',
                          height: '280px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ccc'
                        }}>
                          Loading...
                        </div>
                      ))
                    ) : filteredProducts.length === 0 ? (
                      <div style={{ 
                        gridColumn: '1 / -1', 
                        textAlign: 'center', 
                        padding: '40px',
                        color: '#666' 
                      }}>
                        ไม่มีสินค้าให้แสดง
                      </div>
                    ) : (
                      filteredProducts.map((product) => (
                        <div 
                          key={product.id}
                          onClick={() => {
                            window.history.pushState({}, '', `/product/${product.id}`);
                            setCurrentPath(`/product/${product.id}`);
                          }}
                          style={{
                            backgroundColor: 'white',
                            borderRadius: '2px',
                            overflow: 'hidden',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                            transition: 'all 0.2s ease',
                            cursor: 'pointer',
                            border: '1px solid #f0f0f0',
                            position: 'relative'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.1)';
                          }}
                        >
                          {/* Product content */}
                          <div style={{ position: 'relative', overflow: 'hidden' }}>
                            <img 
                              src={product.imageUrl} 
                              alt={product.name}
                              style={{
                                width: '100%',
                                height: '188px',
                                objectFit: 'cover',
                                transition: 'transform 0.3s ease'
                              }}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTg4IiBoZWlnaHQ9IjE4OCIgdmlld0JveD0iMCAwIDE4OCAxODgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxODgiIGhlaWdodD0iMTg4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik05NCA3NEw5NCA5NCIgc3Ryb2tlPSIjOUI5QjlCIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8cGF0aCBkPSJNODQgODRMOTQgOTRMMTA0IDg0IiBzdHJva2U9IiM5QjlCOUIiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxyZWN0IHg9IjY2IiB5PSIxMDQiIHdpZHRoPSI1NiIgaGVpZ2h0PSIzNiIgcng9IjQiIHN0cm9rZT0iIzlCOUI5QiIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+';
                              }}
                            />
                            
                            {product.stock === 0 && (
                              <div style={{
                                position: 'absolute',
                                top: '0',
                                left: '0',
                                right: '0',
                                bottom: '0',
                                backgroundColor: 'rgba(0,0,0,0.7)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '14px',
                                fontWeight: 'bold'
                              }}>
                                สินค้าหมด
                              </div>
                            )}
                          </div>
                          
                          <div style={{ padding: '12px' }}>
                            <h3 style={{
                              margin: '0 0 8px 0',
                              fontSize: '14px',
                              fontWeight: '400',
                              color: '#333',
                              lineHeight: '1.2',
                              overflow: 'hidden',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical'
                            }}>
                              {product.name}
                            </h3>
                            
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              margin: '8px 0'
                            }}>
                              <span style={{
                                color: '#ee4d2d',
                                fontSize: '16px',
                                fontWeight: 'bold'
                              }}>
                                ฿{(product.price * 35).toLocaleString()}
                              </span>
                              {isAdmin && isEditMode && (
                                <div style={{ display: 'flex', gap: '5px' }}>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingProduct(product);
                                    }}
                                    style={{
                                      backgroundColor: '#ffc107',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '3px',
                                      padding: '4px 8px',
                                      fontSize: '12px',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    แก้ไข
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteProduct(product.id);
                                    }}
                                    disabled={isDeleting === product.id}
                                    style={{
                                      backgroundColor: isDeleting === product.id ? '#ccc' : '#dc3545',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '3px',
                                      padding: '4px 8px',
                                      fontSize: '12px',
                                      cursor: isDeleting === product.id ? 'not-allowed' : 'pointer'
                                    }}
                                  >
                                    {isDeleting === product.id ? 'ลบ...' : 'ลบ'}
                                  </button>
                                </div>
                              )}
                            </div>
                            
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              fontSize: '12px'
                            }}>
                              <ProductRating 
                                productId={product.id} 
                                size="small" 
                                showCount={true}
                                showText={false}
                              />
                              <span style={{ color: '#666' }}>จำนวน: {product.stock}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}

            {/* 🛍️ Add Product Form */}
            {showAddForm && isAdmin && (
              <AddProductForm 
                onSubmit={handleAddProduct}
                onCancel={() => setShowAddForm(false)}
                isLoading={isSubmitting}
              />
            )}

            {/* ✏️ Edit Product Form */}
            {editingProduct && isAdmin && (
              <EditProductForm 
                product={editingProduct}
                onSubmit={handleEditProduct}
                onCancel={() => setEditingProduct(null)}
              />
            )}
          </div>
        </section>
        </main>

        {/* 🔐 Authentication Modal */}
        {showAuthModal && (
          <AuthModal
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
            onLogin={handleLogin}
            onRegister={handleRegister}
          />
        )}

        {/* 🛒 Cart */}
        {showCart && (
          <Cart
            isOpen={showCart}
            onClose={() => setShowCart(false)}
          />
        )}
        </>
      )}
      </div>
    );
  }

export default App
