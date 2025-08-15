import React, { useState, useEffect } from 'react';
import './ProductComments.css';

interface User {
  id: number;
  name: string;
  email: string;
  picture?: string;
}

interface Product {
  id: number;
  name: string;
}

interface Comment {
  id: number;
  user: User;
  product: Product;
  content: string;
  rating?: number;
  parentComment?: Comment;
  replies?: Comment[];
  createdAt: string;
  updatedAt: string;
  isEdited: boolean;
}

interface CommentStats {
  totalComments: number;
  ratedComments: number;
  averageRating: number;
  fiveStarCount: number;
  fourStarCount: number;
  threeStarCount: number;
  twoStarCount: number;
  oneStarCount: number;
  fiveStarPercentage: number;
  fourStarPercentage: number;
  threeStarPercentage: number;
  twoStarPercentage: number;
  oneStarPercentage: number;
}

interface ProductCommentsProps {
  productId: number;
  isLoggedIn: boolean;
  currentUser?: User;
}

const ProductComments: React.FC<ProductCommentsProps> = ({ 
  productId, 
  isLoggedIn, 
  currentUser 
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [stats, setStats] = useState<CommentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState<number>(0);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [replyToComment, setReplyToComment] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [editCommentId, setEditCommentId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasUserCommented, setHasUserCommented] = useState(false);
  const [filterByRating, setFilterByRating] = useState<number | null>(null);

  useEffect(() => {
    loadComments();
    loadStats();
    if (isLoggedIn) {
      checkUserCommented();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, currentPage, filterByRating, isLoggedIn]);

  const loadComments = async () => {
    setLoading(true);
    try {
      let url = `/api/comments/product/${productId}?page=${currentPage}&size=10`;
      
      if (filterByRating) {
        url = `/api/comments/product/${productId}/rating/${filterByRating}`;
      }
      
      const response = await fetch(url, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (filterByRating) {
          // Make sure data is an array
          const commentsArray = Array.isArray(data) ? data : [];
          setComments(commentsArray);
          setTotalPages(1);
          await loadRepliesForComments(commentsArray);
        } else {
          // Make sure data.content is an array
          const commentsArray = Array.isArray(data.content) ? data.content : [];
          setComments(commentsArray);
          setTotalPages(data.totalPages || 0);
          await loadRepliesForComments(commentsArray);
        }
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      // Set empty array as fallback
      setComments([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const loadRepliesForComments = async (commentsList: Comment[]) => {
    // Ensure commentsList is an array
    if (!Array.isArray(commentsList) || commentsList.length === 0) {
      return;
    }

    try {
      const commentsWithReplies = await Promise.all(
        commentsList.map(async (comment) => {
          try {
            const response = await fetch(`http://localhost:8082/api/comments/${comment.id}/replies`, {
              credentials: 'include'
            });
            if (response.ok) {
              const replies = await response.json();
              // Ensure replies is an array
              const repliesArray = Array.isArray(replies) ? replies : [];
              return { ...comment, replies: repliesArray };
            }
          } catch (error) {
            console.error('Error loading replies:', error);
          }
          return comment;
        })
      );
      
      setComments(commentsWithReplies);
    } catch (error) {
      console.error('Error in loadRepliesForComments:', error);
    }
  };

  const loadStats = async () => {
    try {
  const response = await fetch(`http://localhost:8082/api/comments/product/${productId}/stats`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const checkUserCommented = async () => {
    try {
  const response = await fetch(`http://localhost:8082/api/comments/product/${productId}/user-commented`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setHasUserCommented(data.hasCommented);
      }
    } catch (error) {
      console.error('Error checking user comment:', error);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
  const response = await fetch(`http://localhost:8082/api/comments/product/${productId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          content: newComment,
          rating: newRating || null
        })
      });

      if (response.ok) {
        setNewComment('');
        setNewRating(0);
        setShowCommentForm(false);
        loadComments();
        loadStats();
        checkUserCommented();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Error adding comment');
    }
  };

  const handleSubmitReply = async (commentId: number) => {
    if (!replyContent.trim()) return;

    try {
  const response = await fetch(`http://localhost:8082/api/comments/${commentId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content: replyContent })
      });

      if (response.ok) {
        setReplyContent('');
        setReplyToComment(null);
        loadComments();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add reply');
      }
    } catch (error) {
      console.error('Error adding reply:', error);
      alert('Error adding reply');
    }
  };

  const handleUpdateComment = async (commentId: number) => {
    if (!editContent.trim()) return;

    try {
  const response = await fetch(`http://localhost:8082/api/comments/${commentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content: editContent })
      });

      if (response.ok) {
        setEditCommentId(null);
        setEditContent('');
        loadComments();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update comment');
      }
    } catch (error) {
      console.error('Error updating comment:', error);
      alert('Error updating comment');
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
  const response = await fetch(`http://localhost:8082/api/comments/${commentId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        loadComments();
        loadStats();
        checkUserCommented();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete comment');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Error deleting comment');
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

  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
    return `${Math.floor(diffInSeconds / 31536000)} years ago`;
  };

  if (loading) {
    return <div className="comments-loading">Loading comments...</div>;
  }

  return (
    <div className="product-comments">
      <h3>Customer Reviews</h3>
      
      {/* Rating Statistics */}
      {stats && (
        <div className="rating-stats">
          <div className="overall-rating">
            <div className="average-score">
              <span className="score">{stats.averageRating.toFixed(1)}</span>
              {renderStars(Math.round(stats.averageRating))}
              <span className="total-reviews">({stats.totalComments} reviews)</span>
            </div>
          </div>
          
          <div className="rating-breakdown">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = rating === 5 ? stats.fiveStarCount :
                           rating === 4 ? stats.fourStarCount :
                           rating === 3 ? stats.threeStarCount :
                           rating === 2 ? stats.twoStarCount :
                           stats.oneStarCount;
              const percentage = rating === 5 ? stats.fiveStarPercentage :
                                rating === 4 ? stats.fourStarPercentage :
                                rating === 3 ? stats.threeStarPercentage :
                                rating === 2 ? stats.twoStarPercentage :
                                stats.oneStarPercentage;
              
              return (
                <div key={rating} className="rating-row">
                  <button 
                    className={`rating-filter ${filterByRating === rating ? 'active' : ''}`}
                    onClick={() => setFilterByRating(filterByRating === rating ? null : rating)}
                  >
                    {renderStars(rating)} ({count})
                  </button>
                  <div className="rating-bar">
                    <div 
                      className="rating-fill" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="rating-percent">{percentage.toFixed(0)}%</span>
                </div>
              );
            })}
          </div>
          
          {filterByRating && (
            <button 
              className="clear-filter" 
              onClick={() => setFilterByRating(null)}
            >
              Show All Reviews
            </button>
          )}
        </div>
      )}

      {/* Add Comment Section */}
      {isLoggedIn && (
        <div className="add-comment-section">
          {!showCommentForm ? (
            <button 
              className="write-review-btn"
              onClick={() => setShowCommentForm(true)}
              disabled={hasUserCommented}
            >
              {hasUserCommented ? 'You have already reviewed this product' : 'Write a Review'}
            </button>
          ) : (
            <form onSubmit={handleSubmitComment} className="comment-form">
              <div className="rating-input">
                <label>Rating:</label>
                {renderStars(newRating, true, setNewRating)}
              </div>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write your review..."
                rows={4}
                required
              />
              <div className="form-actions">
                <button type="submit">Submit Review</button>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowCommentForm(false);
                    setNewComment('');
                    setNewRating(0);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {!isLoggedIn && (
        <div className="login-prompt">
          <p>Please <a href="/login">login</a> to write a review.</p>
        </div>
      )}

      {/* Comments List */}
      <div className="comments-list">
        {comments.length === 0 ? (
          <div className="no-comments">
            <div className="empty-reviews-container">
              <div className="empty-reviews-icon">💭</div>
              <h4>ยังไม่มีรีวิวสำหรับสินค้านี้</h4>
              <p>เป็นคนแรกที่รีวิวสินค้านี้!</p>
              {isLoggedIn && (
                <button 
                  className="write-first-review-btn"
                  onClick={() => setShowCommentForm(true)}
                >
                  เขียนรีวิวแรก
                </button>
              )}
            </div>
          </div>
        ) : (
          comments.map((comment) => (
          <div key={comment.id} className="comment-item">
            <div className="comment-header">
              <div className="user-info">
                {comment.user.picture && (
                  <img 
                    src={comment.user.picture} 
                    alt={comment.user.name} 
                    className="user-avatar" 
                  />
                )}
                <div>
                  <span className="user-name">{comment.user.name}</span>
                  <span className="comment-time">{timeAgo(comment.createdAt)}</span>
                  {comment.isEdited && <span className="edited-label">(edited)</span>}
                </div>
              </div>
              {comment.rating && renderStars(comment.rating)}
            </div>

            <div className="comment-content">
              {editCommentId === comment.id ? (
                <div className="edit-form">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={3}
                  />
                  <div className="form-actions">
                    <button onClick={() => handleUpdateComment(comment.id)}>Save</button>
                    <button onClick={() => {
                      setEditCommentId(null);
                      setEditContent('');
                    }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <p>{comment.content}</p>
              )}
            </div>

            <div className="comment-actions">
              {isLoggedIn && (
                <button 
                  onClick={() => setReplyToComment(replyToComment === comment.id ? null : comment.id)}
                >
                  Reply
                </button>
              )}
              
              {isLoggedIn && currentUser?.id === comment.user.id && (
                <>
                  <button onClick={() => {
                    setEditCommentId(comment.id);
                    setEditContent(comment.content);
                  }}>Edit</button>
                  <button 
                    onClick={() => handleDeleteComment(comment.id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>

            {/* Reply Form */}
            {replyToComment === comment.id && (
              <div className="reply-form">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write your reply..."
                  rows={2}
                />
                <div className="form-actions">
                  <button onClick={() => handleSubmitReply(comment.id)}>Reply</button>
                  <button onClick={() => {
                    setReplyToComment(null);
                    setReplyContent('');
                  }}>Cancel</button>
                </div>
              </div>
            )}

            {/* Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="replies">
                {comment.replies.map((reply) => (
                  <div key={reply.id} className="reply-item">
                    <div className="comment-header">
                      <div className="user-info">
                        {reply.user.picture && (
                          <img 
                            src={reply.user.picture} 
                            alt={reply.user.name} 
                            className="user-avatar small" 
                          />
                        )}
                        <div>
                          <span className="user-name">{reply.user.name}</span>
                          <span className="comment-time">{timeAgo(reply.createdAt)}</span>
                          {reply.isEdited && <span className="edited-label">(edited)</span>}
                        </div>
                      </div>
                    </div>
                    <div className="comment-content">
                      <p>{reply.content}</p>
                    </div>
                    
                    {isLoggedIn && currentUser?.id === reply.user.id && (
                      <div className="comment-actions">
                        <button 
                          onClick={() => handleDeleteComment(reply.id)}
                          className="delete-btn small"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
        )}
      </div>

      {/* Pagination */}
      {!filterByRating && totalPages > 1 && (
        <div className="pagination">
          <button 
            disabled={currentPage === 0}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </button>
          
          <span className="page-info">
            Page {currentPage + 1} of {totalPages}
          </span>
          
          <button 
            disabled={currentPage >= totalPages - 1}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductComments;
