package com.example.E_commerceStore.WebApp.controller;

import com.example.E_commerceStore.WebApp.model.Product;
import com.example.E_commerceStore.WebApp.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
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
            @RequestParam BigDecimal min, 
            @RequestParam BigDecimal max) {
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

    // ✅ GET /api/products/{id}/stock - ตรวจสอบจำนวนสินค้าคงคลัง
    @GetMapping("/{id}/stock")
    public ResponseEntity<Map<String, Object>> getProductStock(@PathVariable Long id) {
        Integer stock = productService.getProductStock(id);
        boolean inStock = productService.isProductInStock(id);
        
        Map<String, Object> response = new HashMap<>();
        response.put("productId", id);
        response.put("stock", stock);
        response.put("inStock", inStock);
        return ResponseEntity.ok(response);
    }

    // ✅ PUT /api/products/{id}/stock - อัปเดตจำนวนสินค้าคงคลัง
    @PutMapping("/{id}/stock")
    public ResponseEntity<Product> updateProductStock(@PathVariable Long id, @RequestBody Map<String, Integer> request) {
        try {
            Integer newStock = request.get("stock");
            Product updatedProduct = productService.updateStock(id, newStock);
            return ResponseEntity.ok(updatedProduct);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ✅ POST /api/products/{id}/stock/add - เพิ่มสินค้าเข้าสต็อก
    @PostMapping("/{id}/stock/add")
    public ResponseEntity<Product> addStock(@PathVariable Long id, @RequestBody Map<String, Integer> request) {
        try {
            Integer quantity = request.get("quantity");
            Product updatedProduct = productService.addStock(id, quantity);
            return ResponseEntity.ok(updatedProduct);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ✅ POST /api/products/{id}/stock/reduce - ลดสินค้าจากสต็อก (เมื่อมีการขาย)
    @PostMapping("/{id}/stock/reduce")
    public ResponseEntity<Map<String, Object>> reduceStock(@PathVariable Long id, @RequestBody Map<String, Integer> request) {
        Integer quantity = request.get("quantity");
        boolean success = productService.reduceStock(id, quantity);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", success);
        response.put("message", success ? "Stock reduced successfully" : "Insufficient stock or product not found");
        
        if (success) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    // ✅ GET /api/products/low-stock?threshold=5 - ดึงสินค้าที่ใกล้หมด
    @GetMapping("/low-stock")
    public ResponseEntity<List<Product>> getLowStockProducts(@RequestParam(defaultValue = "5") Integer threshold) {
        List<Product> lowStockProducts = productService.getLowStockProducts(threshold);
        return ResponseEntity.ok(lowStockProducts);
    }

    // ✅ GET /api/products/out-of-stock - ดึงสินค้าที่หมดแล้ว
    @GetMapping("/out-of-stock")
    public ResponseEntity<List<Product>> getOutOfStockProducts() {
        List<Product> outOfStockProducts = productService.getOutOfStockProducts();
        return ResponseEntity.ok(outOfStockProducts);
    }

}
