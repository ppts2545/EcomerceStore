package com.example.E_commerceStore.WebApp.repository;

import com.example.E_commerceStore.WebApp.model.MediaItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MediaItemRepository extends JpaRepository<MediaItem, Long> {
    
    @Query("SELECT m FROM MediaItem m WHERE m.product.id = :productId ORDER BY m.displayOrder ASC")
    List<MediaItem> findByProductIdOrderByDisplayOrderAsc(@Param("productId") Long productId);
    
    @Query("DELETE FROM MediaItem m WHERE m.product.id = :productId")
    void deleteByProductId(@Param("productId") Long productId);
}
