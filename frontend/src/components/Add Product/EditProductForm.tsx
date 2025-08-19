import React, { useEffect, useState } from 'react';
import './EditProductForm.css';

type TagObj = { name: string };

interface Product {
  id?: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
  tags?: TagObj[];
}

interface EditProductFormProps {
  product: Product;
  onSubmit: (product: Omit<Product, 'id'>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  onDelete?: (id: number, name: string) => Promise<void>;
}

const CATEGORY_OPTIONS = [
  { value: 'เทคโนโลยี', label: '💻 เทคโนโลยี' },
  { value: 'แฟชั่น', label: '👕 แฟชั่น' },
  { value: 'บ้าน & สวน', label: '🏠 บ้าน & สวน' },
  { value: 'เกม & ของเล่น', label: '🎮 เกม & ของเล่น' },
  { value: 'ความงาม', label: '💄 ความงาม' },
  { value: 'กีฬา & ฟิตเนส', label: '⚽ กีฬา & ฟิตเนส' },
  { value: 'ยานยนต์', label: '🚗 ยานยนต์' },
  { value: 'อาหาร & เครื่องดื่ม', label: '🍕 อาหาร & เครื่องดื่ม' },
  { value: 'หนังสือ & การศึกษา', label: '📚 หนังสือ & การศึกษา' },
  { value: 'เสียงเพลง', label: '🎵 เสียงเพลง' },
  { value: 'แม่และเด็ก', label: '👶 แม่และเด็ก' },
  { value: 'สัตว์เลี้ยง', label: '🐕 สัตว์เลี้ยง' },
];

const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&h=600&fit=crop',
];

const EditProductFormShopee: React.FC<EditProductFormProps> = ({
  product,
  onSubmit,
  onCancel,
  isLoading = false,
  onDelete,
}) => {
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    stock: '',
    tagNames: [] as string[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!product) return;
    setForm({
      name: product.name || '',
      description: product.description || '',
      price: String(product.price ?? ''),
      imageUrl: product.imageUrl || '',
      stock: String(product.stock ?? 0),
      tagNames: (product.tags ?? []).map((t: any) => t.name),
    });
  }, [product]);

  const isValidUrl = (url: string) => {
    try { new URL(url); return true; } catch { return false; }
  };

  const setField = (name: string, value: string) => {
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: '' }));
  };

  const toggleTag = (val: string) => {
    setForm((p) => {
      const tagNames = p.tagNames.includes(val)
        ? p.tagNames.filter((t) => t !== val)
        : [...p.tagNames, val];
      return { ...p, tagNames };
    });
    if (errors.tags) setErrors((e) => ({ ...e, tags: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'กรุณาใส่ชื่อสินค้า';
    if (!form.description.trim()) e.description = 'กรุณาใส่คำอธิบาย';
    if (!form.price) e.price = 'กรุณาใส่ราคา';
    else if (Number.isNaN(parseFloat(form.price)) || parseFloat(form.price) <= 0) e.price = 'ราคาต้องมากกว่า 0';
    if (!form.stock) e.stock = 'กรุณาใส่สต็อก';
    else if (Number.isNaN(parseInt(form.stock)) || parseInt(form.stock) < 0) e.stock = 'สต็อกต้อง ≥ 0';
    if (!form.imageUrl.trim()) e.imageUrl = 'กรุณาใส่ URL รูปภาพ';
    else if (!isValidUrl(form.imageUrl)) e.imageUrl = 'URL ไม่ถูกต้อง';
    if (form.tagNames.length === 0) e.tags = 'เลือกหมวดหมู่อย่างน้อย 1 หมวด';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;

    // ส่ง tags ให้ตรงกับ type ที่ App.tsx ต้องการ (มี id: number | undefined)
    const tags = form.tagNames.map((name) => ({ id: undefined, name }));
    await onSubmit({
      name: form.name.trim(),
      description: form.description.trim(),
      price: parseFloat(form.price),
      imageUrl: form.imageUrl.trim(),
      stock: parseInt(form.stock),
      tags,
    });
    onCancel(); // ปิด modal หลังบันทึกสำเร็จ
  };

  const closeOnBg = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onCancel();
  };

  return (
    <div className="eps-overlay" onClick={closeOnBg} onKeyDown={(e) => e.key === 'Escape' && onCancel()}>
      <div className="eps-modal">
        <header className="eps-head">
          <h2>✏️ แก้ไขสินค้า</h2>
          <button className="eps-close" onClick={onCancel} disabled={isLoading}>✕</button>
        </header>

        <form className="eps-body" onSubmit={submit}>
          {/* Left: image panel */}
          <section className="eps-col media">
            <div className={`eps-card ${errors.imageUrl ? 'is-error' : ''}`}>
              <div className="eps-label">รูปหลักของสินค้า *</div>
              <div className="eps-preview">
                <img
                  src={isValidUrl(form.imageUrl) ? form.imageUrl : 'https://via.placeholder.com/600x600?text=No+Image'}
                  alt="preview"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600x600?text=No+Image';
                  }}
                />
              </div>
              <div className="eps-field">
                <label>URL รูปภาพ *</label>
                <div className="eps-urlrow">
                  <input
                    type="url"
                    value={form.imageUrl}
                    onChange={(e) => setField('imageUrl', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className={errors.imageUrl ? 'has-error' : ''}
                    disabled={isLoading}
                  />
                  <button type="button" className="btn btn-light" disabled>ดูตัวอย่าง</button>
                </div>
                {errors.imageUrl && <span className="eps-err">{errors.imageUrl}</span>}
              </div>

              <div className="eps-field">
                <label>ตัวอย่างรูปภาพ</label>
                <div className="eps-samples">
                  {SAMPLE_IMAGES.map((u, i) => (
                    <button type="button" key={i} className="eps-sample" onClick={() => setField('imageUrl', u)} disabled={isLoading}>
                      <img src={u} alt={`sample-${i}`} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Right: details */}
          <section className="eps-col detail">
            <div className="eps-card">
              <div className="eps-field">
                <label>ชื่อสินค้า *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setField('name', e.target.value)}
                  placeholder="เช่น iPhone 15 Pro Max"
                  className={errors.name ? 'has-error' : ''}
                  disabled={isLoading}
                />
                {errors.name && <span className="eps-err">{errors.name}</span>}
              </div>

              <div className="eps-row2">
                <div className="eps-field">
                  <label>ราคา (บาท) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    value={form.price}
                    onChange={(e) => setField('price', e.target.value)}
                    placeholder="0.00"
                    className={errors.price ? 'has-error' : ''}
                    disabled={isLoading}
                  />
                  {errors.price && <span className="eps-err">{errors.price}</span>}
                </div>
                <div className="eps-field">
                  <label>สต็อก *</label>
                  <input
                    type="number"
                    min={0}
                    value={form.stock}
                    onChange={(e) => setField('stock', e.target.value)}
                    placeholder="0"
                    className={errors.stock ? 'has-error' : ''}
                    disabled={isLoading}
                  />
                  {errors.stock && <span className="eps-err">{errors.stock}</span>}
                </div>
              </div>

              <div className="eps-field">
                <label>หมวดหมู่สินค้า *</label>
                <div className="eps-chips">
                  {CATEGORY_OPTIONS.map((opt) => {
                    const active = form.tagNames.includes(opt.value);
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        className={`chip ${active ? 'is-active' : ''}`}
                        onClick={() => toggleTag(opt.value)}
                        disabled={isLoading}
                        title={opt.value}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
                {errors.tags && <span className="eps-err">{errors.tags}</span>}
              </div>

              <div className="eps-field">
                <label>คำอธิบายสินค้า *</label>
                <textarea
                  rows={6}
                  value={form.description}
                  onChange={(e) => setField('description', e.target.value)}
                  placeholder="อธิบายรายละเอียดสินค้า คุณสมบัติ จุดเด่น วิธีใช้งาน ฯลฯ"
                  className={errors.description ? 'has-error' : ''}
                  disabled={isLoading}
                />
                {errors.description && <span className="eps-err">{errors.description}</span>}
              </div>
            </div>

            <div className="eps-actions">
              <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={isLoading}>
                ยกเลิก
              </button>

              {product.id && onDelete && (
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={async () => {
                    if (!window.confirm('ต้องการลบสินค้านี้หรือไม่?')) return;
                    await onDelete(product.id!, product.name);
                    onCancel(); // ปิด modal หลังลบ
                  }}
                  disabled={isLoading}
                >
                  🗑️ ลบสินค้า
                </button>
              )}

              <button type="submit" className="btn btn-primary" disabled={isLoading}>
                {isLoading ? (<><span className="loading-spinner"></span> กำลังบันทึก...</>) : '✅ บันทึกการแก้ไข'}
              </button>
            </div>
          </section>
        </form>
      </div>
    </div>
  );
};

export default EditProductFormShopee;