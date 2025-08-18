package com.example.E_commerceStore.WebApp.controller;

import com.example.E_commerceStore.WebApp.model.Product;
import com.example.E_commerceStore.WebApp.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.util.StringUtils;
import com.example.E_commerceStore.WebApp.model.MediaItem;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    @GetMapping
    public List<Product> getAllProducts() {
        return productService.getAllProducts();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable(value = "id") Long productId) {
        Optional<Product> product = productService.getProductById(productId);
        return product.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Product> createProduct(@RequestBody Product product) {
        Product created = productService.saveProduct(product);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable(value = "id") Long productId,
                                                 @RequestBody Product productDetails) {
        Product updated = productService.updateProduct(productId, productDetails);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable(value = "id") Long productId) {
        boolean deleted = productService.deleteProduct(productId);
        if (deleted) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // อัปโหลดสินค้าใหม่พร้อมรูปภาพหลักและ media หลายไฟล์ (multipart/form-data)
    @PostMapping("/upload")
    public ResponseEntity<?> uploadProduct(
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam("price") BigDecimal price,
            @RequestParam("stock") Integer stock,
            @RequestParam(value = "tags", required = false) List<String> tags,
            @RequestParam("imageFile") MultipartFile imageFile,
            @RequestParam(value = "mediaFiles", required = false) List<MultipartFile> mediaFiles,
            @RequestParam(value = "mediaTypes", required = false) List<String> mediaTypes,
            @RequestParam(value = "mediaAlts", required = false) List<String> mediaAlts,
            @RequestParam(value = "mediaDisplayOrders", required = false) List<String> mediaDisplayOrders
    ) {
        try {
            Product created = productService.saveProductWithImagesAndMedia(
                name, description, price, stock, tags, imageFile,
                mediaFiles, mediaTypes, mediaAlts, mediaDisplayOrders
            );
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}

