import React, { useState } from 'react';
import './AddProductForm.css';

interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  alt?: string;
}

interface Product {
  id?: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
  media?: MediaItem[];
}

interface AddProductFormProps {
  onSubmit: (product: Omit<Product, 'id'>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const AddProductForm: React.FC<AddProductFormProps> = ({ 
  onSubmit, 
  onCancel, 
  isLoading = false 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    stock: ''
  });

  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newMediaType, setNewMediaType] = useState<'image' | 'video'>('image');
  const [newMediaThumbnail, setNewMediaThumbnail] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'กรุณาใส่ชื่อสินค้า';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'กรุณาใส่คำอธิบายสินค้า';
    }

    if (!formData.price) {
      newErrors.price = 'กรุณาใส่ราคาสินค้า';
    } else if (parseFloat(formData.price) <= 0) {
      newErrors.price = 'ราคาต้องมากกว่า 0';
    }

    if (!formData.imageUrl.trim()) {
      newErrors.imageUrl = 'กรุณาใส่ URL รูปภาพ';
    } else if (!isValidUrl(formData.imageUrl)) {
      newErrors.imageUrl = 'URL รูปภาพไม่ถูกต้อง';
    }

    if (!formData.stock) {
      newErrors.stock = 'กรุณาใส่จำนวนสินค้าคงคลัง';
    } else if (parseInt(formData.stock) < 0) {
      newErrors.stock = 'จำนวนสินค้าต้องมากกว่าหรือเท่ากับ 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await onSubmit({
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        imageUrl: formData.imageUrl.trim(),
        stock: parseInt(formData.stock),
        media: mediaItems.length > 0 ? mediaItems : undefined
      });
      
      // Reset form
      setFormData({ name: '', description: '', price: '', imageUrl: '', stock: '' });
      setMediaItems([]);
      setErrors({});
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Media management functions
  const addMediaItem = () => {
    if (!newMediaUrl.trim()) return;
    
    // จำกัดไม่เกิน 10 media items
    if (mediaItems.length >= 10) {
      alert('⚠️ สามารถเพิ่มรูปภาพ/วีดีโอได้สูงสุด 10 รายการเท่านั้น');
      return;
    }

    const newMediaItem: MediaItem = {
      id: `media-${Date.now()}`,
      type: newMediaType,
      url: newMediaUrl.trim(),
      thumbnail: newMediaType === 'video' ? newMediaThumbnail.trim() || undefined : undefined,
      alt: `${formData.name || 'Product'} - ${newMediaType}`
    };

    setMediaItems(prev => [...prev, newMediaItem]);
    setNewMediaUrl('');
    setNewMediaThumbnail('');
  };

  const removeMediaItem = (id: string) => {
    setMediaItems(prev => prev.filter(item => item.id !== id));
  };

  const sampleImages = [
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400&h=300&fit=crop'
  ];
  
  const sampleVideos = [
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4'
  ];

  const addSampleMedia = (type: 'image' | 'video') => {
    if (mediaItems.length >= 10) {
      alert('⚠️ สามารถเพิ่มรูปภาพ/วีดีโอได้สูงสุด 10 รายการเท่านั้น');
      return;
    }
    
    const samples = type === 'image' ? sampleImages : sampleVideos;
    const randomUrl = samples[Math.floor(Math.random() * samples.length)];
    
    setNewMediaType(type);
    setNewMediaUrl(randomUrl);
    
    if (type === 'video') {
      // Set sample thumbnail for video
      setNewMediaThumbnail(sampleImages[0]);
    }
  };

  return (
    <div className="add-product-overlay">
      <div className="add-product-modal">
        <div className="modal-header">
          <h2>➕ เพิ่มสินค้าใหม่</h2>
          <button 
            onClick={onCancel} 
            className="close-button"
            disabled={isLoading}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-grid">
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
                min="0"
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

          {/* Image URL */}
          <div className="form-group">
            <label htmlFor="imageUrl">URL รูปภาพ *</label>
            <input
              type="url"
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleInputChange}
              placeholder="https://example.com/image.jpg"
              className={errors.imageUrl ? 'error' : ''}
              disabled={isLoading}
            />
            {errors.imageUrl && <span className="error-text">{errors.imageUrl}</span>}
            
            {/* Sample Images */}
            <div className="sample-images">
              <p>ตัวอย่างรูปภาพ:</p>
              <div className="sample-grid">
                {sampleImages.map((url, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, imageUrl: url }))}
                    className="sample-image"
                    disabled={isLoading}
                  >
                    <img src={url} alt={`Sample ${index + 1}`} />
                  </button>
                ))}
              </div>
            </div>
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
              min="0"
              className={errors.stock ? 'error' : ''}
              disabled={isLoading}
            />
            {errors.stock && <span className="error-text">{errors.stock}</span>}
          </div>

          {/* Additional Media Section */}
          <div className="form-group">
            <label>
              📸 รูปภาพ/วีดีโอเพิ่มเติม (สำหรับสไลด์) 
              <span className="media-count">
                ({mediaItems.length}/10 รายการ)
              </span>
            </label>
            <div className="media-manager">
              <div className="add-media-section">
                {mediaItems.length < 10 && (
                  <div className="media-input-row">
                    <select 
                      value={newMediaType}
                      onChange={(e) => setNewMediaType(e.target.value as 'image' | 'video')}
                      className="media-type-select"
                    disabled={isLoading}
                  >
                    <option value="image">รูปภาพ</option>
                    <option value="video">วีดีโอ</option>
                  </select>
                  
                  <input
                    type="url"
                    value={newMediaUrl}
                    onChange={(e) => setNewMediaUrl(e.target.value)}
                    placeholder={`URL ${newMediaType === 'image' ? 'รูปภาพ' : 'วีดีโอ'}`}
                    className="media-url-input"
                    disabled={isLoading}
                  />

                  {newMediaType === 'video' && (
                    <input
                      type="url"
                      value={newMediaThumbnail}
                      onChange={(e) => setNewMediaThumbnail(e.target.value)}
                      placeholder="URL ภาพย่อสำหรับวีดีโอ (ไม่ใส่ก็ได้)"
                      className="media-thumbnail-input"
                      disabled={isLoading}
                    />
                  )}

                  <button
                    type="button"
                    onClick={addMediaItem}
                    disabled={!newMediaUrl.trim() || isLoading || mediaItems.length >= 10}
                    className="add-media-btn"
                  >
                    ➕ เพิ่ม
                  </button>
                  
                  {/* Sample Media Buttons */}
                  <div className="sample-media-buttons">
                    <button
                      type="button"
                      onClick={() => addSampleMedia('image')}
                      disabled={isLoading || mediaItems.length >= 10}
                      className="sample-btn image"
                    >
                      📸 ตัวอย่างรูป
                    </button>
                    <button
                      type="button"
                      onClick={() => addSampleMedia('video')}
                      disabled={isLoading || mediaItems.length >= 10}
                      className="sample-btn video"
                    >
                      🎬 ตัวอย่างวีดีโอ
                    </button>
                  </div>
                </div>
                )}
                
                {mediaItems.length >= 10 && (
                  <div className="media-limit-warning">
                    ⚠️ สามารถเพิ่มรูปภาพ/วีดีโอได้สูงสุด 10 รายการเท่านั้น
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
                            <img src={item.url} alt={item.alt} />
                          ) : (
                            <div className="video-preview">
                              <img 
                                src={item.thumbnail || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjNGNEY2Ii8+Cjxwb2x5Z29uIHBvaW50cz0iMjgsNjAgNTIsNDAgMjgsMjAiIGZpbGw9IiM5QjlCOUIiLz4KPC9zdmc+'} 
                                alt="Video thumbnail" 
                              />
                              <div className="video-overlay">📹</div>
                            </div>
                          )}
                        </div>
                        <div className="media-info">
                          <span className="media-type">
                            {item.type === 'image' ? '🖼️ รูปภาพ' : '🎬 วีดีโอ'} #{index + 1}
                          </span>
                          <span className="media-url">{item.url.substring(0, 40)}...</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeMediaItem(item.id)}
                          className="remove-media-btn"
                          disabled={isLoading}
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Image Preview */}
          {formData.imageUrl && isValidUrl(formData.imageUrl) && (
            <div className="form-group">
              <label>ตัวอย่างรูปภาพ:</label>
              <div className="image-preview">
                <img 
                  src={formData.imageUrl} 
                  alt="Preview" 
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              onClick={onCancel}
              className="cancel-button"
              disabled={isLoading}
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loading-spinner"></span>
                  กำลังเพิ่มสินค้า...
                </>
              ) : (
                <>
                  ✅ เพิ่มสินค้า
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductForm;