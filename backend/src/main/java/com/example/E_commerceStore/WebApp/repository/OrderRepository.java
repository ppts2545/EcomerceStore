package com.example.E_commerceStore.WebApp.repository;

import com.example.E_commerceStore.WebApp.model.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    // Find orders by user ID
    Page<Order> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    
    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    // Find order by order number
    Optional<Order> findByOrderNumber(String orderNumber);
    
    // Find orders by status
    @Query("SELECT o FROM Order o WHERE o.status = :status ORDER BY o.createdAt DESC")
    List<Order> findByStatus(@Param("status") Order.OrderStatus status);
    
    // Count orders by user
    long countByUserId(Long userId);
    
    // Check if user has purchased a specific product
    @Query("SELECT COUNT(oi) > 0 FROM OrderItem oi " +
           "WHERE oi.order.userId = :userId " +
           "AND oi.product.id = :productId " +
           "AND oi.order.status = 'DELIVERED'")
    boolean hasUserPurchasedProduct(@Param("userId") Long userId, @Param("productId") Long productId);
    
    // Get user's orders for a specific product
    @Query("SELECT DISTINCT o FROM Order o " +
           "JOIN o.orderItems oi " +
           "WHERE o.userId = :userId " +
           "AND oi.product.id = :productId " +
           "AND o.status = 'DELIVERED' " +
           "ORDER BY o.createdAt DESC")
    List<Order> findUserOrdersForProduct(@Param("userId") Long userId, @Param("productId") Long productId);
}
