import React, { useState } from "react";
import type { ProductReview } from "./ProductReviewList";

const ProductReviewForm = ({ productId, userId, onSuccess }: { productId: number; userId: number; onSuccess?: () => void }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const review: ProductReview = {
        product: productId,
        user: userId,
        rating,
        comment
      };
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(review)
      });
      if (!res.ok) throw new Error("ส่งรีวิวไม่สำเร็จ");
      setSuccess(true);
      setComment("");
      setRating(5);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="product-review-form" onSubmit={handleSubmit}>
      <h4>ให้คะแนนและรีวิวสินค้า</h4>
      <div>
        <span>คะแนน: </span>
        {[1,2,3,4,5].map((n) => (
          <label key={n}>
            <input type="radio" name="rating" value={n} checked={rating === n} onChange={() => setRating(n)} />
            {n}
          </label>
        ))}
      </div>
      <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="เขียนรีวิว..." required />
      <button type="submit" disabled={loading}>{loading ? "กำลังส่ง..." : "ส่งรีวิว"}</button>
      {error && <div className="form-error">{error}</div>}
      {success && <div className="form-success">ส่งรีวิวสำเร็จ!</div>}
    </form>
  );
};

export default ProductReviewForm;
