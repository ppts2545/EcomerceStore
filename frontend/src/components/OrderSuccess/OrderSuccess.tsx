import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './OrderSuccess.css';

interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
}

interface OrderItem {
  id: number;
  product: Product;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  orderNumber: string;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    phone: string;
  };
  estimatedDelivery: string;
  status: 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  orderDate: string;
  trackingNumber?: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  picture?: string;
}

const OrderSuccess: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState<number | null>(null);
  const [reviews, setReviews] = useState<{ [productId: number]: boolean }>({});
  
  // Review form states
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewContent, setReviewContent] = useState('');
  const [reviewImages, setReviewImages] = useState<File[]>([]);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (orderId) {
      loadOrder();
    } else {
      // If no orderId, create a mock successful order
      createMockOrder();
    }
    checkAuthStatus();
  }, [orderId]);

  const createMockOrder = () => {
    const mockOrder: Order = {
      id: 1,
      orderNumber: `SH${Date.now().toString().slice(-8)}`,
      items: [
        {
          id: 1,
          product: {
            id: 1,
            name: 'Sample Product',
            price: 1500,
            imageUrl: '/placeholder-product.jpg'
          },
          quantity: 2,
          price: 3000
        }
      ],
      totalAmount: 3000,
      shippingAddress: {
        fullName: 'John Doe',
        address: '123 Main St',
        city: 'Bangkok',
        postalCode: '10100',
        phone: '02-123-4567'
      },
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'PROCESSING',
      orderDate: new Date().toISOString(),
      trackingNumber: 'TH123456789'
    };
    setOrder(mockOrder);
    setLoading(false);
  };

  const loadOrder = async () => {
    if (!orderId) return;
    
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const orderData = await response.json();
        setOrder(orderData);
        
        // Check which products have been reviewed
        for (const item of orderData.items) {
          checkProductReview(item.product.id);
        }
      } else {
        console.error('Order not found');
        createMockOrder(); // Fallback to mock order
      }
    } catch (error) {
      console.error('Error loading order:', error);
      createMockOrder(); // Fallback to mock order
    } finally {
      setLoading(false);
    }
  };

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  };

  const checkProductReview = async (productId: number) => {
    try {
      const response = await fetch(`/api/comments/product/${productId}/user-commented`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setReviews(prev => ({
          ...prev,
          [productId]: data.hasCommented
        }));
      }
    } catch (error) {
      console.error('Error checking review status:', error);
    }
  };

  const handleSubmitReview = async (productId: number) => {
    if (!reviewContent.trim() || reviewRating === 0) return;
    
    setSubmittingReview(true);
    
    try {
      const response = await fetch(`/api/comments/product/${productId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          content: reviewContent,
          rating: reviewRating
        })
      });

      if (response.ok) {
        setReviews(prev => ({ ...prev, [productId]: true }));
        setShowReviewForm(null);
        setReviewContent('');
        setReviewRating(0);
        setReviewImages([]);
        alert('Review submitted successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Error submitting review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files).slice(0, 5); // Max 5 images
      setReviewImages(files);
    }
  };

  const renderStars = (rating: number, interactive: boolean = false, onStarClick?: (rating: number) => void) => {
    return (
      <div className="stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${star <= rating ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
            onClick={() => interactive && onStarClick && onStarClick(star)}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PROCESSING': return 'status-processing';
      case 'SHIPPED': return 'status-shipped';
      case 'DELIVERED': return 'status-delivered';
      case 'CANCELLED': return 'status-cancelled';
      default: return 'status-processing';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PROCESSING': return 'กำลังดำเนินการ';
      case 'SHIPPED': return 'จัดส่งแล้ว';
      case 'DELIVERED': return 'จัดส่งสำเร็จ';
      case 'CANCELLED': return 'ยกเลิกแล้ว';
      default: return status;
    }
  };

  if (loading) {
    return <div className="order-loading">Loading order details...</div>;
  }

  if (!order) {
    return <div className="order-not-found">Order not found</div>;
  }

  return (
    <div className="order-success">
      {/* Success Header */}
      <div className="success-header">
        <div className="success-icon">
          <div className="checkmark">✓</div>
        </div>
        <h1>Order Placed Successfully!</h1>
        <p>Thank you for your purchase. Your order has been confirmed.</p>
      </div>

      {/* Order Summary */}
      <div className="order-summary-card">
        <div className="order-header">
          <h2>Order Details</h2>
          <div className="order-meta">
            <span className="order-number">Order #{order.orderNumber}</span>
            <span className={`order-status ${getStatusColor(order.status)}`}>
              {getStatusText(order.status)}
            </span>
          </div>
        </div>

        <div className="order-timeline">
          <div className="timeline-item completed">
            <div className="timeline-icon">📋</div>
            <div className="timeline-content">
              <h4>Order Confirmed</h4>
              <p>{new Date(order.orderDate).toLocaleString('th-TH')}</p>
            </div>
          </div>
          
          <div className={`timeline-item ${order.status !== 'PROCESSING' ? 'completed' : 'pending'}`}>
            <div className="timeline-icon">📦</div>
            <div className="timeline-content">
              <h4>Preparing for Shipment</h4>
              <p>{order.status === 'PROCESSING' ? 'Processing...' : 'Completed'}</p>
            </div>
          </div>
          
          <div className={`timeline-item ${order.status === 'SHIPPED' || order.status === 'DELIVERED' ? 'completed' : 'pending'}`}>
            <div className="timeline-icon">🚚</div>
            <div className="timeline-content">
              <h4>Out for Delivery</h4>
              <p>{order.trackingNumber ? `Tracking: ${order.trackingNumber}` : 'Pending'}</p>
            </div>
          </div>
          
          <div className={`timeline-item ${order.status === 'DELIVERED' ? 'completed' : 'pending'}`}>
            <div className="timeline-icon">🎉</div>
            <div className="timeline-content">
              <h4>Delivered</h4>
              <p>Estimated: {new Date(order.estimatedDelivery).toLocaleDateString('th-TH')}</p>
            </div>
          </div>
        </div>

        {/* Shipping Information */}
        <div className="shipping-info">
          <h3>Shipping Address</h3>
          <div className="address-card">
            <div className="address-header">
              <h4>{order.shippingAddress.fullName}</h4>
              <span className="phone">{order.shippingAddress.phone}</span>
            </div>
            <p className="address">
              {order.shippingAddress.address}<br />
              {order.shippingAddress.city} {order.shippingAddress.postalCode}
            </p>
          </div>
        </div>

        {/* Order Items */}
        <div className="order-items">
          <h3>Items Ordered ({order.items.length})</h3>
          <div className="items-list">
            {order.items.map((item) => (
              <div key={item.id} className="order-item">
                <div className="item-image">
                  <img 
                    src={item.product.imageUrl || '/placeholder-product.jpg'} 
                    alt={item.product.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/120x120?text=No+Image';
                    }}
                  />
                </div>
                
                <div className="item-details">
                  <h4>{item.product.name}</h4>
                  <div className="item-meta">
                    <span className="quantity">Qty: {item.quantity}</span>
                    <span className="price">฿{item.price.toLocaleString()}</span>
                  </div>
                </div>

                <div className="item-actions">
                  {order.status === 'DELIVERED' && !reviews[item.product.id] ? (
                    <button 
                      className="review-btn"
                      onClick={() => setShowReviewForm(item.product.id)}
                    >
                      Write Review
                    </button>
                  ) : reviews[item.product.id] ? (
                    <span className="reviewed">✓ Reviewed</span>
                  ) : (
                    <span className="review-pending">Review after delivery</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Total */}
        <div className="order-total">
          <div className="total-row">
            <span>Total Amount</span>
            <span className="total-amount">฿{order.totalAmount.toLocaleString()}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="order-actions">
          <button className="btn-secondary" onClick={() => navigate('/')}>
            Continue Shopping
          </button>
          <button className="btn-primary" onClick={() => navigate('/orders')}>
            View All Orders
          </button>
          {order.trackingNumber && (
            <button className="btn-outline">
              Track Package
            </button>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {showReviewForm && (
        <div className="review-modal-overlay" onClick={() => setShowReviewForm(null)}>
          <div className="review-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Write a Review</h3>
              <button 
                className="close-btn"
                onClick={() => setShowReviewForm(null)}
              >
                ×
              </button>
            </div>

            <div className="modal-content">
              {/* Product Info */}
              {order.items
                .filter(item => item.product.id === showReviewForm)
                .map(item => (
                  <div key={item.id} className="review-product-info">
                    <img 
                      src={item.product.imageUrl || '/placeholder-product.jpg'} 
                      alt={item.product.name}
                    />
                    <div>
                      <h4>{item.product.name}</h4>
                      <p>฿{item.product.price.toLocaleString()}</p>
                    </div>
                  </div>
                ))
              }

              {/* Rating */}
              <div className="rating-section">
                <label>Overall Rating *</label>
                <div className="rating-input">
                  {renderStars(reviewRating, true, setReviewRating)}
                  <span className="rating-text">
                    {reviewRating === 0 && "Select a rating"}
                    {reviewRating === 1 && "Poor"}
                    {reviewRating === 2 && "Fair"}
                    {reviewRating === 3 && "Good"}
                    {reviewRating === 4 && "Very Good"}
                    {reviewRating === 5 && "Excellent"}
                  </span>
                </div>
              </div>

              {/* Review Content */}
              <div className="review-content-section">
                <label>Your Review *</label>
                <textarea
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  placeholder="Share your experience with this product..."
                  rows={5}
                  maxLength={1000}
                />
                <div className="char-count">{reviewContent.length}/1000</div>
              </div>

              {/* Image Upload */}
              <div className="image-upload-section">
                <label>Add Photos (Optional)</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="image-input"
                />
                <div className="upload-hint">
                  Upload up to 5 photos to help others
                </div>
                
                {reviewImages.length > 0 && (
                  <div className="image-previews">
                    {reviewImages.map((image, index) => (
                      <div key={index} className="image-preview">
                        <img 
                          src={URL.createObjectURL(image)} 
                          alt={`Preview ${index + 1}`}
                        />
                        <button
                          onClick={() => setReviewImages(prev => 
                            prev.filter((_, i) => i !== index)
                          )}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="modal-actions">
                <button 
                  className="btn-secondary"
                  onClick={() => setShowReviewForm(null)}
                  disabled={submittingReview}
                >
                  Cancel
                </button>
                <button 
                  className="btn-primary"
                  onClick={() => showReviewForm && handleSubmitReview(showReviewForm)}
                  disabled={!reviewContent.trim() || reviewRating === 0 || submittingReview}
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderSuccess;
