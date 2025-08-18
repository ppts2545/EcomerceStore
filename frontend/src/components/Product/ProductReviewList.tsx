import React, { useEffect, useState } from "react";

export type ProductReview = {
  id?: number;
  product: number;
  user: number;
  rating: number;
  comment: string;
  createdAt?: string;
};

const ProductReviewList = ({ productId }: { productId: number }) => {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/reviews/product/${productId}`)
      .then((res) => res.json())
      .then(setReviews)
      .finally(() => setLoading(false));
  }, [productId]);

  if (loading) return <div>Loading reviews...</div>;
  if (reviews.length === 0) return <div>ยังไม่มีรีวิว</div>;

  return (
    <div className="product-review-list">
      <h3>รีวิวสินค้า</h3>
      {reviews.map((r) => (
        <div key={r.id} className="review-item">
          <div className="review-rating">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div>
          <div className="review-comment">{r.comment}</div>
          <div className="review-meta">โดย User #{r.user} | {r.createdAt?.slice(0, 10)}</div>
        </div>
      ))}
    </div>
  );
};

export default ProductReviewList;
