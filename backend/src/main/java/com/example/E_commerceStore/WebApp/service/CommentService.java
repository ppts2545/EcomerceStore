package com.example.E_commerceStore.WebApp.service;

import com.example.E_commerceStore.WebApp.model.Comment;
import com.example.E_commerceStore.WebApp.model.Product;
import com.example.E_commerceStore.WebApp.model.User;
import com.example.E_commerceStore.WebApp.repository.CommentRepository;
import com.example.E_commerceStore.WebApp.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CommentService {
    
    @Autowired
    private CommentRepository commentRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    /**
     * เพิ่ม comment ใหม่
     */
    public Comment addComment(User user, Long productId, String content, Integer rating) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found: " + productId));
        
        // ตรวจสอบ content
        if (content == null || content.trim().isEmpty()) {
            throw new RuntimeException("Comment content cannot be empty");
        }
        
        // ตรวจสอบ rating (ถ้ามี)
        if (rating != null && (rating < 1 || rating > 5)) {
            throw new RuntimeException("Rating must be between 1 and 5");
        }
        
        Comment comment = new Comment(user, product, content.trim(), rating);
        return commentRepository.save(comment);
    }
    
    /**
     * เพิ่ม reply ให้กับ comment
     */
    public Comment addReply(User user, Long parentCommentId, String content) {
        Comment parentComment = commentRepository.findById(parentCommentId)
            .orElseThrow(() -> new RuntimeException("Parent comment not found: " + parentCommentId));
        
        // ตรวจสอบ content
        if (content == null || content.trim().isEmpty()) {
            throw new RuntimeException("Reply content cannot be empty");
        }
        
        Comment reply = new Comment(user, parentComment.getProduct(), content.trim());
        reply.setParentComment(parentComment);
        
        return commentRepository.save(reply);
    }
    
    /**
     * แก้ไข comment
     */
    public Comment updateComment(User user, Long commentId, String newContent) {
        Comment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new RuntimeException("Comment not found: " + commentId));
        
        // ตรวจสอบเจ้าของ comment
        if (!comment.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You can only edit your own comments");
        }
        
        // ตรวจสอบ content
        if (newContent == null || newContent.trim().isEmpty()) {
            throw new RuntimeException("Comment content cannot be empty");
        }
        
        comment.setContent(newContent.trim());
        comment.setUpdatedAt(LocalDateTime.now());
        comment.setIsEdited(true);
        
        return commentRepository.save(comment);
    }
    
    /**
     * ลบ comment
     */
    public void deleteComment(User user, Long commentId) {
        Comment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new RuntimeException("Comment not found: " + commentId));
        
        // ตรวจสอบเจ้าของ comment
        if (!comment.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You can only delete your own comments");
        }
        
        commentRepository.delete(comment);
    }
    
    /**
     * ดู comments ของสินค้า (แบบ pagination)
     */
    public Page<Comment> getProductComments(Long productId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return commentRepository.findByProductIdOrderByCreatedAtDesc(productId, pageable);
    }
    
    /**
     * ดู comments ของสินค้าทั้งหมด
     */
    public List<Comment> getAllProductComments(Long productId) {
        return commentRepository.findAllByProductId(productId);
    }
    
    /**
     * ดู replies ของ comment
     */
    public List<Comment> getCommentReplies(Long commentId) {
        return commentRepository.findRepliesByParentId(commentId);
    }
    
    /**
     * ดู comments ของ user
     */
    public Page<Comment> getUserComments(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return commentRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }
    
    /**
     * นับจำนวน comments ของสินค้า
     */
    public long getProductCommentCount(Long productId) {
        return commentRepository.countByProductId(productId);
    }
    
    /**
     * นับจำนวน comments ทั้งหมดของสินค้า (รวม replies)
     */
    public long getProductAllCommentCount(Long productId) {
        return commentRepository.countAllByProductId(productId);
    }
    
    /**
     * คำนวณคะแนนเฉลี่ยของสินค้า
     */
    public double getProductAverageRating(Long productId) {
        Optional<Double> averageRating = commentRepository.findAverageRatingByProductId(productId);
        return averageRating.orElse(0.0);
    }
    
    /**
     * ดู comments ที่มีคะแนนของสินค้า
     */
    public List<Comment> getProductCommentsWithRating(Long productId) {
        return commentRepository.findByProductIdWithRating(productId);
    }
    
    /**
     * ดู comments ล่าสุดของระบบ
     */
    public Page<Comment> getLatestComments(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return commentRepository.findLatestComments(pageable);
    }
    
    /**
     * ตรวจสอบว่า user เคย comment สินค้านี้แล้วหรือไม่
     */
    public boolean hasUserCommented(Long userId, Long productId) {
        return commentRepository.existsByUserAndProduct(userId, productId);
    }
    
    /**
     * ดู comments ตาม rating
     */
    public List<Comment> getCommentsByRating(Long productId, Integer rating) {
        return commentRepository.findByProductIdAndRating(productId, rating);
    }
    
    /**
     * ดู comment เดียว
     */
    public Comment getComment(Long commentId) {
        return commentRepository.findById(commentId)
            .orElseThrow(() -> new RuntimeException("Comment not found: " + commentId));
    }
    
    /**
     * สถิติคะแนนของสินค้า
     */
    public CommentStats getProductCommentStats(Long productId) {
        List<Comment> commentsWithRating = getProductCommentsWithRating(productId);
        long totalComments = getProductCommentCount(productId);
        double averageRating = getProductAverageRating(productId);
        
        // นับคะแนนแต่ละระดับ
        long fiveStar = commentsWithRating.stream().mapToLong(c -> c.getRating() == 5 ? 1 : 0).sum();
        long fourStar = commentsWithRating.stream().mapToLong(c -> c.getRating() == 4 ? 1 : 0).sum();
        long threeStar = commentsWithRating.stream().mapToLong(c -> c.getRating() == 3 ? 1 : 0).sum();
        long twoStar = commentsWithRating.stream().mapToLong(c -> c.getRating() == 2 ? 1 : 0).sum();
        long oneStar = commentsWithRating.stream().mapToLong(c -> c.getRating() == 1 ? 1 : 0).sum();
        
        return new CommentStats(totalComments, commentsWithRating.size(), averageRating,
                               fiveStar, fourStar, threeStar, twoStar, oneStar);
    }
    
    /**
     * ดึงความคิดเห็นทั้งหมดของสินค้า
     */
    public List<Comment> getCommentsByProductId(Long productId) {
        return commentRepository.findAllByProductId(productId).stream()
            .filter(comment -> comment.getParentComment() == null)
            .toList();
    }
    
    /**
     * DTO สำหรับสถิติ comments
     */
    public static class CommentStats {
        private long totalComments;
        private long ratedComments;
        private double averageRating;
        private long fiveStarCount;
        private long fourStarCount;
        private long threeStarCount;
        private long twoStarCount;
        private long oneStarCount;
        
        public CommentStats(long totalComments, long ratedComments, double averageRating,
                           long fiveStarCount, long fourStarCount, long threeStarCount,
                           long twoStarCount, long oneStarCount) {
            this.totalComments = totalComments;
            this.ratedComments = ratedComments;
            this.averageRating = averageRating;
            this.fiveStarCount = fiveStarCount;
            this.fourStarCount = fourStarCount;
            this.threeStarCount = threeStarCount;
            this.twoStarCount = twoStarCount;
            this.oneStarCount = oneStarCount;
        }
        
        // Getters
        public long getTotalComments() { return totalComments; }
        public long getRatedComments() { return ratedComments; }
        public double getAverageRating() { return averageRating; }
        public long getFiveStarCount() { return fiveStarCount; }
        public long getFourStarCount() { return fourStarCount; }
        public long getThreeStarCount() { return threeStarCount; }
        public long getTwoStarCount() { return twoStarCount; }
        public long getOneStarCount() { return oneStarCount; }
        
        public double getFiveStarPercentage() {
            return ratedComments > 0 ? (fiveStarCount * 100.0) / ratedComments : 0.0;
        }
        
        public double getFourStarPercentage() {
            return ratedComments > 0 ? (fourStarCount * 100.0) / ratedComments : 0.0;
        }
        
        public double getThreeStarPercentage() {
            return ratedComments > 0 ? (threeStarCount * 100.0) / ratedComments : 0.0;
        }
        
        public double getTwoStarPercentage() {
            return ratedComments > 0 ? (twoStarCount * 100.0) / ratedComments : 0.0;
        }
        
        public double getOneStarPercentage() {
            return ratedComments > 0 ? (oneStarCount * 100.0) / ratedComments : 0.0;
        }
    }
}
