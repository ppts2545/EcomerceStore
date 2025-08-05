import React, { useState } from 'react';
import './AddProductForm.css';

interface Product {
  id?: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
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
        stock: parseInt(formData.stock)
      });
      
      // Reset form
      setFormData({ name: '', description: '', price: '', imageUrl: '', stock: '' });
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

  const sampleImages = [
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400&h=300&fit=crop'
  ];

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