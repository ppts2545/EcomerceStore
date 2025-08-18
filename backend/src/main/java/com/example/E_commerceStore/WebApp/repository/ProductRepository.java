
package com.example.E_commerceStore.WebApp.repository;

import com.example.E_commerceStore.WebApp.model.Product;
import com.example.E_commerceStore.WebApp.model.Store;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // ดึงสินค้าตาม tag name หลายค่า (many-to-many)
    List<Product> findByTagsNameIn(List<String> tagNames);

    // ดึงสินค้าตาม tag name (single tag)
    List<Product> findByTagsName(String tagName);

    // ดึงสินค้าตาม tag name หลายค่า (10 รายการล่าสุด)
    List<Product> findTop10ByTagsNameInOrderByCreatedAtDesc(List<String> tagNames);

    // ดึงสินค้าใน tag เดียวกัน ยกเว้นสินค้าที่ระบุ (5 รายการ)
    List<Product> findTop5ByTagsNameAndIdNotOrderByCreatedAtDesc(String tagName, Long excludeId);
    
    // ค้นหาสินค้าตามชื่อ (case insensitive)
    List<Product> findByNameContainingIgnoreCase(String name);
    
    // ค้นหาสินค้าตามชื่อหรือคำอธิบาย
    @Query("SELECT p FROM Product p WHERE " +
           "LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Product> searchByKeyword(@Param("keyword") String keyword);
    
    // ค้นหาสินค้าตามช่วงราคา
    @Query("SELECT p FROM Product p WHERE p.price BETWEEN :minPrice AND :maxPrice")
    List<Product> findByPriceRange(@Param("minPrice") java.math.BigDecimal minPrice, @Param("maxPrice") java.math.BigDecimal maxPrice);
    
    // ดึงสินค้าล่าสุด (เรียงตาม id desc)
    @Query("SELECT p FROM Product p ORDER BY p.id DESC")
    List<Product> findLatestProducts();
    
    // ดึงสินค้าแนะนำ (4 รายการแรก)
    @Query(value = "SELECT * FROM products ORDER BY id LIMIT 4", nativeQuery = true)
    List<Product> findFeaturedProducts();
    
    // ดึงสินค้าที่ใกล้หมด (stock น้อยกว่า threshold)
    List<Product> findByStockLessThan(Integer threshold);
    
    // ดึงสินค้าที่หมดแล้ว
    List<Product> findByStock(Integer stock);
    
    // สำหรับระบบแนะนำสินค้า - ดึงสินค้าล่าสุด 10 รายการ
    List<Product> findTop10ByOrderByCreatedAtDesc();
    
    // ค้นหาสินค้าตามร้านค้า
    List<Product> findByStore(Store store);
    List<Product> findByStoreId(Long storeId);

}
