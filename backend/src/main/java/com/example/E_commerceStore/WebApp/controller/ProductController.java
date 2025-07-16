package com.example.E_commerceStore.WebApp.controller;

import com.example.E_commerceStore.WebApp.model.Product;
import com.example.E_commerceStore.WebApp.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {
    
    @Autowired
    private ProductService productService;

    // ✅ GET /api/products - ดึงสินค้าทั้งหมดจาก Database
    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        List<Product> products = productService.getAllProducts();
        return ResponseEntity.ok(products);
    }

    // ✅ GET /api/products/{id} - ดึงสินค้าตาม ID จาก Database
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return productService.getProductById(id)
            .map(product -> ResponseEntity.ok(product))
            .orElse(ResponseEntity.notFound().build());
    }

    // ✅ GET /api/products/featured - ดึงสินค้าแนะนำจาก Database
    @GetMapping("/featured")
    public ResponseEntity<List<Product>> getFeaturedProducts() {
        List<Product> featuredProducts = productService.getFeaturedProducts();
        return ResponseEntity.ok(featuredProducts);
    }

    // ✅ GET /api/products/search?q=keyword - ค้นหาสินค้าจาก Database
    @GetMapping("/search")
    public ResponseEntity<List<Product>> searchProducts(@RequestParam String q) {
        List<Product> searchResults = productService.searchProducts(q);
        return ResponseEntity.ok(searchResults);
    }

    // ✅ POST /api/products - เพิ่มสินค้าใหม่ลง Database
    @PostMapping
    public ResponseEntity<Product> createProduct(@RequestBody Product product) {
        Product savedProduct = productService.saveProduct(product);
        return ResponseEntity.ok(savedProduct);
    }

    // ✅ PUT /api/products/{id} - อัปเดตสินค้าใน Database
    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody Product productDetails) {
        Product updatedProduct = productService.updateProduct(id, productDetails);
        if (updatedProduct != null) {
            return ResponseEntity.ok(updatedProduct);
        }
        return ResponseEntity.notFound().build();
    }

    // ✅ DELETE /api/products/{id} - ลบสินค้าจาก Database
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        boolean deleted = productService.deleteProduct(id);
        if (deleted) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    // ✅ GET /api/products/latest - ดึงสินค้าล่าสุดจาก Database
    @GetMapping("/latest")
    public ResponseEntity<List<Product>> getLatestProducts() {
        List<Product> latestProducts = productService.getLatestProducts();
        return ResponseEntity.ok(latestProducts);
    }

    // ✅ GET /api/products/price-range?min=100&max=500 - ค้นหาตามช่วงราคา
    @GetMapping("/price-range")
    public ResponseEntity<List<Product>> getProductsByPriceRange(
            @RequestParam Double min, 
            @RequestParam Double max) {
        List<Product> products = productService.getProductsByPriceRange(min, max);
        return ResponseEntity.ok(products);
    }

    // ✅ GET /api/products/count - นับจำนวนสินค้าทั้งหมด
    @GetMapping("/count")
    public ResponseEntity<Map<String, Object>> getProductCount() {
        long count = productService.getTotalProductCount();
        Map<String, Object> response = new HashMap<>();
        response.put("totalProducts", count);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/all")
    public ResponseEntity<List<Product>> getAllProducts2() {
        List<Product> products = productService.getAllProducts2();
        return ResponseEntity.ok(products);
    }

}
