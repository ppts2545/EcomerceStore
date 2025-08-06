package com.example.E_commerceStore.WebApp.repository;

import com.example.E_commerceStore.WebApp.model.CartItem;
import com.example.E_commerceStore.WebApp.model.User;
import com.example.E_commerceStore.WebApp.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    
    // Find all cart items for a user
    List<CartItem> findByUser(User user);
    
    // Find all cart items for a user ID
    List<CartItem> findByUserId(Long userId);
    
    // Find specific cart item by user and product
    Optional<CartItem> findByUserAndProduct(User user, Product product);
    
    // Count items in cart for a user
    @Query("SELECT COUNT(c) FROM CartItem c WHERE c.user.id = :userId")
    Long countByUserId(@Param("userId") Long userId);
    
    // Get total quantity in cart for a user
    @Query("SELECT COALESCE(SUM(c.quantity), 0) FROM CartItem c WHERE c.user.id = :userId")
    Integer getTotalQuantityByUserId(@Param("userId") Long userId);
    
    // Delete all cart items for a user
    void deleteByUser(User user);
    
    // Delete cart item by user and product
    void deleteByUserAndProduct(User user, Product product);
}
