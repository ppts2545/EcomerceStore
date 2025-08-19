import React, { useEffect, useRef, useState } from 'react';
import './AddProductForm.css';

// ====== Types ======
export interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string; // preview URL (object URL)
  file: File;  // real file
  thumbnail?: string;
  alt?: string;
}

export type SubmitPayload = {
  name: string;
  description: string;
  price: number;
  stock: number;
  tags: string[];
  media: MediaItem[];
  imageFile: File | null;
};

interface AddProductFormProps {
  onSubmit: (product: SubmitPayload) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const MAX_MEDIA = 10;

const AddProductForm: React.FC<AddProductFormProps> = ({ onSubmit, onCancel, isLoading = false }) => {
  // ====== form states ======
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    // เก็บเป็น string ระหว่างพิมพ์ เพื่อไม่ให้ React บล็อคการพิมพ์
    price: '',
    stock: '',
    tags: [] as string[],
  });

  const categoryOptions = [
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

  // รูปหลัก
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // สื่อเพิ่มเติม
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const mediaInputRef = useRef<HTMLInputElement>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // ====== Effects: preview cleanup ======
  useEffect(() => {
    if (!imageFile) {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  // ====== Numeric helpers & handlers ======
  const blockInvalidNumberKeys = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // กัน e/E/+/-
    if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault();
  };

  const sanitizePrice = (raw: string) => {
    // เก็บเฉพาะตัวเลขและจุด
    let v = raw.replace(/[^\d.]/g, '');

    // ให้มีจุดทศนิยมได้จุดเดียว
    const firstDot = v.indexOf('.');
    if (firstDot !== -1) {
      const before = v.slice(0, firstDot);
      const after = v.slice(firstDot + 1).replace(/\./g, ''); // ลบจุดตัวอื่น
      // จำกัดทศนิยมไม่เกิน 2
      v = before + '.' + after.slice(0, 2);
    }

    // ลบ 0 นำหน้าที่เกินจำเป็น (ยกเว้น "0", "0.", "0.x")
    if (!v.startsWith('0.') && v !== '' && v !== '0') {
      v = v.replace(/^0+(\d)/, '$1');
    }
    return v;
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = sanitizePrice(e.target.value);
    setFormData((prev) => ({ ...prev, price: v }));
    if (errors.price) setErrors((prev) => ({ ...prev, price: '' }));
  };

  const handlePricePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text');
    const v = sanitizePrice(text);
    setFormData((prev) => ({ ...prev, price: v }));
    if (errors.price) setErrors((prev) => ({ ...prev, price: '' }));
  };

  const sanitizeStock = (raw: string) => raw.replace(/[^\d]/g, '');

  const handleStockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = sanitizeStock(e.target.value);
    setFormData((prev) => ({ ...prev, stock: v }));
    if (errors.stock) setErrors((prev) => ({ ...prev, stock: '' }));
  };

  const handleStockPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text');
    const v = sanitizeStock(text);
    setFormData((prev) => ({ ...prev, stock: v }));
    if (errors.stock) setErrors((prev) => ({ ...prev, stock: '' }));
  };

  // ====== media helpers ======
  const addMediaFromFiles = (files: FileList) => {
    const room = MAX_MEDIA - mediaItems.length;
    const chosen = Array.from(files).slice(0, room);
    if (chosen.length < files.length) {
      alert(`เพิ่มได้อีกสูงสุด ${room} ไฟล์ (รวมไม่เกิน ${MAX_MEDIA})`);
    }

    const next: MediaItem[] = [];
    for (const f of chosen) {
      const type: 'image' | 'video' = f.type.startsWith('video/') ? 'video' : 'image';
      next.push({
        id: `media-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type,
        url: URL.createObjectURL(f),
        file: f,
        alt: `${formData.name || 'Product'} - ${type}`,
      });
    }
    if (next.length) setMediaItems((prev) => [...prev, ...next]);
  };

  const removeMediaItem = (id: string) => {
    setMediaItems((prev) => {
      const target = prev.find((m) => m.id === id);
      if (target) { try { URL.revokeObjectURL(target.url); } catch {} }
      return prev.filter((m) => m.id !== id);
    });
  };

  // ====== Validation ======
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'กรุณาใส่ชื่อสินค้า';
    if (!formData.description.trim()) newErrors.description = 'กรุณาใส่คำอธิบายสินค้า';

    const priceNum = parseFloat(formData.price || '0');
    if (!formData.price) newErrors.price = 'กรุณาใส่ราคา';
    else if (Number.isNaN(priceNum) || priceNum <= 0) newErrors.price = 'ราคาต้องมากกว่า 0';

    if (!imageFile) newErrors.imageFile = 'กรุณาอัปโหลดรูปภาพหลักของสินค้า';

    const stockNum = parseInt(formData.stock || '0', 10);
    if (!formData.stock) newErrors.stock = 'กรุณาใส่สต็อก';
    else if (Number.isNaN(stockNum) || stockNum < 0) newErrors.stock = 'สต็อกต้อง ≥ 0';

    if (!formData.tags || formData.tags.length === 0) newErrors.tags = 'เลือกหมวดหมู่อย่างน้อย 1 หมวด';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ====== Handlers ======
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload: SubmitPayload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: parseFloat(formData.price || '0'),
      stock: parseInt(formData.stock || '0', 10),
      tags: formData.tags,
      media: mediaItems,
      imageFile,
    };

    try {
      await onSubmit(payload);
      // cleanup object URLs
      mediaItems.forEach((m) => { try { URL.revokeObjectURL(m.url); } catch {} });

      // reset form
      setFormData({ name: '', description: '', price: '', stock: '', tags: [] });
      setImageFile(null);
      setMediaItems([]);
      setErrors({});
    } catch (error) {
      console.error('❌ Error submitting form:', error);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const toggleTag = (tag: string) => {
    setFormData((prev) => {
      const next = prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag];
      return { ...prev, tags: next };
    });
    if (errors.tags) setErrors((prev) => ({ ...prev, tags: '' }));
  };

  // ====== Render ======
  return (
    <div className="add-product-overlay">
      <div className="add-product-modal">
        <div className="modal-header">
          <h2>เพิ่มสินค้าใหม่</h2>
          <button onClick={onCancel} className="close-button" disabled={isLoading}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="seller-form">
          {/* LEFT: media */}
          <section className="col media-col">
            <div
              className={`card dropzone ${errors.imageFile ? 'error' : ''}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const f = e.dataTransfer.files?.[0];
                if (f && f.type.startsWith('image/')) setImageFile(f);
              }}
            >
              <div className="dz-head">รูปหลักของสินค้า *</div>

              {!imagePreview ? (
                <>
                  <p className="dz-icon">🖼️</p>
                  <p className="dz-text">ลาก-วางไฟล์รูปที่นี่ หรือ</p>
                  <label htmlFor="imageFile" className="btn btn-outline">เลือกไฟล์</label>
                  <input
                    id="imageFile"
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => {
                      const f = e.target.files?.[0] || null;
                      setImageFile(f);
                      if (errors.imageFile) setErrors((prev) => ({ ...prev, imageFile: '' }));
                    }}
                    disabled={isLoading}
                  />
                  <p className="dz-hint">รองรับ .jpg .png .webp ขนาดแนะนำ 1000×1000px</p>
                </>
              ) : (
                <div className="dz-preview">
                  <img src={imagePreview} alt="Preview" />
                  <div className="dz-actions">
                    <label htmlFor="imageFile" className="btn btn-light">เปลี่ยนรูป</label>
                    <button type="button" className="btn btn-ghost" onClick={() => setImageFile(null)} disabled={isLoading}>ลบรูป</button>
                  </div>
                </div>
              )}
              {errors.imageFile && <span className="error-text">{errors.imageFile}</span>}
            </div>

            <div className="card">
              <div className="card-title">
                สื่อเพิ่มเติม (สูงสุด {MAX_MEDIA})
                <span className="muted">  เพิ่มภาพ/วิดีโอสำหรับสไลด์</span>
              </div>

              <div className="media-grid">
                {/* add button */}
                <button
                  type="button"
                  className="media-add-tile"
                  onClick={() => mediaInputRef.current?.click()}
                  disabled={isLoading || mediaItems.length >= MAX_MEDIA}
                >
                  <div className="add-tile-icon">＋</div>
                  <div>เพิ่มสื่อ</div>
                  <div className="muted">{mediaItems.length}/{MAX_MEDIA}</div>
                </button>

                {mediaItems.map((m, i) => (
                  <div key={m.id} className="media-thumb">
                    {m.type === 'image' ? (
                      <img src={m.url} alt={m.alt} />
                    ) : (
                      <div className="video-thumb">
                        <video src={m.url} />
                        <span className="video-badge">🎬</span>
                      </div>
                    )}
                    <button
                      type="button"
                      className="thumb-remove"
                      onClick={() => removeMediaItem(m.id)}
                      disabled={isLoading}
                      aria-label="ลบ"
                    >
                      ✕
                    </button>
                    <div className="thumb-meta">#{i + 1} {m.type === 'image' ? 'รูป' : 'วิดีโอ'}</div>
                  </div>
                ))}
              </div>

              <input
                ref={mediaInputRef}
                type="file"
                hidden
                multiple
                accept="image/*,video/*"
                onChange={(e) => e.target.files && addMediaFromFiles(e.target.files)}
                disabled={isLoading}
              />
            </div>
          </section>

          {/* RIGHT: details */}
          <section className="col detail-col">
            <div className="card">
              <div className="form-row">
                <label>ชื่อสินค้า *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleTextChange}
                  placeholder="เช่น iPhone 15 Pro Max"
                  className={errors.name ? 'error' : ''}
                  disabled={isLoading}
                />
                {errors.name && <span className="error-text">{errors.name}</span>}
              </div>

              <div className="form-row two">
                <div>
                  <label>ราคา (บาท) *</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={handlePriceChange}
                    onKeyDown={blockInvalidNumberKeys}
                    onPaste={handlePricePaste}
                    className={errors.price ? 'error' : ''}
                    disabled={isLoading}
                  />
                  {errors.price && <span className="error-text">{errors.price}</span>}
                </div>
                <div>
                  <label>สต็อก *</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={formData.stock}
                    onChange={handleStockChange}
                    onKeyDown={blockInvalidNumberKeys}
                    onPaste={handleStockPaste}
                    className={errors.stock ? 'error' : ''}
                    disabled={isLoading}
                  />
                  {errors.stock && <span className="error-text">{errors.stock}</span>}
                </div>
              </div>

              <div className="form-row">
                <label>หมวดหมู่สินค้า *</label>
                <div className="chip-group">
                  {categoryOptions.map((opt) => {
                    const active = formData.tags.includes(opt.value);
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        className={`chip ${active ? 'is-active' : ''}`}
                        onClick={() => {
                          const next = active
                            ? formData.tags.filter((t) => t !== opt.value)
                            : [...formData.tags, opt.value];
                          setFormData((prev) => ({ ...prev, tags: next }));
                          if (errors.tags) setErrors((prev) => ({ ...prev, tags: '' }));
                        }}
                        disabled={isLoading}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
                {errors.tags && <span className="error-text">{errors.tags}</span>}
              </div>

              <div className="form-row">
                <label>คำอธิบายสินค้า *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleTextChange}
                  placeholder="อธิบายรายละเอียดสินค้า คุณสมบัติ จุดเด่น วิธีใช้งาน ฯลฯ"
                  rows={6}
                  className={errors.description ? 'error' : ''}
                  disabled={isLoading}
                />
                {errors.description && <span className="error-text">{errors.description}</span>}
              </div>
            </div>

            {/* sticky actions */}
            <div className="actions">
              <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={isLoading}>
                ยกเลิก
              </button>
              <button type="submit" className="btn btn-primary" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="loading-spinner"></span>
                    กำลังเพิ่มสินค้า...
                  </>
                ) : (<>✅ เพิ่มสินค้า</>)}
              </button>
            </div>
          </section>
        </form>
      </div>
    </div>
  );
};

export default AddProductForm;