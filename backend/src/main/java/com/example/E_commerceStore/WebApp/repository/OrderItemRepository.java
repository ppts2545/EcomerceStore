package com.example.E_commerceStore.WebApp.repository;

import com.example.E_commerceStore.WebApp.model.OrderItem;
import com.example.E_commerceStore.WebApp.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByProduct(Product product);
    List<OrderItem> findByProductId(Long productId);

    @Modifying
    @Transactional
    @Query("DELETE FROM OrderItem oi WHERE oi.product.id = :productId")
    void deleteByProductId(@Param("productId") Long productId);
}
