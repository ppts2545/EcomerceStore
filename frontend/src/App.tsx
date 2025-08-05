import { useState, useEffect, useCallback } from 'react'
import './App.css'
import Header from './components/Header/Header'
import BannerHotword from './components/Banner-Hotword/Banner-Hotword'
import CategorySection from './components/Category-innerMain-Section/Category-Section'
import AddProductForm from './components/Add Product/AddProductForm'
import EditProductForm from './components/Add Product/EditProductForm'

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
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
  }, []);

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
      setError('Failed to load products. Make sure backend is running on port 8081.');
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

  // ✅ Add to cart functionality
  const handleAddToCart = () => {
    setCartCount(prev => prev + 1);
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
        <BannerHotword />
        <CategorySection />
        
        <section style={{ padding: '20px 0' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
            
            {/* URL Info Panel */}
            <div style={{
              backgroundColor: 'white',
              padding: '10px 20px',
              borderRadius: '8px',
              marginBottom: '20px',
              textAlign: 'center',
              border: `2px solid ${isAdminPage ? '#28a745' : isProductDetailPage ? '#ff6b6b' : '#17a2b8'}`
            }}>
              <p style={{ margin: 0, fontSize: '14px' }}>
                📍 <strong>Current URL:</strong> {currentPath} 
                {isAdminPage ? (
                  <span style={{ color: '#28a745', fontWeight: 'bold' }}> - Admin Page ✅</span>
                ) : isProductDetailPage ? (
                  <span style={{ color: '#ff6b6b', fontWeight: 'bold' }}> - Product Detail Page 🛍️</span>
                ) : (
                  <span style={{ color: '#666' }}> - Guest Page (เข้า <a href="/admin" onClick={(e) => {
                    e.preventDefault();
                    window.history.pushState({}, '', '/admin');
                    setCurrentPath('/admin');
                  }} style={{ color: '#007bff' }}>/admin</a> เพื่อจัดการสินค้า)</span>
                )}
              </p>
            </div>

            {/* 🛍️ Product Detail Page */}
            {isProductDetailPage && currentProduct ? (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '30px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1', minWidth: '300px' }}>
                    <img 
                      src={currentProduct.imageUrl}
                      alt={currentProduct.name}
                      style={{
                        width: '100%',
                        maxWidth: '400px',
                        height: '300px',
                        objectFit: 'cover',
                        borderRadius: '8px'
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=No+Image';
                      }}
                    />
                  </div>
                  
                  <div style={{ flex: '1', minWidth: '300px' }}>
                    <h1 style={{ 
                      margin: '0 0 15px 0', 
                      color: '#333',
                      fontSize: '28px',
                      fontWeight: 'bold'
                    }}>
                      {currentProduct.name}
                    </h1>
                    
                    <p style={{ 
                      color: '#666', 
                      fontSize: '16px',
                      lineHeight: '1.6',
                      marginBottom: '20px'
                    }}>
                      {currentProduct.description}
                    </p>
                    
                    <div style={{ marginBottom: '20px' }}>
                      <span style={{
                        fontSize: '36px',
                        fontWeight: 'bold',
                        color: '#ee4d2d'
                      }}>
                        ${currentProduct.price}
                      </span>
                    </div>
                    
                    <div style={{ marginBottom: '20px' }}>
                      <span style={{
                        fontSize: '16px',
                        color: currentProduct.stock > 0 ? '#27ae60' : '#e74c3c',
                        fontWeight: 'bold'
                      }}>
                        {currentProduct.stock > 0 ? `✅ มีสินค้า ${currentProduct.stock} ชิ้น` : '❌ สินค้าหมด'}
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                      <button 
                        onClick={handleAddToCart}
                        disabled={currentProduct.stock === 0}
                        style={{
                          backgroundColor: currentProduct.stock > 0 ? '#ee4d2d' : '#ccc',
                          color: 'white',
                          border: 'none',
                          padding: '12px 24px',
                          borderRadius: '6px',
                          cursor: currentProduct.stock > 0 ? 'pointer' : 'not-allowed',
                          fontSize: '16px',
                          fontWeight: 'bold'
                        }}
                      >
                        {currentProduct.stock > 0 ? '🛒 เพิ่มลงตะกร้า' : '❌ สินค้าหมด'}
                      </button>
                      
                      <button 
                        onClick={() => {
                          window.history.pushState({}, '', '/');
                          setCurrentPath('/');
                        }}
                        style={{
                          backgroundColor: '#6c757d',
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
                  </div>
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
                <h2 style={{ 
                  marginBottom: '20px', 
                  color: '#333',
                  textAlign: 'center',
                  fontSize: '24px'
                }}>
                  📦 Our Products ({filteredProducts.length})
                </h2>
            
            {filteredProducts.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px',
                backgroundColor: 'white',
                borderRadius: '8px',
                margin: '20px 0'
              }}>
                <p style={{ fontSize: '18px', color: '#666' }}>
                  {products.length === 0 ? 'No products available' : 'No products found for your search'}
                </p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '20px',
                marginTop: '20px'
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
                      borderRadius: '8px',
                      padding: '15px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                    }}
                    >
                    <img 
                      src={product.imageUrl} 
                      alt={product.name}
                      style={{
                        width: '100%',
                        height: '180px',
                        objectFit: 'cover',
                        borderRadius: '4px',
                        marginBottom: '12px'
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/280x180?text=No+Image';
                      }}
                    />
                    
                    <h3 style={{ 
                      margin: '0 0 8px 0', 
                      color: '#333',
                      fontSize: '16px',
                      fontWeight: '500'
                    }}>
                      {product.name}
                    </h3>
                    
                    <p style={{ 
                      color: '#666', 
                      fontSize: '13px',
                      marginBottom: '12px'
                    }}>
                      {product.description}
                    </p>
                    
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '10px'
                    }}>
                      <span style={{
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: '#ee4d2d'
                      }}>
                        ${product.price}
                      </span>
                      
                      <span style={{
                        fontSize: '12px',
                        color: product.stock > 0 ? '#27ae60' : '#e74c3c',
                        marginLeft: '8px'
                      }}>
                        {product.stock > 0 ? `มีสินค้า ${product.stock} ชิ้น` : 'สินค้าหมด'}
                      </span>
                      
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleAddToCart();
                        }}
                        disabled={product.stock === 0}
                        style={{
                          backgroundColor: product.stock > 0 ? '#ee4d2d' : '#ccc',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          cursor: product.stock > 0 ? 'pointer' : 'not-allowed',
                          fontSize: '12px'
                        }}
                      >
                        {product.stock > 0 ? '🛒 Add to Cart' : '❌ สินค้าหมด'}
                      </button>
                    </div>

                    {/* Admin Actions - แสดงเฉพาะใน /admin */}
                    {isAdminPage && isAdmin && (
                      <div style={{
                        display: 'flex',
                        gap: '8px',
                        marginTop: '8px',
                        paddingTop: '8px',
                        borderTop: '1px solid #f0f0f0'
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
                              padding: '6px 12px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '11px'
                            }}
                          >
                            {product.stock === 0 ? '📦 เติมสินค้า' : '✏️ แก้ไข'}
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
                              padding: '6px 12px',
                              borderRadius: '4px',
                              cursor: isDeleting === product.id ? 'not-allowed' : 'pointer',
                              fontSize: '11px'
                            }}
                          >
                            {isDeleting === product.id ? 'ลบ...' : '🗑️ ลบ'}
                          </button>
                        )}
                      </div>
                    )}

                    {/* Helper Text */}
                    {isAdminPage && isAdmin && !isEditMode && product.stock > 0 && (
                      <div style={{
                        marginTop: '8px',
                        paddingTop: '8px',
                        borderTop: '1px solid #f0f0f0',
                        textAlign: 'center',
                        fontSize: '11px',
                        color: '#999',
                        fontStyle: 'italic'
                      }}>
                        💡 เปิดโหมดแก้ไขเพื่อจัดการสินค้า
                      </div>
                    )}

                    {/* Helper Text สำหรับสินค้าหมด */}
                    {isAdminPage && isAdmin && !isEditMode && product.stock === 0 && (
                      <div style={{
                        marginTop: '8px',
                        paddingTop: '8px',
                        borderTop: '1px solid #f0f0f0',
                        textAlign: 'center',
                        fontSize: '11px',
                        color: '#e74c3c',
                        fontStyle: 'italic'
                      }}>
                        📦 สินค้าหมด - คลิกปุ่มเติมสินค้าเพื่ออัปเดต Stock
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
