package com.example.E_commerceStore.WebApp.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "comments")
public class Comment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)  
    @JoinColumn(name = "product_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Product product;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;
    
    @Column(name = "rating", nullable = true)
    private Integer rating; // 1-5 stars (optional)
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "is_edited", nullable = false)
    private Boolean isEdited = false;
    
    // Parent comment for replies (self-referencing)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_comment_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Comment parentComment;
    
    // Constructors
    public Comment() {}
    
    public Comment(User user, Product product, String content) {
        this.user = user;
        this.product = product;
        this.content = content;
        this.createdAt = LocalDateTime.now();
    }
    
    public Comment(User user, Product product, String content, Integer rating) {
        this(user, product, content);
        this.rating = rating;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    public Product getProduct() {
        return product;
    }
    
    public void setProduct(Product product) {
        this.product = product;
    }
    
    public String getContent() {
        return content;
    }
    
    public void setContent(String content) {
        this.content = content;
        this.updatedAt = LocalDateTime.now();
        this.isEdited = true;
    }
    
    public Integer getRating() {
        return rating;
    }
    
    public void setRating(Integer rating) {
        this.rating = rating;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public Boolean getIsEdited() {
        return isEdited;
    }
    
    public void setIsEdited(Boolean isEdited) {
        this.isEdited = isEdited;
    }
    
    public Comment getParentComment() {
        return parentComment;
    }
    
    public void setParentComment(Comment parentComment) {
        this.parentComment = parentComment;
    }
    
    // Helper methods
    public boolean isReply() {
        return parentComment != null;
    }
    
    public boolean hasRating() {
        return rating != null && rating >= 1 && rating <= 5;
    }
    
    public String getDisplayName() {
        return user != null ? user.getFirstName() + " " + user.getLastName() : "Anonymous";
    }
    
    public String getTimeAgo() {
        if (createdAt == null) return "";
        
        LocalDateTime now = LocalDateTime.now();
        long minutes = java.time.Duration.between(createdAt, now).toMinutes();
        
        if (minutes < 1) return "เมื่อสักครู่";
        if (minutes < 60) return minutes + " นาทีที่แล้ว";
        
        long hours = minutes / 60;
        if (hours < 24) return hours + " ชั่วโมงที่แล้ว";
        
        long days = hours / 24;
        if (days < 30) return days + " วันที่แล้ว";
        
        long months = days / 30;
        if (months < 12) return months + " เดือนที่แล้ว";
        
        long years = months / 12;
        return years + " ปีที่แล้ว";
    }
}
