import React, { useState, useEffect, useCallback } from 'react';
import './ProductRating.css';

interface Comment {
  id: number;
  rating: number;
  [key: string]: unknown;
}

interface ProductRatingProps {
  productId: number;
  size?: 'small' | 'medium' | 'large';
  showCount?: boolean;
  showText?: boolean;
}

interface RatingData {
  averageRating: number;
  totalComments: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

const ProductRating: React.FC<ProductRatingProps> = ({ 
  productId, 
  size = 'medium', 
  showCount = true,
  showText = false
}) => {
  const [ratingData, setRatingData] = useState<RatingData | null>(null);
  const [loading, setLoading] = useState(true);

  const calculateRatingData = useCallback((comments: Comment[]): RatingData => {
    if (!comments.length) {
      return {
        averageRating: 0,
        totalComments: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      };
    }

    const totalRating = comments.reduce((sum, comment) => sum + comment.rating, 0);
    const averageRating = totalRating / comments.length;

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    comments.forEach(comment => {
      const rating = Math.floor(comment.rating);
      if (rating >= 1 && rating <= 5) {
        distribution[rating as keyof typeof distribution]++;
      }
    });

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      totalComments: comments.length,
      ratingDistribution: distribution
    };
  }, []);

  const fetchRatingData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/comments/product/${productId}/rating`);
      if (!response.ok) {
        // If endpoint doesn't exist, fallback to getting all comments
        const commentsResponse = await fetch(`/api/comments/product/${productId}`);
        if (commentsResponse.ok) {
          const comments = await commentsResponse.json();
          const calculatedData = calculateRatingData(comments);
          setRatingData(calculatedData);
        }
        return;
      }
      
      const data = await response.json();
      setRatingData(data);
    } catch (error) {
      console.error('Error fetching rating data:', error);
      // Set default values on error
      setRatingData({
        averageRating: 0,
        totalComments: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      });
    } finally {
      setLoading(false);
    }
  }, [productId, calculateRatingData]);

  useEffect(() => {
    fetchRatingData();
  }, [fetchRatingData]);

  const renderStars = (rating: number) => {
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
    return stars;
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
      <div className={`product-rating product-rating-${size} loading`}>
        <div className="stars-skeleton">
          {[1, 2, 3, 4, 5].map(i => (
            <span key={i} className={`star star-${size} star-skeleton`}>☆</span>
          ))}
        </div>
        {showCount && <span className="rating-count skeleton-text">...</span>}
      </div>
    );
  }

  if (!ratingData || ratingData.totalComments === 0) {
    return (
      <div className={`product-rating product-rating-${size} no-rating`}>
        <div className="star-rating">
          {[1, 2, 3, 4, 5].map(i => (
            <span key={i} className={`star star-${size} star-empty`}>☆</span>
          ))}
        </div>
        {showCount && (
          <span className="rating-count no-reviews">
            ยังไม่มีรีวิว
          </span>
        )}
      </div>
    );
  }

  return (
    <div 
      className={`product-rating product-rating-${size}`}
      title={`คะแนนเฉลี่ย ${ratingData.averageRating} จาก ${ratingData.totalComments} รีวิว`}
    >
      <div className="star-rating">
        {renderStars(ratingData.averageRating)}
      </div>
      
      {showCount && (
        <span className="rating-count">
          <span className="rating-number">{ratingData.averageRating}</span>
          <span className="review-count">({ratingData.totalComments.toLocaleString()})</span>
        </span>
      )}

      {showText && (
        <span className="rating-text">
          {getRatingText(ratingData.averageRating)}
        </span>
      )}

      {size === 'large' && (
        <div className="rating-summary">
          <div className="rating-bars">
            {[5, 4, 3, 2, 1].map(rating => {
              const count = ratingData.ratingDistribution[rating as keyof typeof ratingData.ratingDistribution];
              const percentage = ratingData.totalComments > 0 ? (count / ratingData.totalComments) * 100 : 0;
              
              return (
                <div key={rating} className="rating-bar-item">
                  <span className="bar-label">{rating}★</span>
                  <div className="bar-container">
                    <div 
                      className="bar-fill" 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="bar-count">({count})</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductRating;
