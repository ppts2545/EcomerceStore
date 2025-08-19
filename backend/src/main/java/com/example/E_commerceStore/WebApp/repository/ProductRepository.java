package com.example.E_commerceStore.WebApp.repository;

import com.example.E_commerceStore.WebApp.model.Product;
import com.example.E_commerceStore.WebApp.model.Store;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByTagsNameIn(List<String> tagNames);
    List<Product> findByTagsName(String tagName);
    List<Product> findTop10ByTagsNameInOrderByCreatedAtDesc(List<String> tagNames);
    List<Product> findTop5ByTagsNameAndIdNotOrderByCreatedAtDesc(String tagName, Long excludeId);
    List<Product> findByNameContainingIgnoreCase(String name);

    @Query("SELECT p FROM Product p WHERE " +
           "LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Product> searchByKeyword(@Param("keyword") String keyword);

    @Query("SELECT p FROM Product p WHERE p.price BETWEEN :minPrice AND :maxPrice")
    List<Product> findByPriceRange(@Param("minPrice") java.math.BigDecimal minPrice,
                                   @Param("maxPrice") java.math.BigDecimal maxPrice);

    @Query("SELECT p FROM Product p ORDER BY p.id DESC")
    List<Product> findLatestProducts();

    @Query(value = "SELECT * FROM products ORDER BY id LIMIT 4", nativeQuery = true)
    List<Product> findFeaturedProducts();

    List<Product> findByStockLessThan(Integer threshold);
    List<Product> findByStock(Integer stock);
    List<Product> findTop10ByOrderByCreatedAtDesc();

    List<Product> findByStore(Store store);

    // ✅ ใช้แนว ManyToOne: ต้องเป็น findByStore_Id (มีขีดล่าง)
    List<Product> findByStore_Id(Long storeId);
}