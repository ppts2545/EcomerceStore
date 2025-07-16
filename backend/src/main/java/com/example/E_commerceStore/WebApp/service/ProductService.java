package com.example.E_commerceStore.WebApp.service;

import com.example.E_commerceStore.WebApp.model.Product;
import com.example.E_commerceStore.WebApp.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class ProductService {
    
    @Autowired
    private ProductRepository productRepository;
    
    // ดึงสินค้าทั้งหมด
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }
    
    // ดึงสินค้าตาม ID
    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }
    
    // บันทึกสินค้าใหม่
    public Product saveProduct(Product product) {
        return productRepository.save(product);
    }
    
    // อัปเดตสินค้า
    public Product updateProduct(Long id, Product productDetails) {
        Optional<Product> existingProduct = productRepository.findById(id);
        if (existingProduct.isPresent()) {
            Product product = existingProduct.get();
            product.setName(productDetails.getName());
            product.setDescription(productDetails.getDescription());
            product.setPrice(productDetails.getPrice());
            product.setImageUrl(productDetails.getImageUrl());
            return productRepository.save(product);
        }
        return null;
    }

    // ลบสินค้า
    public boolean deleteProduct(Long id) {
        if (productRepository.existsById(id)) {
            productRepository.deleteById(id);
            return true;
        }
        return false;
    }

    // ค้นหาสินค้า
    public List<Product> searchProducts(String keyword) {
        return productRepository.searchByKeyword(keyword);
    }

    // ค้นหาสินค้าตามช่วงราคา
    public List<Product> getProductsByPriceRange(Double minPrice, Double maxPrice) {
        return productRepository.findByPriceRange(minPrice, maxPrice);
    }

    // ดึงสินค้าแนะนำ
    public List<Product> getFeaturedProducts() {
        List<Product> featured = productRepository.findFeaturedProducts();
        // ถ้าไม่มีข้อมูลใน DB ให้ส่งค่าว่าง
        return featured;
    }
    
    // ดึงสินค้าล่าสุด
    public List<Product> getLatestProducts() {
        return productRepository.findLatestProducts();
    }

    // นับจำนวนสินค้าทั้งหมด
    public long getTotalProductCount() {
        return productRepository.count();
    }

    //ค้นหาสินค้าทั้งหมด
    public List<Product> getAllProducts2() {
        return productRepository.findAllProducts(); // ← ดึงจาก PostgreSQL      
    }
}
