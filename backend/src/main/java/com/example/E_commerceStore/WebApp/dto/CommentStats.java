package com.example.E_commerceStore.WebApp.dto;

public class CommentStats {
    private Long productId;
    private Double averageRating;
    private Long totalComments;
    private Long[] ratingDistribution; // [1-star count, 2-star count, 3-star count, 4-star count, 5-star count]
    
    public CommentStats() {
        this.ratingDistribution = new Long[5];
        for (int i = 0; i < 5; i++) {
            this.ratingDistribution[i] = 0L;
        }
    }
    
    public CommentStats(Long productId, Double averageRating, Long totalComments) {
        this();
        this.productId = productId;
        this.averageRating = averageRating != null ? averageRating : 0.0;
        this.totalComments = totalComments != null ? totalComments : 0L;
    }
    
    // Getters and Setters
    public Long getProductId() {
        return productId;
    }
    
    public void setProductId(Long productId) {
        this.productId = productId;
    }
    
    public Double getAverageRating() {
        return averageRating;
    }
    
    public void setAverageRating(Double averageRating) {
        this.averageRating = averageRating;
    }
    
    public Long getTotalComments() {
        return totalComments;
    }
    
    public void setTotalComments(Long totalComments) {
        this.totalComments = totalComments;
    }
    
    public Long[] getRatingDistribution() {
        return ratingDistribution;
    }
    
    public void setRatingDistribution(Long[] ratingDistribution) {
        this.ratingDistribution = ratingDistribution;
    }
    
    public void setRatingCount(int rating, Long count) {
        if (rating >= 1 && rating <= 5) {
            this.ratingDistribution[rating - 1] = count;
        }
    }
    
    public Long getRatingCount(int rating) {
        if (rating >= 1 && rating <= 5) {
            return this.ratingDistribution[rating - 1];
        }
        return 0L;
    }
}
