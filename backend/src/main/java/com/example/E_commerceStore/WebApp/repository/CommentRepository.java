package com.example.E_commerceStore.WebApp.repository;

import com.example.E_commerceStore.WebApp.model.Comment;
import com.example.E_commerceStore.WebApp.model.Product;
import com.example.E_commerceStore.WebApp.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    
    // หา comments ของสินค้า (เฉพาะ parent comments ไม่รวม replies)
    @Query("SELECT c FROM Comment c WHERE c.product.id = :productId AND c.parentComment IS NULL ORDER BY c.createdAt DESC")
    Page<Comment> findByProductIdOrderByCreatedAtDesc(@Param("productId") Long productId, Pageable pageable);
    
    // หา comments ของสินค้า (ทั้งหมดรวม replies)
    @Query("SELECT c FROM Comment c WHERE c.product.id = :productId ORDER BY c.createdAt DESC")
    List<Comment> findAllByProductId(@Param("productId") Long productId);
    
    // หา replies ของ comment
    @Query("SELECT c FROM Comment c WHERE c.parentComment.id = :parentId ORDER BY c.createdAt ASC")
    List<Comment> findRepliesByParentId(@Param("parentId") Long parentId);
    
    // หา comments ของ user
    @Query("SELECT c FROM Comment c WHERE c.user.id = :userId ORDER BY c.createdAt DESC")
    Page<Comment> findByUserIdOrderByCreatedAtDesc(@Param("userId") Long userId, Pageable pageable);
    
    // นับจำนวน comments ของสินค้า (ไม่รวม replies)
    @Query("SELECT COUNT(c) FROM Comment c WHERE c.product.id = :productId AND c.parentComment IS NULL")
    Long countByProductId(@Param("productId") Long productId);
    
    // นับจำนวน comments ทั้งหมดของสินค้า (รวม replies)
    @Query("SELECT COUNT(c) FROM Comment c WHERE c.product.id = :productId")
    Long countAllByProductId(@Param("productId") Long productId);
    
    // คำนวณคะแนนเฉลี่ยของสินค้า
    @Query("SELECT AVG(c.rating) FROM Comment c WHERE c.product.id = :productId AND c.rating IS NOT NULL")
    Optional<Double> findAverageRatingByProductId(@Param("productId") Long productId);
    
    // หา comments ที่มีคะแนน
    @Query("SELECT c FROM Comment c WHERE c.product.id = :productId AND c.rating IS NOT NULL ORDER BY c.createdAt DESC")
    List<Comment> findByProductIdWithRating(@Param("productId") Long productId);
    
    // หา comments ล่าสุดของระบบ
    @Query("SELECT c FROM Comment c ORDER BY c.createdAt DESC")
    Page<Comment> findLatestComments(Pageable pageable);
    
    // ตรวจสอบว่า user เคย comment สินค้านี้แล้วหรือไม่
    @Query("SELECT COUNT(c) > 0 FROM Comment c WHERE c.user.id = :userId AND c.product.id = :productId")
    boolean existsByUserAndProduct(@Param("userId") Long userId, @Param("productId") Long productId);
    
    // หา comments ตาม rating
    @Query("SELECT c FROM Comment c WHERE c.product.id = :productId AND c.rating = :rating ORDER BY c.createdAt DESC")
    List<Comment> findByProductIdAndRating(@Param("productId") Long productId, @Param("rating") Integer rating);
    
    // ลบ comments ของ user
    void deleteByUser(User user);
    
    // ลบ comments ของสินค้า
    void deleteByProduct(Product product);
}
