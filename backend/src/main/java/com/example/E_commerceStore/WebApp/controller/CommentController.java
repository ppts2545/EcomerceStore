package com.example.E_commerceStore.WebApp.controller;

import com.example.E_commerceStore.WebApp.model.Comment;
import com.example.E_commerceStore.WebApp.model.User;
import com.example.E_commerceStore.WebApp.service.CommentService;
import com.example.E_commerceStore.WebApp.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/comments")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175"}, allowCredentials = "true")
public class CommentController {
    
    @Autowired
    private CommentService commentService;
    
    @Autowired
    private OrderService orderService;
    
    /**
     * เพิ่ม comment ใหม่ให้สินค้า
     */
    @PostMapping("/product/{productId}")
    public ResponseEntity<?> addComment(
            @AuthenticationPrincipal OAuth2User principal,
            @PathVariable Long productId,
            @RequestBody CommentRequest request,
            HttpSession session) {
        
        if (principal == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));
        }
        
        try {
            Long userId = (Long) session.getAttribute("userId");
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Session not found"));
            }
            
            // ตรวจสอบว่าผู้ใช้ซื้อสินค้านี้แล้วหรือยัง
            boolean hasPurchased = orderService.hasUserPurchasedProduct(userId, productId);
            if (!hasPurchased) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You can only review products you have purchased"));
            }
            
            User user = getCurrentUser(principal);
            Comment comment = commentService.addComment(user, productId, request.getContent(), request.getRating());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Review submitted successfully");
            response.put("comment", comment);
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * เพิ่ม reply ให้กับ comment
     */
    @PostMapping("/{commentId}/reply")
    public ResponseEntity<?> addReply(
            @AuthenticationPrincipal OAuth2User principal,
            @PathVariable Long commentId,
            @RequestBody CommentRequest request) {
        
        if (principal == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));
        }
        
        try {
            User user = getCurrentUser(principal);
            Comment reply = commentService.addReply(user, commentId, request.getContent());
            return ResponseEntity.ok(reply);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * แก้ไข comment
     */
    @PutMapping("/{commentId}")
    public ResponseEntity<?> updateComment(
            @AuthenticationPrincipal OAuth2User principal,
            @PathVariable Long commentId,
            @RequestBody CommentRequest request) {
        
        if (principal == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));
        }
        
        try {
            User user = getCurrentUser(principal);
            Comment comment = commentService.updateComment(user, commentId, request.getContent());
            return ResponseEntity.ok(comment);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * ลบ comment
     */
    @DeleteMapping("/{commentId}")
    public ResponseEntity<?> deleteComment(
            @AuthenticationPrincipal OAuth2User principal,
            @PathVariable Long commentId) {
        
        if (principal == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));
        }
        
        try {
            User user = getCurrentUser(principal);
            commentService.deleteComment(user, commentId);
            return ResponseEntity.ok(Map.of("message", "Comment deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * ดู comments ของสินค้า (แบบ pagination)
     */
    @GetMapping("/product/{productId}")
    @PreAuthorize("permitAll()")
    public ResponseEntity<?> getProductComments(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        try {
            Page<Comment> comments = commentService.getProductComments(productId, page, size);
            return ResponseEntity.ok(comments);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * ดู comment เดียว พร้อม replies
     */
    @GetMapping("/{commentId}")
    public ResponseEntity<?> getComment(@PathVariable Long commentId) {
        try {
            Comment comment = commentService.getComment(commentId);
            List<Comment> replies = commentService.getCommentReplies(commentId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("comment", comment);
            response.put("replies", replies);
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * ดู replies ของ comment
     */
    @GetMapping("/{commentId}/replies")
    public ResponseEntity<?> getCommentReplies(@PathVariable Long commentId) {
        try {
            List<Comment> replies = commentService.getCommentReplies(commentId);
            return ResponseEntity.ok(replies);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * ดู comments ของ user
     */
    @GetMapping("/user/my-comments")
    public ResponseEntity<?> getMyComments(
            @AuthenticationPrincipal OAuth2User principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        if (principal == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));
        }
        
        try {
            User user = getCurrentUser(principal);
            Page<Comment> comments = commentService.getUserComments(user.getId(), page, size);
            return ResponseEntity.ok(comments);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * สถิติ comments ของสินค้า
     */
    @GetMapping("/product/{productId}/stats")
    @PreAuthorize("permitAll()")
    public ResponseEntity<?> getProductCommentStats(@PathVariable Long productId) {
        try {
            CommentService.CommentStats stats = commentService.getProductCommentStats(productId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * ดู comments ตาม rating
     */
    @GetMapping("/product/{productId}/rating/{rating}")
    public ResponseEntity<?> getCommentsByRating(
            @PathVariable Long productId,
            @PathVariable Integer rating) {
        
        try {
            if (rating < 1 || rating > 5) {
                return ResponseEntity.badRequest().body(Map.of("error", "Rating must be between 1 and 5"));
            }
            
            List<Comment> comments = commentService.getCommentsByRating(productId, rating);
            return ResponseEntity.ok(comments);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * ดู comments ล่าสุดของระบบ
     */
    @GetMapping("/latest")
    public ResponseEntity<?> getLatestComments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        try {
            Page<Comment> comments = commentService.getLatestComments(page, size);
            return ResponseEntity.ok(comments);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * ตรวจสอบว่า user เคย comment สินค้านี้แล้วหรือไม่
     */
    @GetMapping("/product/{productId}/user-commented")
    public ResponseEntity<?> hasUserCommented(
            @AuthenticationPrincipal OAuth2User principal,
            @PathVariable Long productId) {
        
        if (principal == null) {
            return ResponseEntity.ok(Map.of("hasCommented", false));
        }
        
        try {
            User user = getCurrentUser(principal);
            boolean hasCommented = commentService.hasUserCommented(user.getId(), productId);
            return ResponseEntity.ok(Map.of("hasCommented", hasCommented));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Get rating summary for a product
     */
    @GetMapping("/product/{productId}/rating")
    @PreAuthorize("permitAll()")
    public ResponseEntity<?> getProductRating(@PathVariable Long productId) {
        try {
            List<Comment> comments = commentService.getCommentsByProductId(productId);
            
            if (comments.isEmpty()) {
                Map<String, Object> emptyRating = new HashMap<>();
                emptyRating.put("averageRating", 0.0);
                emptyRating.put("totalComments", 0);
                emptyRating.put("ratingDistribution", Map.of(
                    "1", 0, "2", 0, "3", 0, "4", 0, "5", 0
                ));
                return ResponseEntity.ok(emptyRating);
            }
            
            // Calculate average rating
            double averageRating = comments.stream()
                .mapToInt(Comment::getRating)
                .average()
                .orElse(0.0);
            
            // Calculate rating distribution
            Map<String, Long> distribution = comments.stream()
                .collect(Collectors.groupingBy(
                    comment -> String.valueOf(Math.max(1, Math.min(5, comment.getRating()))),
                    Collectors.counting()
                ));
            
            // Ensure all rating levels are present
            Map<String, Long> ratingDistribution = new HashMap<>();
            for (int i = 1; i <= 5; i++) {
                ratingDistribution.put(String.valueOf(i), distribution.getOrDefault(String.valueOf(i), 0L));
            }
            
            Map<String, Object> ratingData = new HashMap<>();
            ratingData.put("averageRating", Math.round(averageRating * 10.0) / 10.0);
            ratingData.put("totalComments", comments.size());
            ratingData.put("ratingDistribution", ratingDistribution);
            
            return ResponseEntity.ok(ratingData);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to get rating data: " + e.getMessage()));
        }
    }
    
    /**
     * Helper method เพื่อดึงข้อมูล user จาก OAuth2User
     */
    private User getCurrentUser(OAuth2User principal) {
        String email = principal.getAttribute("email");
        String name = principal.getAttribute("name");
        String picture = principal.getAttribute("picture");
        
        // สร้าง User object จากข้อมูล OAuth2
        User user = new User();
        user.setEmail(email);
        user.setName(name);
        user.setPicture(picture);
        
        // ในการใช้งานจริงควร query จากฐานข้อมูลเพื่อใช้ ID ที่แท้จริง
        // ตอนนี้จะใช้ email เป็น unique identifier
        user.setId(Long.valueOf(email.hashCode() & Integer.MAX_VALUE));
        
        return user;
    }
    
    /**
     * DTO สำหรับรับข้อมูล comment request
     */
    public static class CommentRequest {
        private String content;
        private Integer rating;
        
        public CommentRequest() {}
        
        public CommentRequest(String content, Integer rating) {
            this.content = content;
            this.rating = rating;
        }
        
        // Getters and setters
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        
        public Integer getRating() { return rating; }
        public void setRating(Integer rating) { this.rating = rating; }
    }
}
