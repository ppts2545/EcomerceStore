import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AddProductForm, { type SubmitPayload } from "../components/Add Product/AddProductForm";
import AuthService, { type User } from "../services/AuthService";
import "../styles/StorePage.css";

/* ================= Helpers & Config ================= */
const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");
const toAbsolute = (u?: string): string => {
  if (!u) return "";
  if (/^(https?:|data:|blob:)/i.test(u)) return u;
  return API_BASE ? `${API_BASE}/${u.replace(/^\/+/, "")}` : `/${u.replace(/^\/+/, "")}`;
};
const FALLBACK_188 =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="188" height="188"><rect width="100%" height="100%" fill="%23f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-family="Arial" font-size="14">No Image</text></svg>';

const toNumber = (v: unknown) => {
  const n = typeof v === "string" ? parseFloat(v) : (v as number);
  return Number.isFinite(n) ? n : 0;
};
const nfTHB = new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 2 });
const formatTHB = (v: unknown) => nfTHB.format(toNumber(v));

/* ================= Types ================= */
type Store = {
  id: number;
  name: string;
  description?: string;
  logoUrl?: string;
  phone?: string;
  email?: string;
  owner?: { id: number };
};
type Product = {
  id: number;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  storeId?: number;
  store?: { id: number };
  mediaItems?: Array<{ type: "image" | "video"; url: string }>;
};

/* ================= Consts ================= */
const PRODUCTS_PER_PAGE = 48;
type SortMode = "popular" | "new" | "price_asc" | "price_desc";

const pickImage = (p: any): string | undefined =>
  p.imageUrl ||
  p.productImageUrl ||
  p.image ||
  p.imageURL ||
  (Array.isArray(p.mediaItems) && p.mediaItems.find((m: any) => m.type === "image")?.url);

const StorePage = () => {
  const { storeId } = useParams();
  const navigate = useNavigate();
  const SID = Number(storeId);

  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sort, setSort] = useState<SortMode>("popular");
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const isOwnerOrAdmin = useMemo(() => {
    if (!currentUser || !store) return false;
    return currentUser.role === "ADMIN" || currentUser.id === store.owner?.id;
  }, [currentUser, store]);

  useEffect(() => {
    AuthService.getCurrentUser().then(setCurrentUser).catch(() => setCurrentUser(null));
  }, []);

  /* ============ ADD PRODUCT (multipart/form-data) ============ */
  const handleAddProduct = async (product: SubmitPayload) => {
    if (!SID) return;

    const fd = new FormData();
    fd.append("name", product.name);
    fd.append("description", product.description);
    fd.append("price", String(product.price));
    fd.append("stock", String(product.stock));
    fd.append("storeId", String(SID));
    (product.tags || []).forEach((t) => fd.append("tagNames", t));
    if (product.imageFile) fd.append("imageFile", product.imageFile);
    (product.media || []).forEach((m, i) => {
      if (m.file) {
        fd.append("mediaFiles", m.file);
        fd.append("mediaTypes", m.type);
        fd.append("mediaAlts", m.alt ?? "");
        fd.append("mediaDisplayOrders", String(i + 1));
      }
    });

    const res = await fetch(`/api/products`, { method: "POST", body: fd, credentials: "include" });
    if (!res.ok) {
      alert("เพิ่มสินค้าไม่สำเร็จ");
      return;
    }
    setShowAddModal(false);
    await fetchProducts(); // refresh list
  };

  /* ================= FETCH (เฉพาะของร้านนี้) ================= */
  const fetchProducts = async () => {
    const res = await fetch(`/api/products/store/${SID}`, { credentials: "include" });
    if (!res.ok) {
      setProducts([]);
      return;
    }
    const raw = await res.json();
    const normalized: Product[] = (Array.isArray(raw) ? raw : []).map((p: any) => ({
      ...p,
      price: toNumber(p.price),
      imageUrl: pickImage(p),
    }));

    // กันผิดฝั่ง: filter ด้วย storeId/store.id อีกชั้น
    const onlyMine = normalized.filter(
      (p) => p.storeId === SID || p.store?.id === SID
    );

    setProducts(onlyMine);
  };

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      const s = await fetch(`/api/stores/${SID}`, { credentials: "include" });
      if (!cancelled && s.ok) setStore(await s.json());
      if (!cancelled) await fetchProducts();
      if (!cancelled) setLoading(false);
    };
    run();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [SID]);

  /* ================= SORT / PAGINATION ================= */
  const sortedProducts = useMemo(() => {
    const arr = [...products];
    switch (sort) {
      case "new":        arr.sort((a, b) => b.id - a.id); break;
      case "price_asc":  arr.sort((a, b) => a.price - b.price); break;
      case "price_desc": arr.sort((a, b) => b.price - a.price); break;
      default: break;
    }
    return arr;
  }, [products, sort]);

  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / PRODUCTS_PER_PAGE));
  useEffect(() => { if (currentPage > totalPages) setCurrentPage(totalPages); }, [totalPages, currentPage]);

  if (loading) {
    return (
      <div className="store-page">
        <div className="store-header skeleton-header" />
        <div className="store-products-grid store-products-grid-6col">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="store-product-card skeleton-card">
              <div className="store-product-img skeleton-box" />
              <div className="store-product-info">
                <div className="skeleton-line w60" />
                <div className="skeleton-line w40" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (!store) return <div className="store-notfound">Store not found</div>;

  const startIdx = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const productsToShow = sortedProducts.slice(startIdx, startIdx + PRODUCTS_PER_PAGE);

  return (
    <div className="store-page">
      {/* Header */}
      <div className="store-header">
        <div className="store-banner" />
        <div className="store-meta">
          <div className="store-avatar">
            {store.logoUrl ? (
              <img
                src={toAbsolute(store.logoUrl)}
                alt="logo"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><rect width='100%' height='100%' rx='12' fill='%23e5e7eb'/></svg>";
                }}
              />
            ) : (<div className="avatar-fallback">🏬</div>)}
          </div>
          <div className="store-info">
            <h1 className="store-name">{store.name}</h1>
            {store.description && <p className="store-desc">{store.description}</p>}
            <div className="store-contact">
              {store.email && <span>Email: {store.email}</span>}
              {store.phone && <span> • Phone: {store.phone}</span>}
            </div>
          </div>
          <div className="store-stats">
            <div className="stat"><div className="stat-val">{products.length}</div><div className="stat-label">จำนวนสินค้า</div></div>
            <div className="stat"><div className="stat-val">—</div><div className="stat-label">ผู้ติดตาม</div></div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="store-toolbar">
        <div className="toolbar-left">
          <span className="toolbar-label">เรียงตาม:</span>
          <div className="sort-group">
            <button className={`sort-chip ${sort === "popular" ? "active" : ""}`} onClick={() => setSort("popular")}>ความนิยม</button>
            <button className={`sort-chip ${sort === "new" ? "active" : ""}`} onClick={() => setSort("new")}>ใหม่ล่าสุด</button>
            <button className={`sort-chip ${sort === "price_asc" ? "active" : ""}`} onClick={() => setSort("price_asc")}>ราคา ⬆︎</button>
            <button className={`sort-chip ${sort === "price_desc" ? "active" : ""}`} onClick={() => setSort("price_desc")}>ราคา ⬇︎</button>
          </div>
        </div>
        {isOwnerOrAdmin && (
          <div className="toolbar-right">
            <button className="add-product-btn" onClick={() => setShowAddModal(true)}>+ เพิ่มสินค้า</button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <AddProductForm onSubmit={handleAddProduct} onCancel={() => setShowAddModal(false)} />
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="store-products-grid store-products-grid-6col">
        {productsToShow.length === 0 ? (
          <div className="store-empty">ร้านค้านี้ยังไม่มีสินค้า</div>
        ) : (
          productsToShow.map((p) => {
            const img = toAbsolute(p.imageUrl) || FALLBACK_188;
            return (
              <div className="store-product-card" key={p.id} onClick={() => navigate(`/product/${p.id}`)}>
                <div className="store-product-img-wrap">
                  <img
                    src={img}
                    alt={p.name}
                    className="store-product-img"
                    crossOrigin="anonymous"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_188; }}
                  />
                </div>
                <div className="store-product-info">
                  <div className="store-product-name">{p.name}</div>
                  <div className="store-product-bottom">
                    <div className="store-product-price">{formatTHB(p.price)}</div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="pagination-bar" aria-label="pagination">
          <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="pagination-btn nav">‹</button>
          {Array.from({ length: totalPages }).map((_, i) => {
            const page = i + 1;
            if (page === 1 || page === totalPages || Math.abs(page - currentPage) <= 2) {
              return (
                <button key={page} className={`pagination-btn${currentPage === page ? " active" : ""}`} onClick={() => setCurrentPage(page)}>{page}</button>
              );
            }
            if (page === 2 && currentPage > 4) return <span key="s-..." className="pagination-ellipsis">…</span>;
            if (page === totalPages - 1 && currentPage < totalPages - 3) return <span key="e-..." className="pagination-ellipsis">…</span>;
            return null;
          })}
          <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="pagination-btn nav">›</button>
        </nav>
      )}
    </div>
  );
};

export default StorePage;