import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ Home.css"; // Assuming you have a CSS file for styling

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");
const toAbsolute = (u?: string) => {
  if (!u) return "";
  if (/^(https?:|data:|blob:)/i.test(u)) return u;
  return API_BASE ? `${API_BASE}/${u.replace(/^\/+/, "")}` : `/${u.replace(/^\/+/, "")}`;
};
const FALLBACK =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="188" height="188"><rect width="100%" height="100%" fill="%23f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-family="Arial" font-size="14">No Image</text></svg>';

type Product = { id: number; name: string; price: number; imageUrl?: string; mediaItems?: any[] };

const toNumber = (v: unknown) => {
  const n = typeof v === "string" ? parseFloat(v) : (v as number);
  return Number.isFinite(n) ? n : 0;
};
const formatTHB = (v: unknown) =>
  new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 2 }).format(toNumber(v));

export default function Home() {
  const nav = useNavigate();
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const pickImage = (p: any) =>
    p.imageUrl ||
    p.productImageUrl ||
    (Array.isArray(p.mediaItems) && p.mediaItems.find((m: any) => m.type === "image")?.url);

  // ดึงสินค้าสุ่มจาก backend; ถ้าไม่มี endpoint ใช้ /api/products แล้วสุ่มฝั่ง client
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        let res = await fetch(`/api/products/random?limit=60`);
        if (!res.ok) {
          // fallback
          res = await fetch(`/api/products`);
        }
        const data = (await res.json()) as any[];
        let list = Array.isArray(data) ? data : [];
        // ถ้าไม่ใช่ random จาก backend ให้สุ่มใน client
        if (!location.pathname.includes("random")) {
          list = list.sort(() => Math.random() - 0.5);
        }
        list = list.map((p) => ({ ...p, imageUrl: pickImage(p) }));
        if (!cancelled) setItems(list.slice(0, 60));
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const grid = useMemo(() => items, [items]);

  if (loading) {
    return (
      <div className="home">
        <h2 className="home-title">สินค้าแนะนำ</h2>
        <div className="home-grid">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="home-card skeleton">
              <div className="img skeleton-box" />
              <div className="line w70" />
              <div className="line w40" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="home">
      <h2 className="home-title">สินค้าแนะนำ</h2>
      <div className="home-grid">
        {grid.map((p) => (
          <div key={p.id} className="home-card" onClick={() => nav(`/product/${p.id}`)}>
            <div className="img-wrap">
              <img
                src={toAbsolute(p.imageUrl) || FALLBACK}
                alt={p.name}
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK; }}
              />
            </div>
            <div className="name">{p.name}</div>
            <div className="price">{formatTHB(p.price)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}