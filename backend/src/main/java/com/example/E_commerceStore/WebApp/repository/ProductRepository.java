package com.example.E_commerceStore.WebApp.repository;

import com.example.E_commerceStore.WebApp.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    // ค้นหาสินค้าตามชื่อ (case insensitive)
    List<Product> findByNameContainingIgnoreCase(String name);
    
    // ค้นหาสินค้าตามชื่อหรือคำอธิบาย
    @Query("SELECT p FROM Product p WHERE " +
           "LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Product> searchByKeyword(@Param("keyword") String keyword);
    
    // ค้นหาสินค้าตามช่วงราคา
    @Query("SELECT p FROM Product p WHERE p.price BETWEEN :minPrice AND :maxPrice")
    List<Product> findByPriceRange(@Param("minPrice") Double minPrice, @Param("maxPrice") Double maxPrice);
    
    // ดึงสินค้าล่าสุด (เรียงตาม id desc)
    @Query("SELECT p FROM Product p ORDER BY p.id DESC")
    List<Product> findLatestProducts();
    
    // ดึงสินค้าแนะนำ (4 รายการแรก)
    @Query(value = "SELECT * FROM products ORDER BY id LIMIT 4", nativeQuery = true)
    List<Product> findFeaturedProducts();

}
