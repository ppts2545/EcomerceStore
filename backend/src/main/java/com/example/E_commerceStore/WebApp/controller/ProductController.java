package com.example.E_commerceStore.WebApp.controller;

import com.example.E_commerceStore.WebApp.dto.ProductDto;
import com.example.E_commerceStore.WebApp.model.Product;
import com.example.E_commerceStore.WebApp.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.web.multipart.MultipartFile;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;
    public ProductController(ProductService productService) { this.productService = productService; }

    // -------- READ (DTO) --------
    @GetMapping
    public List<ProductDto> getAllProducts() {
        return productService.getAllProducts(); // DTO
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDto> getProductById(@PathVariable("id") Long productId) {
        Optional<ProductDto> product = productService.getProductById(productId); // DTO
        return product.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/store/{storeId}")
    public List<ProductDto> getProductsByStore(@PathVariable Long storeId) {
        return productService.getProductsByStoreId(storeId); // DTO
    }

    // -------- WRITE (Entity) --------
    @PostMapping
    public ResponseEntity<Product> createProduct(@RequestBody Product product) {
        Product created = productService.saveProduct(product);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable("id") Long productId,
                                                 @RequestBody Product productDetails) {
        Product updated = productService.updateProduct(productId, productDetails);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable("id") Long productId) {
        productService.deleteProduct(productId);
        return ResponseEntity.ok().build();
    }

    // อัปโหลดสินค้าพร้อมรูป (multipart/form-data)
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
            @RequestParam(value = "mediaDisplayOrders", required = false) List<String> mediaDisplayOrders,
            @RequestParam(value = "storeId", required = false) Long storeId
    ) {
        try {
            var created = productService.saveProductWithImagesAndMedia(
                    name, description, price, stock, tags, imageFile,
                    mediaFiles, mediaTypes, mediaAlts, mediaDisplayOrders,
                    storeId
            );
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}