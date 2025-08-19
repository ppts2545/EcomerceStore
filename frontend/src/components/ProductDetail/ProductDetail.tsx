import React, { useEffect, useMemo, useRef, useState } from "react";
import ProductComments from "../ProductComments/ProductComments";
import ProductReviewList from "../Product/ProductReviewList";
import ProductReviewForm from "../Product/ProductReviewForm";
import "./ProductDetail.css";

/* ========= Types ========= */
interface MediaItem {
  id: string | number;
  type: "image" | "video";
  url: string;
  thumbnail?: string;
  alt?: string;
  displayOrder?: number;
}
interface StoreLite {
  id: number;
  name: string;
  logoUrl?: string;
  rating?: number;
  followerCount?: number;
}
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
  category?: string;
  mediaItems?: MediaItem[];
  store?: StoreLite;
  options?: { label: string; values: string[] }[];
}

/* ========= Helpers ========= */
const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");
const toAbsolute = (u?: string): string => {
  if (!u) return "";
  if (/^(https?:|data:|blob:)/i.test(u)) return u;
  return API_BASE ? `${API_BASE}/${u.replace(/^\/+/, "")}` : `/${u.replace(/^\/+/, "")}`;
};
const FALLBACK_MAIN =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600'><rect width='100%' height='100%' fill='%23f3f4f6'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='Arial' font-size='18'>No Image</text></svg>";
const FALLBACK_THUMB =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='88' height='88'><rect width='100%' height='100%' fill='%23f3f4f6'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='Arial' font-size='10'>No Image</text></svg>";
const formatTHB = (n: number) => "฿" + n.toLocaleString("th-TH");

/* ========= Props ========= */
interface ProductDetailProps {
  product: Product | null;
  onAddToCart: (productId: number, quantity: number) => void;
  onCartClick?: () => void;
  loading?: boolean;
}

/* ========= Component ========= */
const ProductDetail: React.FC<ProductDetailProps> = ({
  product,
  onAddToCart,
  onCartClick,
  loading = false,
}) => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // thumbs slider
  const trackRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);
  const syncArrows = () => {
    const el = trackRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 0);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };
  const scrollByStep = (dir: "left" | "right") => {
    const el = trackRef.current;
    if (!el) return;
    const step = el.clientWidth * 0.9;
    el.scrollBy({ left: dir === "left" ? -step : step, behavior: "smooth" });
  };
  const ensureVisible = (idx: number) => {
    const el = trackRef.current;
    if (!el) return;
    const child = el.children[idx] as HTMLElement | undefined;
    if (!child) return;
    const cLeft = child.offsetLeft;
    const cRight = cLeft + child.offsetWidth;
    const vLeft = el.scrollLeft;
    const vRight = vLeft + el.clientWidth;
    if (cLeft < vLeft) el.scrollTo({ left: cLeft - 8, behavior: "smooth" });
    if (cRight > vRight) el.scrollTo({ left: cRight - el.clientWidth + 8, behavior: "smooth" });
  };

  // auth
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${API_BASE || "http://localhost:8082"}/api/auth/user`, {
          credentials: "include",
        });
        setIsLoggedIn(res.ok);
      } catch {
        setIsLoggedIn(false);
      }
    };
    checkAuth();
  }, []);

  // media list (รูปหลัก + media เพิ่ม)
  const mediaItems: MediaItem[] = useMemo(() => {
    if (!product) return [];
    const base: MediaItem[] = [
      { id: "main", type: "image", url: toAbsolute(product.imageUrl), alt: product.name },
    ];
    if (product.mediaItems?.length) {
      const extra = product.mediaItems
        .map((m, i) => ({
          id: m.id ?? `m-${i}`,
          type: m.type === "video" ? "video" : "image",
          url: toAbsolute(m.url),
          thumbnail: toAbsolute(m.thumbnail),
          alt: m.alt || product.name,
          displayOrder: m.displayOrder ?? i + 1,
        }))
        .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
        .filter((x) => x.url !== base[0].url);
      base.push(...extra);
    }
    return base;
  }, [product]);

  useEffect(() => {
    syncArrows();
    ensureVisible(currentMediaIndex);
  }, [currentMediaIndex, mediaItems.length]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const onScroll = () => syncArrows();
    const onResize = () => syncArrows();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    syncArrows();
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const current = mediaItems[currentMediaIndex];
  const decQty = () => setQuantity((q) => Math.max(1, q - 1));
  const incQty = () => setQuantity((q) => Math.min(product?.stock ?? 1, q + 1));
  const handleAdd = () => {
    if (!product || product.stock <= 0) return;
    onAddToCart(product.id, quantity);
  };
  const handleBuy = () => {
    if (!product || product.stock <= 0) return;
    onAddToCart(product.id, quantity);
    onCartClick?.();
  };

  if (loading) {
    return (
      <div className="pd-loading">
        <div className="spinner" />
        <p>กำลังโหลดข้อมูลสินค้า…</p>
      </div>
    );
  }
  if (!product) {
    return (
      <div className="pd-error">
        <h2>ไม่พบสินค้า</h2>
        <p>สินค้าที่คุณต้องการอาจถูกลบหรือย้ายที่แล้ว</p>
      </div>
    );
  }

  const fallbackOptions = product.options?.length ? product.options : [];

  return (
    <div className="pd-page">
      <div className="pd-container">
        {/* ===== Left: Media ===== */}
        <section className="pd-media">
          <div className="pd-media-main">
            {current?.type === "video" ? (
              <video key={current.url} className="pd-video" controls poster={current.thumbnail}>
                <source src={current.url} />
              </video>
            ) : (
              <img
                className="pd-image"
                src={current?.url || FALLBACK_MAIN}
                alt={current?.alt || product.name}
                crossOrigin="anonymous"
                onError={(e) => {
                  const el = e.currentTarget as HTMLImageElement;
                  if (el.dataset.fallback) return;
                  el.dataset.fallback = "1";
                  el.src = FALLBACK_MAIN;
                }}
              />
            )}

            {mediaItems.length > 1 && (
              <>
                <button
                  className="pd-nav prev"
                  onClick={() =>
                    setCurrentMediaIndex((i) => (i === 0 ? mediaItems.length - 1 : i - 1))
                  }
                  aria-label="ก่อนหน้า"
                >
                  ‹
                </button>
                <button
                  className="pd-nav next"
                  onClick={() =>
                    setCurrentMediaIndex((i) => (i === mediaItems.length - 1 ? 0 : i + 1))
                  }
                  aria-label="ถัดไป"
                >
                  ›
                </button>
                <div className="pd-counter">
                  {currentMediaIndex + 1}/{mediaItems.length}
                </div>
              </>
            )}
          </div>

          {/* --- Thumbs slider under main image --- */}
          {mediaItems.length > 1 && (
            <div className="pd-thumbs-row">
              <button
                className="pd-thumb-arrow left"
                onClick={() => scrollByStep("left")}
                disabled={!canLeft}
                aria-label="เลื่อนซ้าย"
              >
                ‹
              </button>

              <div className="pd-thumbs-track" ref={trackRef}>
                {mediaItems.map((m, idx) => (
                  <button
                    key={m.id}
                    className={`pd-thumb ${idx === currentMediaIndex ? "active" : ""}`}
                    onClick={() => setCurrentMediaIndex(idx)}
                    aria-label={`รูปที่ ${idx + 1}`}
                    title={m.alt || `image ${idx + 1}`}
                  >
                    {m.type === "video" ? (
                      <div className="pd-thumb-video">
                        <img
                          src={m.thumbnail || FALLBACK_THUMB}
                          alt={m.alt || `thumb ${idx + 1}`}
                          onError={(e) =>
                            ((e.currentTarget as HTMLImageElement).src = FALLBACK_THUMB)
                          }
                        />
                        <span className="pd-play">▶</span>
                      </div>
                    ) : (
                      <img
                        src={m.url || FALLBACK_THUMB}
                        alt={m.alt || `thumb ${idx + 1}`}
                        onError={(e) =>
                          ((e.currentTarget as HTMLImageElement).src = FALLBACK_THUMB)
                        }
                      />
                    )}
                  </button>
                ))}
              </div>

              <button
                className="pd-thumb-arrow right"
                onClick={() => scrollByStep("right")}
                disabled={!canRight}
                aria-label="เลื่อนขวา"
              >
                ›
              </button>
            </div>
          )}
        </section>

        {/* ===== Right: Info ===== */}
        <section className="pd-info">
          <h1 className="pd-title">{product.name}</h1>

          <div className="pd-meta">
            <div className="pd-stars">★★★★★</div>
            <span className="pd-dot">•</span>
            <span className="pd-sold">ขายแล้ว {Math.max(1, Math.floor(product.id % 800))} ชิ้น</span>
            <span className="pd-dot">•</span>
            <span className="pd-sku">สต็อก {product.stock}</span>
          </div>

          <div className="pd-price-box">
            <div className="pd-price">{formatTHB(product.price)}</div>
          </div>

          {fallbackOptions.map((opt) => (
            <div className="pd-option" key={opt.label}>
              <div className="pd-option-label">{opt.label}</div>
              <div className="pd-chips">
                {opt.values.map((v) => (
                  <button key={v} className="pd-chip">
                    {v}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="pd-qty-row">
            <div className="pd-qty-label">จำนวน</div>
            <div className="pd-qty">
              <button className="pd-step" onClick={decQty} disabled={quantity <= 1} aria-label="ลด">
                −
              </button>
              <span className="pd-qty-val">{quantity}</span>
              <button
                className="pd-step"
                onClick={incQty}
                disabled={quantity >= product.stock}
                aria-label="เพิ่ม"
              >
                +
              </button>
              <span className="pd-qty-stock">
                {product.stock > 0 ? `มีสินค้า ${product.stock} ชิ้น` : "สินค้าหมด"}
              </span>
            </div>
          </div>

          <div className="pd-actions">
            <button
              className="pd-btn outline"
              onClick={handleAdd}
              disabled={product.stock <= 0 || quantity > product.stock}
            >
              เพิ่มไปยังรถเข็น
            </button>
            <button
              className="pd-btn primary"
              onClick={handleBuy}
              disabled={product.stock <= 0 || quantity > product.stock}
            >
              ซื้อสินค้า
            </button>
          </div>

          {product.store && (
            <div className="pd-store">
              <img
                className="pd-store-logo"
                src={toAbsolute(product.store.logoUrl) || FALLBACK_THUMB}
                alt={product.store.name}
                onError={(e) => ((e.currentTarget as HTMLImageElement).src = FALLBACK_THUMB)}
              />
              <div className="pd-store-info">
                <div className="pd-store-name">{product.store.name}</div>
                <div className="pd-store-sub">
                  ⭐ {product.store.rating ?? 4.9} · ผู้ติดตาม {product.store.followerCount ?? 2500}
                </div>
              </div>
              <div className="pd-store-actions">
                <button className="pd-mini outline">ไปหน้าร้าน</button>
                <button className="pd-mini">ติดตาม</button>
              </div>
            </div>
          )}

          <div className="pd-desc">
            <div className="pd-desc-title">รายละเอียดสินค้า</div>
            <p>{product.description}</p>
          </div>
        </section>
      </div>

      {/* Comments / Reviews */}
      <div className="pd-bottom">
        <ProductComments productId={product.id} isLoggedIn={isLoggedIn} />
        <div className="pd-review-wrap">
          <ProductReviewList productId={product.id} />
          {isLoggedIn && <ProductReviewForm productId={product.id} userId={1} />}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;