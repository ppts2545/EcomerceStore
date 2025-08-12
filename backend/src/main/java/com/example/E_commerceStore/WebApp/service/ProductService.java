package com.example.E_commerceStore.WebApp.service;

import com.example.E_commerceStore.WebApp.model.Product;
import com.example.E_commerceStore.WebApp.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class ProductService {
    
    @Autowired
    private ProductRepository productRepository;
    
    // ✅ ใช้ findAll() แทน findAllProducts()
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }
    
    // ✅ ดึงสินค้าตาม ID
    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }
    
    // ✅ บันทึกสินค้าใหม่
    public Product saveProduct(Product product) {
        // Validation
        if (product.getName() == null || product.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Product name is required");
        }
        if (product.getPrice() == null || product.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Price must be greater than 0");
        }
        if (product.getStock() == null || product.getStock() < 0) {
            throw new IllegalArgumentException("Stock must be non-negative");
        }
        
        return productRepository.save(product);
    }
    
    // ✅ อัปเดตสินค้า - แก้ไข syntax error
    public Product updateProduct(Long id, Product productDetails) {
        Optional<Product> existingProduct = productRepository.findById(id);
        if (existingProduct.isPresent()) {
            Product product = existingProduct.get();
            
            // Update only non-null fields
            if (productDetails.getName() != null) {
                product.setName(productDetails.getName());
            }
            if (productDetails.getDescription() != null) {
                product.setDescription(productDetails.getDescription());
            }
            if (productDetails.getPrice() != null) {
                product.setPrice(productDetails.getPrice());  // ← แก้ไขตรงนี้!
            }
            if (productDetails.getImageUrl() != null) {
                product.setImageUrl(productDetails.getImageUrl());
            }
            if (productDetails.getStock() != null) {
                product.setStock(productDetails.getStock());
            }
            
            return productRepository.save(product);
        }
        return null;
    }
    
    // ✅ ลบสินค้า
    public boolean deleteProduct(Long id) {
        if (productRepository.existsById(id)) {
            productRepository.deleteById(id);
            return true;
        }
        return false;
    }
    
    // ✅ ค้นหาสินค้า
    public List<Product> searchProducts(String keyword) {
        return productRepository.searchByKeyword(keyword);
    }
    
    // ✅ ค้นหาสินค้าตามช่วงราคา
    public List<Product> getProductsByPriceRange(BigDecimal minPrice, BigDecimal maxPrice) {
        return productRepository.findByPriceRange(minPrice, maxPrice);
    }
    
    // ✅ ดึงสินค้าแนะนำ
    public List<Product> getFeaturedProducts() {
        return productRepository.findFeaturedProducts();
    }
    
    // ✅ ดึงสินค้าล่าสุด
    public List<Product> getLatestProducts() {
        return productRepository.findLatestProducts();
    }
    
    // ✅ นับจำนวนสินค้า
    public long getTotalProductCount() {
        return productRepository.count();
    }
    
    // ✅ ตรวจสอบสินค้าคงคลัง
    public boolean isProductInStock(Long productId) {
        Optional<Product> product = productRepository.findById(productId);
        return product.isPresent() && product.get().getStock() > 0;
    }
    
    // ✅ ตรวจสอบจำนวนสินค้าคงคลัง
    public Integer getProductStock(Long productId) {
        Optional<Product> product = productRepository.findById(productId);
        return product.map(Product::getStock).orElse(0);
    }
    
    // ✅ อัปเดตจำนวนสินค้าคงคลัง
    public Product updateStock(Long productId, Integer newStock) {
        Optional<Product> existingProduct = productRepository.findById(productId);
        if (existingProduct.isPresent()) {
            Product product = existingProduct.get();
            product.setStock(newStock);
            return productRepository.save(product);
        }
        throw new IllegalArgumentException("Product not found with id: " + productId);
    }
    
    // ✅ ลดจำนวนสินค้าเมื่อมีการขาย
    public boolean reduceStock(Long productId, Integer quantity) {
        Optional<Product> existingProduct = productRepository.findById(productId);
        if (existingProduct.isPresent()) {
            Product product = existingProduct.get();
            
            // ตรวจสอบว่ามีสินค้าเพียงพอหรือไม่
            if (product.getStock() >= quantity) {
                product.setStock(product.getStock() - quantity);
                productRepository.save(product);
                return true;
            }
        }
        return false; // ไม่สามารถลดได้ (สินค้าไม่พอหรือไม่พบสินค้า)
    }
    
    // ✅ เพิ่มจำนวนสินค้า (เมื่อมีการรับสินค้าเข้า)
    public Product addStock(Long productId, Integer quantity) {
        Optional<Product> existingProduct = productRepository.findById(productId);
        if (existingProduct.isPresent()) {
            Product product = existingProduct.get();
            product.setStock(product.getStock() + quantity);
            return productRepository.save(product);
        }
        throw new IllegalArgumentException("Product not found with id: " + productId);
    }
    
    // ✅ ดึงสินค้าที่ใกล้หมด (stock น้อยกว่า threshold)
    public List<Product> getLowStockProducts(Integer threshold) {
        return productRepository.findByStockLessThan(threshold);
    }
    
    // ✅ ดึงสินค้าที่หมดแล้ว
    public List<Product> getOutOfStockProducts() {
        return productRepository.findByStock(0);
    }
}