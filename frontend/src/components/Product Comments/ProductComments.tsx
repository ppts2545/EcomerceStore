import React, { useState, useEffect, useCallback } from 'react';
import './ProductComments.css';

interface Comment {
  id: number;
  productId: number;
  userId: number;
  userName: string;
  userPicture?: string;
  comment: string;
  rating: number;
  createdAt: string;
  replies?: Comment[];
}

interface ProductCommentsProps {
  productId: number;
}

const ProductComments: React.FC<ProductCommentsProps> = ({ productId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [visibleComments, setVisibleComments] = useState<Comment[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [totalComments, setTotalComments] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'rating_high' | 'rating_low'>('newest');
  
  const INITIAL_DISPLAY_COUNT = 15;

  const updateVisibleComments = useCallback(() => {
    if (showAll) {
      setVisibleComments(comments);
    } else {
      setVisibleComments(comments.slice(0, INITIAL_DISPLAY_COUNT));
    }
  }, [comments, showAll]);

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/comments/product/${productId}`);
      if (!response.ok) throw new Error('Failed to fetch comments');
      
      const data = await response.json();
      const sortedComments = [...data];

      // Sort comments based on selected option
      switch (sortBy) {
        case 'newest':
          sortedComments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        case 'oldest':
          sortedComments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          break;
        case 'rating_high':
          sortedComments.sort((a, b) => b.rating - a.rating);
          break;
        case 'rating_low':
          sortedComments.sort((a, b) => a.rating - b.rating);
          break;
      }

      setComments(sortedComments);
      setTotalComments(sortedComments.length);
      
      // Calculate average rating
      if (sortedComments.length > 0) {
        const avg = sortedComments.reduce((sum, comment) => sum + comment.rating, 0) / sortedComments.length;
        setAverageRating(Math.round(avg * 10) / 10);
      }
    } catch (err) {
      setError('Failed to load comments');
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  }, [productId, sortBy]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  useEffect(() => {
    updateVisibleComments();
  }, [updateVisibleComments]);

  const handleShowAll = () => {
    setShowAll(!showAll);
  };

  const renderStars = (rating: number, size: 'small' | 'medium' | 'large' = 'medium') => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <span key={i} className={`star star-${size} star-filled`}>★</span>
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <span key={i} className={`star star-${size} star-half`}>★</span>
        );
      } else {
        stars.push(
          <span key={i} className={`star star-${size} star-empty`}>☆</span>
        );
      }
    }
    return <div className="star-rating">{stars}</div>;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'เมื่อสักครู่';
    if (diffInHours < 24) return `${diffInHours} ชั่วโมงที่แล้ว`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} วันที่แล้ว`;
    
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRatingText = (rating: number) => {
    if (rating >= 4.5) return 'ยอดเยี่ยม';
    if (rating >= 4) return 'ดีมาก';
    if (rating >= 3.5) return 'ดี';
    if (rating >= 3) return 'พอใช้';
    if (rating >= 2) return 'ต่ำ';
    return 'แย่มาก';
  };

  if (loading) {
    return (
      <div className="comments-section">
        <div className="comments-loading">
          <div className="loading-spinner"></div>
          <p>กำลังโหลดรีวิว...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="comments-section">
        <div className="comments-error">
          <p>ไม่สามารถโหลดรีวิวได้</p>
          <button onClick={fetchComments} className="retry-btn">ลองใหม่</button>
        </div>
      </div>
    );
  }

  return (
    <div className="comments-section">
      {/* Rating Summary */}
      <div className="rating-summary">
        <div className="rating-overview">
          <div className="rating-score">
            <span className="score-number">{averageRating}</span>
            <div className="rating-details">
              {renderStars(averageRating, 'large')}
              <span className="rating-text">{getRatingText(averageRating)}</span>
            </div>
          </div>
          <div className="rating-stats">
            <p className="total-reviews">{totalComments.toLocaleString()} รีวิว</p>
            <p className="verified-purchases">จากผู้ซื้อจริง</p>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="rating-distribution">
          {[5, 4, 3, 2, 1].map(rating => {
            const count = comments.filter(c => Math.floor(c.rating) === rating).length;
            const percentage = totalComments > 0 ? (count / totalComments) * 100 : 0;
            
            return (
              <div key={rating} className="rating-bar">
                <span className="rating-label">{rating} ★</span>
                <div className="bar-container">
                  <div 
                    className="bar-fill" 
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="rating-count">({count})</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sort Options */}
      <div className="comments-header">
        <h3>รีวิวจากลูกค้า</h3>
        <div className="sort-controls">
          <label htmlFor="sort-select">เรียงตาม:</label>
          <select 
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'rating_high' | 'rating_low')}
            className="sort-select"
          >
            <option value="newest">ล่าสุด</option>
            <option value="oldest">เก่าสุด</option>
            <option value="rating_high">คะแนนสูงสุด</option>
            <option value="rating_low">คะแนนต่ำสุด</option>
          </select>
        </div>
      </div>

      {/* Comments List */}
      <div className="comments-list">
        {visibleComments.length === 0 ? (
          <div className="no-comments">
            <div className="no-comments-icon">💬</div>
            <h4>ยังไม่มีรีวิว</h4>
            <p>เป็นคนแรกที่รีวิวสินค้านี้</p>
          </div>
        ) : (
          <>
            {visibleComments.map((comment) => (
              <div key={comment.id} className="comment-card">
                <div className="comment-header">
                  <div className="user-info">
                    <div className="user-avatar">
                      {comment.userPicture ? (
                        <img src={comment.userPicture} alt={comment.userName} />
                      ) : (
                        <div className="avatar-placeholder">
                          {comment.userName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="user-details">
                      <h4 className="user-name">{comment.userName}</h4>
                      <div className="comment-meta">
                        {renderStars(comment.rating, 'small')}
                        <span className="comment-date">{formatDate(comment.createdAt)}</span>
                        <span className="verified-badge">✓ ซื้อแล้ว</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="comment-content">
                  <p>{comment.comment}</p>
                </div>

                {comment.replies && comment.replies.length > 0 && (
                  <div className="comment-replies">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="reply-card">
                        <div className="reply-header">
                          <strong>{reply.userName}</strong>
                          <span className="reply-date">{formatDate(reply.createdAt)}</span>
                        </div>
                        <p className="reply-content">{reply.comment}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="comment-actions">
                  <button className="action-btn">
                    <span className="action-icon">👍</span>
                    มีประโยชน์
                  </button>
                  <button className="action-btn">
                    <span className="action-icon">💬</span>
                    ตอบกลับ
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Show More/Less Button */}
      {comments.length > INITIAL_DISPLAY_COUNT && (
        <div className="show-more-section">
          <button 
            className="show-more-btn"
            onClick={handleShowAll}
          >
            {showAll ? (
              <>
                <span>ซ่อนรีวิว</span>
                <span className="btn-icon">↑</span>
              </>
            ) : (
              <>
                <span>ดูรีวิวทั้งหมด ({comments.length - INITIAL_DISPLAY_COUNT} รายการ)</span>
                <span className="btn-icon">↓</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Write Review Call-to-Action */}
      <div className="write-review-cta">
        <div className="cta-content">
          <h4>แบ่งปันประสบการณ์ของคุณ</h4>
          <p>ช่วยลูกค้าคนอื่นตัดสินใจด้วยรีวิวของคุณ</p>
        </div>
        <button className="write-review-btn">
          <span className="btn-icon">✍️</span>
          เขียนรีวิว
        </button>
      </div>
    </div>
  );
};

export default ProductComments;
