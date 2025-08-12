package com.example.E_commerceStore.WebApp.repository;

import com.example.E_commerceStore.WebApp.model.Cart;
import com.example.E_commerceStore.WebApp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {
    
    /**
     * ค้นหาตะกร้าตาม User
     */
    Optional<Cart> findByUser(User user);
    
    /**
     * ค้นหาตะกร้าตาม User ID
     */
    @Query("SELECT c FROM Cart c WHERE c.user.id = :userId")
    Optional<Cart> findByUserId(@Param("userId") Long userId);
    
    /**
     * ค้นหาตะกร้าตาม User email
     */
    @Query("SELECT c FROM Cart c WHERE c.user.email = :email")
    Optional<Cart> findByUserEmail(@Param("email") String email);
    
    /**
     * ค้นหาตะกร้าที่มีสินค้าอยู่
     */
    @Query("SELECT c FROM Cart c WHERE SIZE(c.cartItems) > 0")
    Optional<Cart> findCartsWithItems();
    
    /**
     * ลบตะกร้าที่ว่างเปล่า
     */
    @Query("DELETE FROM Cart c WHERE SIZE(c.cartItems) = 0")
    void deleteEmptyCarts();
    
    /**
     * ตรวจสอบว่า User มีตะกร้าหรือไม่
     */
    boolean existsByUser(User user);
    
    /**
     * ตรวจสอบว่า User มีตะกร้าหรือไม่ตาม User ID
     */
    @Query("SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END FROM Cart c WHERE c.user.id = :userId")
    boolean existsByUserId(@Param("userId") Long userId);
}
