import React, { useEffect, useState } from 'react';
import './AddProductForm.css';

// ====== Types ======
export interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string; // preview URL (object URL)
  file: File; // real file
  thumbnail?: string;
  alt?: string;
}

// ข้อมูลที่เราจะส่งออกไปยัง parent (ปรับให้รองรับไฟล์หลัก & มีเดีย)
export type SubmitPayload = {
  name: string;
  description: string;
  price: number;
  stock: number;
  tags: string[];
  media: MediaItem[]; // รูป/วิดีโอเพิ่มเติม (สำหรับสไลด์)
  imageFile: File | null; // รูปหลักของสินค้า
};

interface AddProductFormProps {
  onSubmit: (product: SubmitPayload) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const MAX_MEDIA = 10;

const AddProductForm: React.FC<AddProductFormProps> = ({ onSubmit, onCancel, isLoading = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
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

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [newMediaType, setNewMediaType] = useState<'image' | 'video'>('image');
  const [newMediaFile, setNewMediaFile] = useState<File | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // ====== Effects: preview cleanup ======
  useEffect(() => {
    if (!imageFile) {
      // ถ้าเคยสร้าง preview มาก่อนให้ revoke ก่อน
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [imageFile]);

  // ====== Validation ======
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'กรุณาใส่ชื่อสินค้า';
    if (!formData.description.trim()) newErrors.description = 'กรุณาใส่คำอธิบายสินค้า';

    if (!formData.price) newErrors.price = 'กรุณาใส่ราคาสินค้า';
    else if (Number.isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) newErrors.price = 'ราคาต้องมากกว่า 0';

    if (!imageFile) newErrors.imageFile = 'กรุณาอัปโหลดรูปภาพสินค้า';

    if (!formData.stock) newErrors.stock = 'กรุณาใส่จำนวนสินค้าคงคลัง';
    else if (Number.isNaN(parseInt(formData.stock)) || parseInt(formData.stock) < 0) newErrors.stock = 'จำนวนสินค้าต้องมากกว่าหรือเท่ากับ 0';

    if (!formData.tags || formData.tags.length === 0) newErrors.tags = 'กรุณาเลือกหมวดหมู่สินค้าอย่างน้อย 1 หมวด';

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
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      tags: formData.tags,
      media: mediaItems,
      imageFile,
    };

    try {
      await onSubmit(payload);
      // cleanup object URLs สำหรับ media
      mediaItems.forEach((m) => {
        try { URL.revokeObjectURL(m.url); } catch {}
      });

      // reset form
      setFormData({ name: '', description: '', price: '', stock: '', tags: [] });
      setImageFile(null);
      setMediaItems([]);
      setNewMediaFile(null);
      setErrors({});
    } catch (error) {
      console.error('❌ Error submitting form:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleTagChange = (tag: string) => {
    setFormData((prev) => {
      const next = prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag];
      return { ...prev, tags: next };
    });
    if (errors.tags) setErrors((prev) => ({ ...prev, tags: '' }));
  };

  const addMediaItem = () => {
    if (!newMediaFile) return;
    if (mediaItems.length >= MAX_MEDIA) {
      alert(`⚠️ สามารถเพิ่มรูปภาพ/วีดีโอได้สูงสุด ${MAX_MEDIA} รายการเท่านั้น`);
      return;
    }

    let type: 'image' | 'video' = newMediaType;
    if (newMediaFile.type.startsWith('image/')) type = 'image';
    else if (newMediaFile.type.startsWith('video/')) type = 'video';

    const previewUrl = URL.createObjectURL(newMediaFile);
    const newItem: MediaItem = {
      id: `media-${Date.now()}`,
      type,
      url: previewUrl,
      file: newMediaFile,
      alt: `${formData.name || 'Product'} - ${type}`,
    };

    setMediaItems((prev) => [...prev, newItem]);
    setNewMediaFile(null);
  };

  const removeMediaItem = (id: string) => {
    setMediaItems((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target) {
        try { URL.revokeObjectURL(target.url); } catch {}
      }
      return prev.filter((i) => i.id !== id);
    });
  };

  // ====== Render ======
  return (
    <div className="add-product-overlay">
      <div className="add-product-modal">
        <div className="modal-header">
          <h2>➕ เพิ่มสินค้าใหม่</h2>
          <button onClick={onCancel} className="close-button" disabled={isLoading}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-grid">
            {/* Category (multi-select with checkbox) */}
            <div className="form-group">
              <label>หมวดหมู่สินค้า *</label>
              <div className="category-checkbox-group">
                {categoryOptions.map((opt) => (
                  <label key={opt.value} className="category-checkbox-label">
                    <input
                      type="checkbox"
                      value={opt.value}
                      checked={formData.tags.includes(opt.value)}
                      onChange={() => handleTagChange(opt.value)}
                      disabled={isLoading}
                    />
                    <span className="category-checkbox-icon">{opt.label}</span>
                  </label>
                ))}
              </div>
              {errors.tags && <span className="error-text">{errors.tags}</span>}
            </div>

            {/* Product Name */}
            <div className="form-group">
              <label htmlFor="name">ชื่อสินค้า *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="เช่น iPhone 15 Pro Max"
                className={errors.name ? 'error' : ''}
                disabled={isLoading}
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            {/* Price */}
            <div className="form-group">
              <label htmlFor="price">ราคา (บาท) *</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                min={0}
                className={errors.price ? 'error' : ''}
                disabled={isLoading}
              />
              {errors.price && <span className="error-text">{errors.price}</span>}
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="description">คำอธิบายสินค้า *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="อธิบายรายละเอียดสินค้า คุณสมบัติ และจุดเด่น..."
              rows={4}
              className={errors.description ? 'error' : ''}
              disabled={isLoading}
            />
            {errors.description && <span className="error-text">{errors.description}</span>}
          </div>

          {/* Product Image Upload */}
          <div className="form-group">
            <label htmlFor="imageFile">อัปโหลดรูปภาพสินค้า *</label>
            <input
              type="file"
              id="imageFile"
              name="imageFile"
              accept="image/*"
              style={{ maxWidth: '180px' }}
              onChange={(e) => {
                const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
                setImageFile(file);
                if (errors.imageFile) setErrors((prev) => ({ ...prev, imageFile: '' }));
              }}
              disabled={isLoading}
            />
            {imagePreview && (
              <div style={{ marginTop: '10px' }}>
                <strong>Preview:</strong>
                <br />
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{ maxWidth: '160px', maxHeight: '160px', borderRadius: '8px', border: '1px solid #eee', marginTop: '4px' }}
                />
                {imageFile && (
                  <div style={{ fontSize: '0.9em', color: '#666', marginTop: '2px' }}>{imageFile.name}</div>
                )}
              </div>
            )}
            {errors.imageFile && <span className="error-text">{errors.imageFile}</span>}
          </div>

          {/* Stock */}
          <div className="form-group">
            <label htmlFor="stock">จำนวนสินค้าคงคลัง *</label>
            <input
              type="number"
              id="stock"
              name="stock"
              value={formData.stock}
              onChange={handleInputChange}
              placeholder="0"
              min={0}
              className={errors.stock ? 'error' : ''}
              disabled={isLoading}
            />
            {errors.stock && <span className="error-text">{errors.stock}</span>}
          </div>

          {/* Additional Media Section */}
          <div className="form-group">
            <label>
              📸 รูปภาพ/วีดีโอเพิ่มเติม (สำหรับสไลด์)
              <span className="media-count"> ({mediaItems.length}/{MAX_MEDIA} รายการ)</span>
            </label>
            <div className="media-manager">
              <div className="add-media-section">
                {mediaItems.length < MAX_MEDIA && (
                  <div className="media-input-row">
                    <select
                      value={newMediaType}
                      onChange={(e) => {
                        setNewMediaType(e.target.value as 'image' | 'video');
                        setNewMediaFile(null);
                      }}
                      className="media-type-select"
                      disabled={isLoading}
                    >
                      <option value="image">รูปภาพ</option>
                      <option value="video">วีดีโอ</option>
                    </select>
                    <label htmlFor="mediaFile" style={{ marginRight: 8 }}>
                      {newMediaType === 'image' ? 'เลือกรูปภาพ' : 'เลือกวิดีโอ'}
                    </label>
                    <input
                      type="file"
                      id="mediaFile"
                      name="mediaFile"
                      accept={newMediaType === 'image' ? 'image/*' : 'video/*'}
                      onChange={(e) => {
                        const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
                        setNewMediaFile(file);
                      }}
                      disabled={isLoading}
                      style={{ maxWidth: '180px' }}
                    />
                    <button type="button" onClick={addMediaItem} disabled={!newMediaFile || isLoading || mediaItems.length >= MAX_MEDIA} className="add-media-btn">
                      ➕ เพิ่ม
                    </button>
                  </div>
                )}

                {mediaItems.length >= MAX_MEDIA && (
                  <div className="media-limit-warning">⚠️ สามารถเพิ่มรูปภาพ/วีดีโอได้สูงสุด {MAX_MEDIA} รายการเท่านั้น</div>
                )}

                {/* Preview for new media file */}
                {newMediaFile && (
                  <div style={{ marginTop: '8px' }}>
                    <strong>Preview:</strong>
                    <br />
                    {newMediaFile.type.startsWith('image/') ? (
                      <img
                        src={URL.createObjectURL(newMediaFile)}
                        alt="Preview"
                        style={{ maxWidth: '120px', maxHeight: '120px', borderRadius: '6px', border: '1px solid #eee', marginTop: '2px' }}
                        onLoad={(e) => {
                          try { URL.revokeObjectURL((e.target as HTMLImageElement).src); } catch {}
                        }}
                      />
                    ) : (
                      <video
                        src={URL.createObjectURL(newMediaFile)}
                        controls
                        style={{ maxWidth: '120px', maxHeight: '120px', borderRadius: '6px', border: '1px solid #eee', marginTop: '2px' }}
                        onLoadedData={(e) => {
                          try { URL.revokeObjectURL((e.target as HTMLVideoElement).src); } catch {}
                        }}
                      />
                    )}
                    <div style={{ fontSize: '0.9em', color: '#666', marginTop: '2px' }}>{newMediaFile.name}</div>
                  </div>
                )}
              </div>

              {/* Media Items List */}
              {mediaItems.length > 0 && (
                <div className="media-items-list">
                  <h4>รายการรูปภาพ/วีดีโอเพิ่มเติม ({mediaItems.length})</h4>
                  <div className="media-items">
                    {mediaItems.map((item, index) => (
                      <div key={item.id} className="media-item">
                        <div className="media-preview">
                          {item.type === 'image' ? (
                            <img
                              src={item.url}
                              alt={item.alt}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/120x120?text=No+Image';
                              }}
                            />
                          ) : (
                            <div className="video-preview">
                              <img
                                src={
                                  item.thumbnail ||
                                  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjNGNEY2Ii8+Cjxwb2x5Z29uIHBvaW50cz0iMjgsNjAgNTIsNDAgMjgsMjAiIGZpbGw9IiM5QjlCOUIiLz4KPC9zdmc+'
                                }
                                alt="Video thumbnail"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/120x120?text=No+Image';
                                }}
                              />
                              <div className="video-overlay">📹</div>
                            </div>
                          )}
                        </div>
                        <div className="media-info">
                          <span className="media-type">{item.type === 'image' ? '🖼️ รูปภาพ' : '🎬 วีดีโอ'} #{index + 1}</span>
                          <span className="media-url">{item.url?.substring(0, 40)}...</span>
                        </div>
                        <button type="button" onClick={() => removeMediaItem(item.id)} className="remove-media-btn" disabled={isLoading}>
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button type="button" onClick={onCancel} className="cancel-button" disabled={isLoading}>
              ยกเลิก
            </button>
            <button type="submit" className="submit-button" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="loading-spinner"></span>
                  กำลังเพิ่มสินค้า...
                </>
              ) : (
                <>✅ เพิ่มสินค้า</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductForm;
