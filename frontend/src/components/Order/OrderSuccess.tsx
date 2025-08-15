import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './OrderSuccess.css';

interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface Order {
  id: number;
  orderNumber: string;
  totalAmount: number;
  status: string;
  statusDisplayName: string;
  createdAt: string;
  estimatedDelivery: string;
  shippingAddress: string;
  phoneNumber: string;
  orderItems: OrderItem[];
}

const OrderSuccess: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<OrderItem | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
  const response = await fetch(`http://localhost:8082/api/orders/number/${orderNumber}`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Order not found');
        }
        
        const orderData = await response.json();
        setOrder(orderData);
      } catch (error) {
        console.error('Error fetching order:', error);
        setError('ไม่สามารถดึงข้อมูลคำสั่งซื้อได้');
      } finally {
        setLoading(false);
      }
    };

    if (orderNumber) {
      fetchOrder();
    }
  }, [orderNumber]);

  const handleWriteReview = (orderItem: OrderItem) => {
    setSelectedProduct(orderItem);
    setShowReviewModal(true);
  };

  const handleCloseReviewModal = () => {
    setShowReviewModal(false);
    setSelectedProduct(null);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('th-TH').format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    const statusColors: { [key: string]: string } = {
      'PENDING': '#f59e0b',
      'CONFIRMED': '#3b82f6',
      'PROCESSING': '#6366f1',
      'SHIPPED': '#8b5cf6',
      'DELIVERED': '#10b981',
      'CANCELLED': '#ef4444',
      'RETURNED': '#f59e0b'
    };
    return statusColors[status] || '#6b7280';
  };

  if (loading) {
    return (
      <div className="order-success-loading">
        <div className="loading-spinner"></div>
        <p>กำลังโหลดข้อมูลคำสั่งซื้อ...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="order-success-error">
        <div className="error-icon">❌</div>
        <h2>ไม่สามารถแสดงข้อมูลคำสั่งซื้อได้</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/')} className="back-home-btn">
          กลับหน้าหลัก
        </button>
      </div>
    );
  }

  return (
    <div className="order-success-container">
      <div className="order-success-header">
        <div className="success-animation">
          <div className="success-checkmark">
            <div className="check-icon">
              <span className="icon-line line-tip"></span>
              <span className="icon-line line-long"></span>
              <div className="icon-circle"></div>
              <div className="icon-fix"></div>
            </div>
          </div>
        </div>
        <h1>สั่งซื้อสำเร็จ!</h1>
        <p className="success-message">
          ขอบคุณที่เลือกซื้อสินค้ากับเรา คำสั่งซื้อของคุณได้รับการยืนยันแล้ว
        </p>
      </div>

      <div className="order-info-card">
        <div className="order-header">
          <h2>รายละเอียดคำสั่งซื้อ</h2>
          <div className="order-number">
            เลขที่คำสั่งซื้อ: <strong>{order.orderNumber}</strong>
          </div>
        </div>

        <div className="order-status-timeline">
          <div className="status-item">
            <div className="status-icon" style={{ backgroundColor: getStatusColor(order.status) }}>
              <span>{order.status === 'DELIVERED' ? '✓' : '⏳'}</span>
            </div>
            <div className="status-info">
              <h4>สถานะปัจจุบัน</h4>
              <p>{order.statusDisplayName}</p>
              <small>อัปเดตล่าสุด: {formatDate(order.createdAt)}</small>
            </div>
          </div>
        </div>

        <div className="order-details-grid">
          <div className="delivery-info">
            <h3>📅 การจัดส่ง</h3>
            <p><strong>ที่อยู่จัดส่ง:</strong> {order.shippingAddress}</p>
            <p><strong>เบอร์โทรศัพท์:</strong> {order.phoneNumber}</p>
            <p><strong>วันที่คาดว่าจะได้รับ:</strong> {formatDate(order.estimatedDelivery)}</p>
          </div>
          
          <div className="payment-info">
            <h3>💰 ข้อมูลการชำระเงิน</h3>
            <p><strong>ยอดรวมทั้งหมด:</strong> ฿{formatPrice(order.totalAmount)}</p>
            <p><strong>วิธีการชำระ:</strong> ชำระเงินปลายทาง</p>
          </div>
        </div>

        <div className="order-items">
          <h3>🛍️ รายการสินค้า</h3>
          <div className="items-list">
            {order.orderItems.map((item) => (
              <div key={item.id} className="order-item">
                <div className="item-image">
                  <img src={item.productImage || '/api/placeholder/80/80'} alt={item.productName} />
                </div>
                <div className="item-details">
                  <h4>{item.productName}</h4>
                  <div className="item-price">
                    <span className="quantity">จำนวน: {item.quantity}</span>
                    <span className="unit-price">฿{formatPrice(item.unitPrice)} × {item.quantity}</span>
                  </div>
                  <div className="item-total">
                    <strong>฿{formatPrice(item.subtotal)}</strong>
                  </div>
                </div>
                <div className="item-actions">
                  <button 
                    className="review-btn"
                    onClick={() => handleWriteReview(item)}
                  >
                    เขียนรีวิว
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="order-total">
          <div className="total-row">
            <span>ยอดรวมทั้งหมด:</span>
            <strong>฿{formatPrice(order.totalAmount)}</strong>
          </div>
        </div>
      </div>

      <div className="order-actions">
        <button 
          className="track-order-btn"
          onClick={() => navigate(`/orders/${order.id}`)}
        >
          ติดตามสถานะการจัดส่ง
        </button>
        <button 
          className="continue-shopping-btn"
          onClick={() => navigate('/')}
        >
          เลือกซื้อสินค้าต่อ
        </button>
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedProduct && (
        <ReviewModal 
          product={selectedProduct}
          onClose={handleCloseReviewModal}
        />
      )}
    </div>
  );
};

// Review Modal Component
interface ReviewModalProps {
  product: OrderItem;
  onClose: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ product, onClose }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitReview = async () => {
    if (rating === 0) {
      alert('กรุณาให้คะแนนสินค้า');
      return;
    }

    setSubmitting(true);
    try {
  const response = await fetch(`http://localhost:8082/api/comments/product/${product.productId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          content: comment,
          rating: rating
        })
      });

      if (response.ok) {
        alert('ส่งรีวิวสำเร็จ!');
        onClose();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'เกิดข้อผิดพลาดในการส่งรีวิว');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('เกิดข้อผิดพลาดในการส่งรีวิว');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="review-modal-overlay">
      <div className="review-modal">
        <div className="modal-header">
          <h3>เขียนรีวิวสินค้า</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="product-info">
            <img src={product.productImage || '/api/placeholder/60/60'} alt={product.productName} />
            <div>
              <h4>{product.productName}</h4>
              <p>จำนวน: {product.quantity} ชิ้น</p>
            </div>
          </div>

          <div className="rating-section">
            <label>คะแนนของคุณ:</label>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`star ${star <= rating ? 'active' : ''}`}
                  onClick={() => setRating(star)}
                >
                  ⭐
                </span>
              ))}
            </div>
          </div>

          <div className="comment-section">
            <label>ความคิดเห็น:</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="แชร์ประสบการณ์การใช้งานสินค้านี้..."
              rows={4}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose} disabled={submitting}>
            ยกเลิก
          </button>
          <button 
            className="submit-review-btn" 
            onClick={handleSubmitReview}
            disabled={submitting}
          >
            {submitting ? 'กำลังส่ง...' : 'ส่งรีวิว'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
