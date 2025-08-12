import React, { useState, useEffect } from 'react';
import ProductComments from '../ProductComments/ProductComments';
import './ProductDetail.css';

interface MediaItem {
  id: string | number;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  alt?: string;
  displayOrder?: number;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
  category?: string;
  mediaItems?: MediaItem[]; // Backend media items
}

interface ProductDetailProps {
  product: Product | null;
  onAddToCart: (productId: number, quantity: number) => void;
  onCartClick?: () => void;
  loading?: boolean;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ 
  product, 
  onAddToCart, 
  onCartClick,
  loading = false
}) => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('http://localhost:8082/api/auth/user', {
          credentials: 'include'
        });
        setIsLoggedIn(response.ok);
      } catch (error) {
        setIsLoggedIn(false);
      }
    };
    checkAuth();
  }, []);

  // Create media array from product data
  const mediaItems: MediaItem[] = React.useMemo(() => {
    if (!product) return [];
    
    const items: MediaItem[] = [
      {
        id: 'main-image',
        type: 'image',
        url: product.imageUrl,
        alt: product.name
      }
    ];

    // Add additional media if available
    if (product.mediaItems) {
      // Convert backend MediaItem format to frontend format
      const backendMedia = product.mediaItems.map(item => ({
        id: item.id.toString(),
        type: item.type,
        url: item.url,
        thumbnail: item.thumbnail,
        alt: item.alt || product.name
      }));
      items.push(...backendMedia);
    }

    return items;
  }, [product]);

  const currentMedia = mediaItems[currentMediaIndex];

  const handlePrevious = () => {
    setCurrentMediaIndex(prev => 
      prev === 0 ? mediaItems.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentMediaIndex(prev => 
      prev === mediaItems.length - 1 ? 0 : prev + 1
    );
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentMediaIndex(index);
  };

  const handleQuantityChange = (delta: number) => {
    if (!product) return;
    setQuantity(prev => {
      const newQuantity = prev + delta;
      return Math.max(1, Math.min(product.stock, newQuantity));
    });
  };

  const handleAddToCart = () => {
    if (product && product.stock > 0) {
      onAddToCart(product.id, quantity);
    }
  };

  const handleBuyNow = () => {
    if (product && product.stock > 0) {
      // เพิ่มสินค้าลงตะกร้าก่อน
      onAddToCart(product.id, quantity);
      
      // เปิดตะกร้าสินค้า
      if (onCartClick) {
        setTimeout(() => {
          onCartClick();
        }, 500); // รอ 500ms เพื่อให้เพิ่มสินค้าเสร็จก่อน
      }
    }
  };

  if (loading) {
    return (
      <div className="product-detail-loading">
        <div className="loading-spinner"></div>
        <p>Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail-error">
        <h2>Product not found</h2>
        <p>The requested product could not be found.</p>
      </div>
    );
  }

  return (
    <div className="product-detail">
      <div className="product-detail-container">
        {/* Media Section */}
        <div className="media-section">
          <div className="main-media">
            {currentMedia?.type === 'video' ? (
              <video
                key={currentMedia.url}
                controls
                autoPlay={isPlaying}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                className="media-video"
              >
                <source src={currentMedia.url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <img
                src={currentMedia?.url || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjYwMCIgdmlld0JveD0iMCAwIDYwMCA2MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zMDAgMjMwTDMwMCAzMDAiIHN0cm9rZT0iIzlCOUI5QiIgc3Ryb2tlLXdpZHRoPSI4IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjYwMCIgdmlld0JveD0iMCAwIDYwMCA2MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNzAgMjY1TDMwMCAzMDBMMzMwIDI2NSIgc3Ryb2tlPSIjOUI5QjlCIiBzdHJva2Utd2lkdGg9IjgiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8cmVjdCB4PSIyMDAiIHk9IjM0MCIgd2lkdGg9IjIwMCIgaGVpZ2h0PSIxMDAiIHJ4PSIxMiIgc3Ryb2tlPSIjOUI5QjlCIiBzdHJva2Utd2lkdGg9IjgiLz4KPGNpcmNsZSBjeD0iMzAwIiBjeT0iMzcwIiByPSIzMCIgZmlsbD0iIzlCOUI5QiIvPgo8L3N2Zz4='}
                alt={currentMedia?.alt || product.name}
                className="media-image"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 
                    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjYwMCIgdmlld0JveD0iMCAwIDYwMCA2MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zMDAgMjMwTDMwMCAzMDAiIHN0cm9rZT0iIzlCOUI5QiIgc3Ryb2tlLXdpZHRoPSI4IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjYwMCIgdmlld0JveD0iMCAwIDYwMCA2MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNzAgMjY1TDMwMCAzMDBMMzMwIDI2NSIgc3Ryb2tlPSIjOUI5QjlCIiBzdHJva2Utd2lkdGg9IjgiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8cmVjdCB4PSIyMDAiIHk9IjM0MCIgd2lkdGg9IjIwMCIgaGVpZ2h0PSIxMDAiIHJ4PSIxMiIgc3Ryb2tlPSIjOUI5QjlCIiBzdHJva2Utd2lkdGg9IjgiLz4KPGNpcmNsZSBjeD0iMzAwIiBjeT0iMzcwIiByPSIzMCIgZmlsbD0iIzlCOUI5QiIvPgo8L3N2Zz4=';
                }}
              />
            )}
            
            {/* Navigation Controls */}
            {mediaItems.length > 1 && (
              <>
                <button 
                  className="media-nav prev" 
                  onClick={handlePrevious}
                  aria-label="Previous image"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                  </svg>
                </button>
                <button 
                  className="media-nav next" 
                  onClick={handleNext}
                  aria-label="Next image"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                  </svg>
                </button>
              </>
            )}

            {/* Media Counter */}
            {mediaItems.length > 1 && (
              <div className="media-counter">
                {currentMediaIndex + 1} / {mediaItems.length}
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {mediaItems.length > 1 && (
            <div className="thumbnails">
              {mediaItems.map((item, index) => (
                <div
                  key={item.id}
                  className={`thumbnail ${index === currentMediaIndex ? 'active' : ''}`}
                  onClick={() => handleThumbnailClick(index)}
                >
                  {item.type === 'video' ? (
                    <div className="video-thumbnail">
                      <img
                        src={item.thumbnail || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjNGNEY2Ii8+Cjxwb2x5Z29uIHBvaW50cz0iMjgsNjAgNTIsNDAgMjgsMjAiIGZpbGw9IiM5QjlCOUIiLz4KPC9zdmc+'}
                        alt="Video thumbnail"
                      />
                      <div className="play-icon">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={item.url}
                      alt={item.alt || `Thumbnail ${index + 1}`}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 
                          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjQwIiBjeT0iNDAiIHI9IjE1IiBmaWxsPSIjOUI5QjlCIi8+CjxwYXRoIGQ9Ik0yNSA1MEw0MCA0MEw1NSA1MEw0MCA2MEwyNSA1MFoiIGZpbGw9IiM5QjlCOUIiLz4KPC9zdmc+';
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info Section */}
        <div className="product-info">
          <h1 className="product-title">{product.name}</h1>
          
          <div className="product-rating">
            <div className="stars">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="star filled">★</span>
              ))}
            </div>
            <span className="rating-value">4.9</span>
            <span className="divider">|</span>
            <span className="sold-count">12 ขายแล้ว</span>
          </div>

          <div className="price-section">
            <div className="current-price">
              ฿{(product.price * 35).toLocaleString()}
            </div>
            <div className="original-price">
              ฿{(product.price * 35 * 1.2).toLocaleString()}
            </div>
            <div className="discount-badge">-17%</div>
          </div>

          <div className="product-description">
            <h3>รายละเอียดสินค้า</h3>
            <p>{product.description}</p>
          </div>

          <div className="quantity-section">
            <span className="quantity-label">จำนวน</span>
            <div className="quantity-controls">
              <button 
                className="quantity-btn"
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
              >
                -
              </button>
              <span className="quantity-display">{quantity}</span>
              <button 
                className="quantity-btn"
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= product.stock}
              >
                +
              </button>
              <span className="stock-info">
                {product.stock > 0 ? `${product.stock} ชิ้นที่มีอยู่` : 'สินค้าหมด'}
              </span>
            </div>
          </div>

          <div className="action-buttons">
            <button 
              className="add-to-cart-btn"
              onClick={handleAddToCart}
              disabled={product.stock === 0 || quantity > product.stock}
            >
              {product.stock > 0 ? 'เพิ่มในตะกร้า' : 'สินค้าหมด'}
            </button>
            <button 
              className="buy-now-btn"
              onClick={handleBuyNow}
              disabled={product.stock === 0 || quantity > product.stock}
            >
              ซื้อเลย
            </button>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      {product && (
        <div className="comments-section">
          <ProductComments 
            productId={product.id}
            isLoggedIn={isLoggedIn}
          />
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
