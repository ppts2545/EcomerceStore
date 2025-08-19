import React, { useEffect, useState, useCallback } from 'react';
// ...existing code...
import './App.css';
import Header from './components/Header/Header';
import BannerHotword from './components/Banner-Hotword/Banner-Hotword';
import CategorySection from './components/Category-innerMain-Section/CategorySection';
import AddProductForm, { type SubmitPayload } from './components/Add Product/AddProductForm';
import EditProductForm from './components/Add Product/EditProductForm';
import AuthModal from './components/Auth/AuthModal';
import Cart from './components/Cart/Cart';
import ProductRating from './components/Product Rating/ProductRating';
import AdminDashboard from './components/Admin/AdminDashboard';
import AuthService, { type User } from './services/AuthService';
import CartService from './services/CartService';
import SessionService from './services/SessionService';
import ProductDetail from './components/ProductDetail/ProductDetail';
import Pagination from './components/Pagination/Pagination';

// =========================
// Config
// =========================
const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8082');
const ABS_API = API_BASE.replace(/\/$/, '');
// Neutral placeholder (only used if DB has no image or image fails)
const PLACEHOLDER_IMG =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><rect width="100%" height="100%" fill="%23f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-family="Arial" font-size="20">No Image</text></svg>';

// =========================
// Types
// =========================
interface MediaItem {
  id: string | number;
  type: 'image' | 'video';
  url: string;
  file?: File; // optional when coming from backend
  thumbnail?: string;
  alt?: string;
  displayOrder?: number;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;            // THB directly for UI
  imageUrl: string;         // absolute URL (normalized)
  stock: number;
  sold?: number;            // จำนวนขาย (optional for compatibility)
  tags?: { id: number; name: string }[];
  mediaItems?: MediaItem[];

  // ✅ เพิ่มฟิลด์เกี่ยวกับร้านค้า
  storeId?: number;
  storeName?: string;
}

// =========================
/** Helpers: images & product normalization */
// =========================
const pickRawImage = (p: any): string | undefined => {
  return (
    p.imageUrl ??
    p.imageURL ??
    p.image ??
    p.image_path ??
    p.imagePath ??
    p.thumbnailUrl ??
    p.thumbnail ??
    (Array.isArray(p.mediaItems) && p.mediaItems.find((m: any) => m.type === 'image')?.url)
  );
};

const toAbsoluteUrl = (u?: string): string => {
  if (!u) return '';
  if (/^(https?:|data:|blob:)/i.test(u)) return u; // already absolute/data
  return `${ABS_API}/${u.replace(/^\/+/, '')}`; // ensure absolute with API base
};

const normalizeImageUrl = (p: any): string => {
  const raw = pickRawImage(p);
  return toAbsoluteUrl(raw);
};

const mapBackendMedia = (p: any): MediaItem[] | undefined => {
  const rawList: any[] | undefined = Array.isArray(p.mediaItems)
    ? p.mediaItems
    : Array.isArray(p.media)
    ? p.media
    : undefined;
  if (!rawList) return undefined;
  return rawList.map((m: any, idx: number): MediaItem => ({
    id: m.id ?? `m-${p.id}-${idx}`,
    type:
      m.type === 'image' || m.type === 'video'
        ? m.type
        : /(mp4|webm|ogg)$/i.test(String(m.url || m.path || m.src || ''))
        ? 'video'
        : 'image',
    url: toAbsoluteUrl(m.url || m.path || m.src),
    thumbnail: toAbsoluteUrl(m.thumbnail),
    alt: m.alt,
    displayOrder: m.displayOrder ?? idx,
  }));
};

// ✅ ปรับ normalize ให้รองรับข้อมูลร้านหลายรูปแบบ
const normalizeProduct = (p: any): Product => {
  const mediaItems = mapBackendMedia(p);

  // take DB imageUrl (or image...) as primary; do NOT inject demo images
  let imageUrl = normalizeImageUrl({ ...p, mediaItems });
  if (!imageUrl) {
    const firstImg = mediaItems?.find((m) => m.type === 'image')?.url;
    imageUrl = toAbsoluteUrl(firstImg) || '';
  }

  // รองรับทั้ง p.storeId, p.store_id, p.store?.id
  const rawStoreId = p.storeId ?? p.store_id ?? p.store?.id;
  const storeId = Number(rawStoreId);
  const storeName = p.store?.name ?? p.storeName ?? undefined;

  return {
    id: Number(p.id),
    name: p.name ?? '',
    description: p.description ?? '',
    price: Number(p.price) || 0,
    imageUrl,
    stock: Number(p.stock) ?? 0,
    tags: p.tags,
    mediaItems,
    storeId: Number.isFinite(storeId) && storeId > 0 ? storeId : undefined,
    storeName,
  };
};

const parseProductsPayload = (payload: any): any[] => {
  // Accept either array or { products: [...] }
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.products)) return payload.products;
  return [];
};

// =========================
// ✅ Randomize & Filter helpers (เฉพาะสินค้าที่มีร้าน และกระจายตามร้าน)
// =========================
const hasStoreLink = (p: Product) => Boolean(p.storeId);

// Fisher–Yates shuffle
const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// กระจายแบบยุติธรรม (จำกัดต่อร้าน) แล้วสุ่มรวม
const pickRandomPerStore = (
  items: Product[],
  perStore = 6,    // ต่อร้านสูงสุด
  maxTotal = 240   // ทั้งหมดสูงสุด
): Product[] => {
  const byStore = new Map<number, Product[]>();
  for (const p of items) {
    if (!p.storeId) continue;
    if (!byStore.has(p.storeId)) byStore.set(p.storeId, []);
    byStore.get(p.storeId)!.push(p);
  }

  const bucketed: Product[] = [];
  for (const [, list] of byStore) {
    const s = shuffle(list);
    bucketed.push(...s.slice(0, perStore));
  }
  return shuffle(bucketed).slice(0, maxTotal);
};

function App() {
  // ===== Buy Now Handler =====
  const handleBuyNow = (productId: number) => {
    handleAddToCart(productId, 1);
    setShowCart(true);
  };

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
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);

  // 🔐 Authentication states
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // 🛒 Cart states
  const [showCart, setShowCart] = useState(false);

  // 🛣️ Routing helpers
  const isAdminPage = currentPath === '/admin';
  const isProductDetailPage = !!currentProduct;

  // 🔐 Admin guard
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

  const handleAdminLogout = useCallback(() => {
    setIsAdmin(false);
    setIsEditMode(false);
    alert('✅ ออกจากระบบ Admin แล้ว');
    window.history.pushState({}, '', '/');
    setCurrentPath('/');
  }, []);

  // 🎯 Listen to URL changes (basic router)
  useEffect(() => {
    const handleLocationChange = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Auto admin mode
  useEffect(() => {
    if (isAdminPage && !isAdmin) {
      handleAdminLogin();
    } else if (!isAdminPage && isAdmin) {
      handleAdminLogout();
    }
  }, [isAdminPage, isAdmin, handleAdminLogin, handleAdminLogout]);

  // Initial boot
  useEffect(() => {
    fetchProducts();
    loadCurrentUser();
    AuthService.startAutoKeepAliveWithControl?.();

    return () => {
      AuthService.stopAutoKeepAlive?.();
      SessionService.stopSessionMonitoring();
    };
  }, []);

  // 🔐 Load current user & session monitoring
  const loadCurrentUser = async () => {
    try {
      const currentUser = await AuthService.getCurrentUser();
      setUser(currentUser);
      if (currentUser) {
        SessionService.startSessionMonitoring(() => {
          setUser(null);
          setCartCount(0);
          alert('⚠️ เซสชันของคุณหมดอายุแล้ว กรุณาเข้าสู่ระบบใหม่อีกครั้ง');
        });
      } else {
        SessionService.stopSessionMonitoring();
      }
    } catch (err) {
      console.error('Error loading user:', err);
      SessionService.stopSessionMonitoring();
    }
  };

  // Auth handlers
  const handleLogin = async (email: string, password: string) => {
    const response = await AuthService.login({ email, password });
    if (response.success && response.user) {
      setUser(response.user);
      setShowAuthModal(false);
      SessionService.startSessionMonitoring(() => {
        setUser(null);
        setCartCount(0);
        alert('⚠️ เซสชันของคุณหมดอายุแล้ว กรุณาเข้าสู่ระบบใหม่อีกครั้ง');
      });
      alert(`✅ ยินดีต้อนรับ ${response.user.firstName}!`);
    } else {
      throw new Error(response.message || 'การเข้าสู่ระบบล้มเหลว');
    }
  };

  const handleRegister = async (userData: { email: string; password: string; firstName: string; lastName: string; phoneNumber?: string }) => {
    const response = await AuthService.register(userData);
    if (response.success && response.user) {
      setUser(response.user);
      setShowAuthModal(false);
      SessionService.startSessionMonitoring(() => {
        setUser(null);
        setCartCount(0);
        alert('⚠️ เซสชันของคุณหมดอายุแล้ว กรุณาเข้าสู่ระบบใหม่อีกครั้ง');
      });
      alert(`✅ สมัครสมาชิกสำเร็จ! ยินดีต้อนรับ ${response.user.firstName}!`);
    } else {
      throw new Error(response.message || 'การสมัครสมาชิกล้มเหลว');
    }
  };

  const handleLogout = async () => {
    try {
      SessionService.stopSessionMonitoring();
      await AuthService.logout();
      setUser(null);
      setCartCount(0);
    } catch {
      console.error('Logout error');
      setUser(null);
      setCartCount(0);
      alert('✅ ออกจากระบบเรียบร้อยแล้ว');
    }
  };

  // Cart
  const updateCartCount = async () => {
    try {
      setCartCount(await CartService.getCartCount());
    } catch (err) {
      console.error('Error updating cart count:', err);
    }
  };

  const loadCartItems = useCallback(async () => {
    if (!user) return;
    try {
      await CartService.getCartItems();
    } catch (err) {
      console.error('Error loading cart items:', err);
    }
  }, [user]);

  const handleAddToCart = async (productId: number, quantity = 1) => {
    if (!user) {
      setShowAuthModal(true);
      alert('กรุณาเข้าสู่ระบบก่อนเพิ่มสินค้าลงตะกร้า');
      return;
    }
    try {
      await CartService.addToCart(productId, quantity);
      await updateCartCount();
      alert('✅ เพิ่มสินค้าลงตะกร้าเรียบร้อยแล้ว!');
    } catch (err) {
      console.error('Error adding product to cart:', err);
      alert('❌ ไม่สามารถเพิ่มสินค้าลงตะกร้าได้');
    }
  };

  useEffect(() => {
    if (user) {
      loadCartItems();
      updateCartCount();
    } else {
      setCartCount(0);
    }
  }, [user, loadCartItems]);

  // =========================
  // Data Fetching (robust JSON parsing, DB images only)
  // =========================
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/products`, {
        headers: { Accept: 'application/json, text/plain, */*' },
        credentials: 'include', // ✅ แนบคุกกี้ถ้ามี
      });
      const raw = await res.text();
      if (!res.ok) throw new Error(`HTTP ${res.status} ${raw.slice(0, 180)}`);
      if (/<!doctype html>|<html/i.test(raw)) throw new Error('Server responded with HTML instead of JSON');

      const cleaned = raw
        .replace(/^[\uFEFF\xEF\xBB\xBF\s]*/, '') // strip BOM/whitespace
        .replace(/^\)\]\}',?\s*/, '') // angular/json prefix
        .replace(/,(\s*[\]\}])/g, '$1'); // trailing commas guard

      let parsed: any;
      try {
        parsed = JSON.parse(cleaned);
      } catch (e) {
        console.error('❌ Invalid JSON from server (raw):', raw);
        throw new Error('Invalid JSON returned by server');
      }

      const arr = parseProductsPayload(parsed);
      const normalized: Product[] = arr.map((p: any) => normalizeProduct(p));

      // ✅ แสดงเฉพาะสินค้าที่ “มีร้าน”
      const onlyStore = normalized.filter(hasStoreLink);

      // ✅ กระจายแบบยุติธรรม (ต่อร้านไม่เกิน X) + สุ่มรวม
      const randomized = pickRandomPerStore(onlyStore, 6, 240);

      setProducts(randomized);
      setFilteredProducts(randomized);
      setPage(1); // ✅ เริ่มหน้าแรกเมื่อโหลดสินค้า
      console.log('✅ Products (random & with store only):', randomized);
    } catch (err) {
      console.error('❌ Error fetching products:', err);
      setError('Failed to load products. Make sure backend is running on the configured API base.');
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // UI Helpers
  // =========================
  const handleCategorySelect = (category: string) => {
    setPage(1);
    if (!category) {
      setFilteredProducts(products);
      return;
    }
    const filtered = products.filter((p) => p.tags?.some((t) => t.name === category));
    setFilteredProducts(filtered);
  };

  const handleSearch = (query: string) => {
    setPage(1);
    if (!query.trim()) {
      setFilteredProducts(products);
      return;
    }
    const q = query.toLowerCase();
    const filtered = products.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    setFilteredProducts(filtered);
  };

  const handleToggleEditMode = () => {
    if (!isAdminPage) {
      alert('❌ ต้องอยู่ในหน้า /admin เท่านั้น');
      return;
    }
    if (!isAdmin) {
      handleAdminLogin();
      return;
    }
    setIsEditMode((s) => !s);
  };

  // =========================
  // --- Pagination ---
  // =========================
  const PAGE_SIZE = 48;
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const pageStart = (page - 1) * PAGE_SIZE;
  const pageItems = filteredProducts.slice(pageStart, pageStart + PAGE_SIZE);

  // ถ้าจำนวนสินค้าหลังกรองเปลี่ยนจนหน้าเกิน ให้ดึงกลับมาที่หน้าสุดท้าย
  useEffect(() => {
    const newTotal = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
    if (page > newTotal) setPage(newTotal);
  }, [filteredProducts.length]); // ไม่จำเป็นต้องใส่ page เป็น dependency

  // =========================
  // CRUD: Add / Edit / Delete
  // =========================
  const handleAddProduct = async (payload: SubmitPayload) => {
    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append('name', payload.name.trim());
      data.append('description', payload.description.trim());
      data.append('price', String(payload.price));
      data.append('stock', String(payload.stock));
      payload.tags.forEach((tag) => data.append('tags[]', tag));
      if (payload.imageFile) data.append('imageFile', payload.imageFile);
      if (payload.media?.length) {
        payload.media.forEach((m, idx) => {
          if (m.file) data.append('mediaFiles[]', m.file, m.file.name || `media_${idx}`);
          data.append('mediaTypes[]', m.type);
          data.append('mediaAlts[]', m.alt || '');
          data.append('mediaDisplayOrders[]', String(idx));
        });
      }

      const res = await fetch(`${API_BASE}/api/products/upload`, {
        method: 'POST',
        body: data,
        credentials: 'include', // ✅ แนบคุกกี้
      });
      if (!res.ok) {
        const text = await res.text();
        alert('❌ เพิ่มสินค้าไม่สำเร็จ: ' + (text || `HTTP ${res.status}`));
        throw new Error(text || `HTTP ${res.status}`);
      }
      const raw = await res.json();
      const normalizedNew = normalizeProduct(raw);

      // ถ้าไม่มีร้าน จะไม่ถูกแสดงในหน้า Home (ตามกฎ)
      setProducts((prev) => (normalizedNew.storeId ? [normalizedNew, ...prev] : prev));
      setFilteredProducts((prev) => (normalizedNew.storeId ? [normalizedNew, ...prev] : prev));
      setShowAddForm(false);
      setPage(1);
      alert(`✅ เพิ่มสินค้า "${normalizedNew.name}" สำเร็จ!`);
    } catch (err) {
      console.error('❌ Error adding product:', err);
      alert('❌ เกิดข้อผิดพลาดในการเพิ่มสินค้า กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditProduct = async (productData: Omit<Product, 'id'>) => {
    if (!isAdminPage || !isAdmin) {
      alert('❌ ต้องเป็น Admin ในหน้า /admin เท่านั้น');
      return;
    }
    if (!editingProduct) return;

    setIsSubmitting(true);
    try {
      const editable = {
        name: productData.name.trim(),
        description: productData.description.trim(),
        price: Number(productData.price),
        stock: Number(productData.stock),
        tags: (productData.tags ?? []).map((t) => t.name),
      };

      const res = await fetch(`${API_BASE}/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editable),
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const raw = await res.json();
      const updated = normalizeProduct(raw);

      setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setFilteredProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setEditingProduct(null);
      alert(`✅ แก้ไขสินค้า "${updated.name}" สำเร็จ!`);
      await fetchProducts(); // โหลดสินค้าใหม่ทันที (ให้สุ่มใหม่ตามกฎ)
    } catch (err) {
      console.error('Error updating product:', err);
      alert('❌ เกิดข้อผิดพลาดในการแก้ไขสินค้า กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (productId: number, productName: string) => {
    if (!isAdminPage || !isAdmin || !isEditMode) {
      alert('❌ ต้องเป็น Admin ในหน้า /admin และเปิดโหมดแก้ไขเท่านั้น');
      return;
    }
    if (!window.confirm(`คุณแน่ใจหรือไม่ที่จะลบสินค้า "${productName}"?`)) return;

    setIsDeleting(productId);
    try {
      const res = await fetch(`${API_BASE}/api/products/${productId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      setFilteredProducts((prev) => prev.filter((p) => p.id !== productId));
      alert(`✅ ลบสินค้า "${productName}" สำเร็จ!`);
      await fetchProducts(); // รีเฟรช + สุ่มใหม่
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('❌ เกิดข้อผิดพลาดในการลบสินค้า กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsDeleting(null);
    }
  };

  // =========================
  // Render
  // =========================
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: 18 }}>
        🔄 Loading products...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          padding: 20,
          textAlign: 'center',
        }}
      >
        <h2 style={{ color: '#e74c3c' }}>❌ Error</h2>
        <p>{error}</p>
        <button
          onClick={fetchProducts}
          style={{ padding: '10px 20px', backgroundColor: '#1677ff', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', marginTop: 10 }}
        >
          🔄 Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      {isAdminPage && isAdmin && user?.role === 'ADMIN' ? (
        <AdminDashboard />
      ) : (
        <>
          <Header
            cartCount={cartCount}
            onSearch={handleSearch}
            onAddProduct={() => setShowAddForm(true)}
            isAdmin={isAdmin && isAdminPage}
            user={user}
            onLoginClick={() => setShowAuthModal(true)}
            onLogout={handleLogout}
            onCartClick={() => setShowCart(true)}
          />

          {/* Admin Control Bar */}
          {isAdminPage && (
            <div
              style={{
                backgroundColor: isAdmin ? (isEditMode ? '#28a745' : '#17a2b8') : '#6c757d',
                color: 'white',
                padding: '10px 0',
                textAlign: 'center',
                borderBottom: '2px solid rgba(255,255,255,0.2)',
              }}
            >
              <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 15 }}>
                  <div style={{ fontSize: 14, fontWeight: 'bold' }}>
                    {!isAdmin ? '🔒 Admin Page - กรุณาเข้าสู่ระบบ' : isEditMode ? '✏️ Edit Mode - สามารถแก้ไข/ลบสินค้าได้' : '👤 Admin Mode - พร้อมจัดการสินค้า'}
                  </div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    {!isAdmin ? (
                      <button
                        onClick={handleAdminLogin}
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          color: 'white',
                          border: '2px solid rgba(255,255,255,0.3)',
                          padding: '8px 16px',
                          borderRadius: 20,
                          cursor: 'pointer',
                          fontSize: 13,
                          fontWeight: 'bold',
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
                            borderRadius: 20,
                            cursor: 'pointer',
                            fontSize: 13,
                            fontWeight: 'bold',
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
                            borderRadius: 20,
                            cursor: 'pointer',
                            fontSize: 13,
                            fontWeight: 'bold',
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
            {!isProductDetailPage && (
              <>
                <BannerHotword />
                <CategorySection onCategorySelect={handleCategorySelect} />
              </>
            )}

            <section style={{ padding: isProductDetailPage ? '20px 0' : '40px 0', backgroundColor: isProductDetailPage ? '#fff' : '#f8fafc' }}>
              <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 15px' }}>
                {isProductDetailPage ? (
                  <ProductDetail product={currentProduct || null} onAddToCart={handleAddToCart} onCartClick={() => setShowCart(true)} loading={loading} />
                ) : (
                  <>
                    <div
                      style={{
                        backgroundColor: 'white',
                        padding: 20,
                        borderRadius: 8,
                        marginBottom: 20,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        border: '1px solid #e0e0e0',
                      }}
                    >
                      <h2
                        style={{
                          margin: '0 0 10px 0',
                          color: '#ee4d2d',
                          textAlign: 'left',
                          fontSize: 18,
                          fontWeight: 500,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                        }}
                      >
                        🎲 แนะนำจากหลายร้าน
                        <span style={{ fontSize: 14, color: '#666', fontWeight: 'normal' }}>({filteredProducts.length} รายการ)</span>
                      </h2>

                      {/* ===== Product Grid (pageItems) ===== */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(188px, 1fr))', gap: 15, marginTop: 15 }}>
                        {pageItems.length === 0 ? (
                          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 40, color: '#666' }}>ไม่มีสินค้าให้แสดง</div>
                        ) : (
                          pageItems.map((product) => (
                            <div
                              key={product.id}
                              style={{
                                background: '#fff',
                                borderRadius: 8,
                                boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
                                border: '1px solid #ececec',
                                padding: 12,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                cursor: 'pointer',
                                transition: 'box-shadow 0.18s',
                                position: 'relative',
                                minHeight: 340,
                              }}
                              onClick={() => {
                                setCurrentProduct(product);
                                window.history.pushState({}, '', `/product/${product.id}`);
                                setCurrentPath(`/product/${product.id}`);
                              }}
                            >
                              <img
                                src={product.imageUrl || PLACEHOLDER_IMG}
                                alt={product.name}
                                style={{
                                  width: 160,
                                  height: 160,
                                  objectFit: 'cover',
                                  borderRadius: 6,
                                  background: '#f3f4f6',
                                  marginBottom: 12,
                                  border: '1px solid #eee',
                                }}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = PLACEHOLDER_IMG;
                                }}
                              />
                              <div style={{ fontWeight: 500, fontSize: 15, color: '#222', marginBottom: 4, textAlign: 'center', minHeight: 38, maxHeight: 38, overflow: 'hidden' }}>
                                {product.name}
                              </div>
                              {/* Rating and sold */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                <ProductRating productId={product.id} size="small" showCount />
                                <span style={{ color: '#888', fontSize: 13 }}>
                                  {product.sold !== undefined ? `${product.sold} ขายแล้ว` : ''}
                                </span>
                              </div>
                              <div style={{ color: '#ee4d2d', fontWeight: 700, fontSize: 17, marginBottom: 8 }}>
                                ฿{product.price.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                              </div>
                              {isAdmin && isAdminPage && isEditMode && (
                                <button
                                  style={{
                                    position: 'absolute',
                                    top: 10,
                                    right: 10,
                                    background: '#ffc107',
                                    color: '#222',
                                    border: 'none',
                                    borderRadius: 16,
                                    padding: '2px 10px',
                                    fontSize: 12,
                                    cursor: 'pointer',
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingProduct(product);
                                  }}
                                >
                                  แก้ไข
                                </button>
                              )}
                            </div>
                          ))
                        )}
                      </div>

                      {/* ใต้กริดสินค้า */}
                      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
                        <Pagination
                          currentPage={page}
                          totalPages={totalPages}
                          onPageChange={setPage}
                        />
                      </div>
                    </div>
                  </>
                )}

                {showAddForm && isAdmin && <AddProductForm onSubmit={handleAddProduct} onCancel={() => setShowAddForm(false)} isLoading={isSubmitting} />}

                {editingProduct && isAdmin && (
                  <EditProductForm
                    product={editingProduct}
                    onSubmit={handleEditProduct}
                    onCancel={() => setEditingProduct(null)}
                    onDelete={handleDeleteProduct}
                  />
                )}
              </div>
            </section>
          </main>

          {showAuthModal && <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onLogin={handleLogin} onRegister={handleRegister} />}

          {showCart && <Cart isOpen={showCart} onClose={() => setShowCart(false)} />}
        </>
      )}
    </div>
  );
}

export default App;