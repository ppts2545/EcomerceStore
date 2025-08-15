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
              />
            ) : (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '25px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                marginBottom: '20px',
                border: '1px solid #e0e0e0'
              }}>
                <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1', minWidth: '350px' }}>
                    <div style={{
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      backgroundColor: 'white'
                    }}>
                      <img 
                        src={currentProduct.imageUrl}
                        alt={currentProduct.name}
                        style={{
                          width: '100%',
                          height: '400px',
                          objectFit: 'cover'
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x400?text=No+Image';
                        }}
                      />
                    </div>
                  </div>
                  
                  <div style={{ flex: '1', minWidth: '350px' }}>
                    <div style={{ marginBottom: '20px' }}>
                      <h1 style={{ 
                        margin: '0 0 15px 0', 
                        color: '#333',
                        fontSize: '24px',
                        fontWeight: '400',
                        lineHeight: '1.3'
                      }}>
                        {currentProduct.name}
                      </h1>
                      
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '10px',
                        marginBottom: '15px'
                      }}>
                        <div style={{ display: 'flex', gap: '2px' }}>
                          {[...Array(5)].map((_, i) => (
                            <span key={i} style={{ color: '#ffa500', fontSize: '14px' }}>★</span>
                          ))}
                        </div>
                        <span style={{ color: '#666', fontSize: '14px' }}>4.9</span>
                        <span style={{ color: '#ccc' }}>|</span>
                        <span style={{ color: '#666', fontSize: '14px' }}>12 ขายแล้ว</span>
                      </div>
                    </div>
                    
                    <div style={{ 
                      backgroundColor: '#fafafa',
                      padding: '20px',
                      borderRadius: '8px',
                      marginBottom: '20px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '10px' }}>
                        <span style={{
                          fontSize: '30px',
                          fontWeight: 'bold',
                          color: '#ee4d2d'
                        }}>
                          ฿{(currentProduct.price * 35).toLocaleString()}
                        </span>
                        <span style={{
                          fontSize: '16px',
                          color: '#999',
                          textDecoration: 'line-through'
                        }}>
                          ฿{(currentProduct.price * 35 * 1.2).toLocaleString()}
                        </span>
                        <span style={{
                          backgroundColor: '#ee4d2d',
                          color: 'white',
                          padding: '2px 6px',
                          borderRadius: '2px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          -17%
                        </span>
                      </div>
                    </div>
                    
                    <div style={{ marginBottom: '25px' }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '10px',
                        marginBottom: '15px'
                      }}>
                        <span style={{ color: '#666', fontSize: '14px', minWidth: '80px' }}>จำนวน</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <button 
                            onClick={() => setProductQuantity(prev => Math.max(1, prev - 1))}
                            disabled={productQuantity <= 1}
                            style={{
                              border: '1px solid #e0e0e0',
                              backgroundColor: productQuantity <= 1 ? '#f5f5f5' : 'white',
                              color: productQuantity <= 1 ? '#ccc' : '#333',
                              width: '32px',
                              height: '32px',
                              borderRadius: '2px',
                              cursor: productQuantity <= 1 ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>-</button>
                          <span style={{
                            border: '1px solid #e0e0e0',
                            padding: '8px 16px',
                            borderRadius: '2px',
                            minWidth: '50px',
                            textAlign: 'center'
                          }}>{productQuantity}</span>
                          <button 
                            onClick={() => setProductQuantity(prev => Math.min(currentProduct?.stock || 0, prev + 1))}
                            disabled={!currentProduct || productQuantity >= currentProduct.stock}
                            style={{
                              border: '1px solid #e0e0e0',
                              backgroundColor: (!currentProduct || productQuantity >= currentProduct.stock) ? '#f5f5f5' : 'white',
                              color: (!currentProduct || productQuantity >= currentProduct.stock) ? '#ccc' : '#333',
                              width: '32px',
                              height: '32px',
                              borderRadius: '2px',
                              cursor: (!currentProduct || productQuantity >= currentProduct.stock) ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>+</button>
                          <span style={{
                            color: '#666',
                            fontSize: '14px',
                            marginLeft: '10px'
                          }}>
                            {currentProduct.stock > 0 ? `${currentProduct.stock} ชิ้นที่มีอยู่` : 'สินค้าหมด'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          handleAddToCart(currentProduct.id, productQuantity);
                        }}
                        disabled={currentProduct.stock === 0 || productQuantity > currentProduct.stock}
                        style={{
                          backgroundColor: currentProduct.stock > 0 ? '#ffeee8' : '#f5f5f5',
                          color: currentProduct.stock > 0 ? '#ee4d2d' : '#ccc',
                          border: currentProduct.stock > 0 ? '1px solid #ee4d2d' : '1px solid #e0e0e0',
                          padding: '15px 25px',
                          borderRadius: '2px',
                          cursor: currentProduct.stock > 0 ? 'pointer' : 'not-allowed',
                          fontSize: '14px',
                          fontWeight: '500',
                          flex: '1',
                          transition: 'all 0.2s'
                        }}
                      >
                        🛒 เพิ่มลงตะกร้า
                      </button>
                      
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          handleAddToCart(currentProduct.id, productQuantity);
                          alert('🛒 นำไปชำระเงิน');
                        }}
                        disabled={currentProduct.stock === 0 || productQuantity > currentProduct.stock}
                        style={{
                          backgroundColor: currentProduct.stock > 0 ? '#ee4d2d' : '#ccc',
                          color: 'white',
                          border: 'none',
                          padding: '15px 25px',
                          borderRadius: '2px',
                          cursor: currentProduct.stock > 0 ? 'pointer' : 'not-allowed',
                          fontSize: '14px',
                          fontWeight: '500',
                          flex: '1',
                          transition: 'all 0.2s'
                        }}
                      >
                        ซื้อทันที
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => {
                        window.history.pushState({}, '', '/');
                        setCurrentPath('/');
                      }}
                      style={{
                        backgroundColor: 'transparent',
                        color: '#ee4d2d',
                        border: '1px solid #ee4d2d',
                        padding: '8px 16px',
                        borderRadius: '2px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        width: '100%'
                      }}
                    >
                      ← กลับหน้าหลัก
                    </button>
                  </div>
                </div>
                
                <div style={{
                  marginTop: '40px',
                  borderTop: '1px solid #e0e0e0',
                  paddingTop: '30px'
                }}>
                  <h3 style={{
                    color: '#333',
                    fontSize: '18px',
                    marginBottom: '15px',
                    fontWeight: '500'
                  }}>รายละเอียดสินค้า</h3>
                  <p style={{ 
                    color: '#666', 
                    fontSize: '14px',
                    lineHeight: '1.6',
                    margin: '0'
                  }}>
                    {currentProduct.description}
                  </p>
                </div>
              </div>
            ) : isProductDetailPage ? (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '30px',
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <h2 style={{ color: '#e74c3c' }}>❌ ไม่พบสินค้าที่ต้องการ</h2>
                <p>สินค้าที่คุณกำลังมองหาไม่มีในระบบ</p>
                <button 
                  onClick={() => {
                    window.history.pushState({}, '', '/');
                    setCurrentPath('/');
                  }}
                  style={{
                    backgroundColor: '#17a2b8',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  ← กลับหน้าหลัก
                </button>
              </div>
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
                    <span style={{
                      backgroundColor: '#ee4d2d',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '2px',
                      fontSize: '14px'
                    }}>
                      FLASH SALE
                    </span>
                    สินค้าแนะนำ ({filteredProducts.length} รายการ)
                  </h2>
                  <p style={{ 
                    margin: '0', 
                    color: '#666',
                    fontSize: '14px'
                  }}>
                    ผลิตภัณฑ์คุณภาพดี ราคาถูกที่สุด
                  </p>
                </div>
            
            {filteredProducts.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '60px 20px',
                backgroundColor: 'white',
                borderRadius: '8px',
                margin: '20px 0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #e0e0e0'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '15px' }}>📦</div>
                <h3 style={{ color: '#666', fontSize: '16px', marginBottom: '10px' }}>
                  {products.length === 0 ? 'ยังไม่มีสินค้า' : 'ไม่พบสินค้าที่ค้นหา'}
                </h3>
                <p style={{ fontSize: '14px', color: '#999', margin: '0' }}>
                  ลองค้นหาด้วยคำอื่น หรือดูหมวดหมู่สินค้าอื่น ๆ
                </p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(188px, 1fr))',
                gap: '10px',
                marginTop: '0'
              }}>
                {filteredProducts.map(product => (
                  <a 
                    key={product.id} 
                    href={`/product/${product.id}`}
                    style={{
                      textDecoration: 'none',
                      color: 'inherit'
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      // Navigate to product detail page
                      window.history.pushState({}, '', `/product/${product.id}`);
                      setCurrentPath(`/product/${product.id}`);
                    }}
                  >
                    <div style={{
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
                    
                    {/* Product Image */}
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
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/188x188?text=No+Image';
                        }}
                      />
                      
                      {/* Stock Badge */}
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
                      
                      {/* Discount Badge */}
                      {product.stock > 0 && (
                        <div style={{
                          position: 'absolute',
                          top: '8px',
                          left: '8px',
                          backgroundColor: '#ff4757',
                          color: 'white',
                          padding: '2px 6px',
                          borderRadius: '2px',
                          fontSize: '10px',
                          fontWeight: 'bold'
                        }}>
                          -17%
                        </div>
                      )}
                    </div>
                    
                    {/* Product Info */}
                    <div style={{ padding: '12px' }}>
                      <h3 style={{ 
                        margin: '0 0 8px 0', 
                        color: '#333',
                        fontSize: '14px',
                        fontWeight: '400',
                        lineHeight: '1.3',
                        height: '36px',
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {product.name}
                      </h3>
                      
                      {/* Price Section */}
                      <div style={{ marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                          <span style={{
                            fontSize: '16px',
                            fontWeight: 'bold',
                            color: '#ee4d2d'
                          }}>
                            ฿{(product.price * 35).toLocaleString()}
                          </span>
                          <span style={{
                            fontSize: '12px',
                            color: '#999',
                            textDecoration: 'line-through'
                          }}>
                            ฿{(product.price * 35 * 1.2).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      
                      {/* Rating and Sales */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '8px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <div style={{ display: 'flex', gap: '1px' }}>
                            {[...Array(5)].map((_, i) => (
                              <span key={i} style={{ color: '#ffa500', fontSize: '10px' }}>★</span>
                            ))}
                          </div>
                          <span style={{ color: '#666', fontSize: '11px' }}>4.9</span>
                        </div>
                        <span style={{ color: '#666', fontSize: '11px' }}>
                          ขายแล้ว {Math.floor(Math.random() * 100) + 1}
                        </span>
                      </div>
                      
                      {/* Stock Info */}
                      <div style={{
                        fontSize: '11px',
                        color: product.stock > 0 ? '#27ae60' : '#e74c3c',
                        marginBottom: '12px',
                        textAlign: 'center'
                      }}>
                        {product.stock > 0 ? `เหลือ ${product.stock} ชิ้น` : 'สินค้าหมด'}
                      </div>
                    </div>

                    {/* Admin Actions - แสดงเฉพาะใน /admin */}
                    {isAdminPage && isAdmin && (
                      <div style={{
                        display: 'flex',
                        gap: '4px',
                        padding: '0 12px 12px 12px',
                        borderTop: '1px solid #f0f0f0',
                        paddingTop: '8px'
                      }}>
                        {/* ปุ่มแก้ไข - แสดงเมื่ออยู่ใน Edit Mode หรือสินค้าหมด */}
                        {(isEditMode || product.stock === 0) && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setEditingProduct(product);
                            }}
                            style={{
                              flex: 1,
                              backgroundColor: product.stock === 0 ? '#f39c12' : '#17a2b8',
                              color: 'white',
                              border: 'none',
                              padding: '6px 8px',
                              borderRadius: '2px',
                              cursor: 'pointer',
                              fontSize: '10px',
                              fontWeight: '500'
                            }}
                          >
                            {product.stock === 0 ? '📦 เติม' : '✏️ แก้ไข'}
                          </button>
                        )}

                        {/* ปุ่มลบ - แสดงเฉพาะใน Edit Mode */}
                        {isEditMode && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDeleteProduct(product.id, product.name);
                            }}
                            disabled={isDeleting === product.id}
                            style={{
                              flex: 1,
                              backgroundColor: isDeleting === product.id ? '#6c757d' : '#dc3545',
                              color: 'white',
                              border: 'none',
                              padding: '6px 8px',
                              borderRadius: '2px',
                              cursor: isDeleting === product.id ? 'not-allowed' : 'pointer',
                              fontSize: '10px',
                              fontWeight: '500'
                            }}
                          >
                            {isDeleting === product.id ? 'ลบ...' : '🗑️ ลบ'}
                          </button>
                        )}
                      </div>
                    )}

                    {/* Helper Text for Admin */}
                    {isAdminPage && isAdmin && !isEditMode && (
                      <div style={{
                        padding: '8px 12px',
                        backgroundColor: '#f8f9fa',
                        textAlign: 'center',
                        fontSize: '10px',
                        color: product.stock === 0 ? '#e74c3c' : '#999',
                        fontStyle: 'italic',
                        borderTop: '1px solid #f0f0f0'
                      }}>
                        {product.stock === 0 ? '📦 คลิกเพื่อเติมสินค้า' : '💡 เปิดโหมดแก้ไขเพื่อจัดการ'}
                      </div>
                    )}
                    </div>
                  </a>
                ))}
              </div>
            )}
            </>
            )}
          </div>
        </section>
      </main>

      <footer style={{
        backgroundColor: '#333',
        color: 'white',
        textAlign: 'center',
        padding: '20px'
      }}>
        <p>© 2025 E-Commerce Store - Built with Spring Boot + React</p>
      </footer>

      {/* Forms - เฉพาะใน /admin */}
      {showAddForm && isAdminPage && isAdmin && (
        <AddProductForm
          onSubmit={handleAddProduct}
          onCancel={() => setShowAddForm(false)}
          isLoading={isSubmitting}
        />
      )}

      {editingProduct && isAdminPage && isAdmin && (
        <EditProductForm
          product={editingProduct}
          onSubmit={handleEditProduct}
          onCancel={() => setEditingProduct(null)}
          isLoading={isSubmitting}
        />
      )}

      {/* Cart Component */}
      <Cart
        isOpen={showCart}
        onClose={() => setShowCart(false)}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  )
}

export default App
