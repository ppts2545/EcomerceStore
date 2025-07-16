package com.example.E_commerceStore.WebApp.config;

import com.example.E_commerceStore.WebApp.model.Product;
import com.example.E_commerceStore.WebApp.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;

@Component
public class DataInitializer implements CommandLineRunner {
    
    @Autowired
    private ProductRepository productRepository;
    
    @Override
    public void run(String... args) throws Exception {
        // ✅ เช็คว่ามีข้อมูลแล้วหรือไม่
        if (productRepository.count() == 0) {
            initializeProducts();
            System.out.println("✅ Sample products have been added to database!");
        } else {
            System.out.println("✅ Database already contains products. Skipping initialization.");
        }
    }
    
    private void initializeProducts() {
        // ✅ สร้างข้อมูลสินค้าตัวอย่าง - ใช้ default constructor แล้ว set fields
        
        // Product 1: iPhone 15 Pro Max
        Product product1 = new Product();
        product1.setName("iPhone 15 Pro Max");
        product1.setDescription("Latest iPhone with A17 Pro chip, 256GB storage, ProRAW photography");
        product1.setPrice(BigDecimal.valueOf(1199.99));
        product1.setImageUrl("https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop");
        productRepository.save(product1);
        
        // Product 2: MacBook Air M2
        Product product2 = new Product();
        product2.setName("MacBook Air M2");
        product2.setDescription("13-inch laptop with M2 chip, 8GB RAM, 256GB SSD, all-day battery");
        product2.setPrice(BigDecimal.valueOf(1099.99));
        product2.setImageUrl("https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=300&fit=crop");
        productRepository.save(product2);
        
        // Product 3: AirPods Pro 2
        Product product3 = new Product();
        product3.setName("AirPods Pro 2");
        product3.setDescription("Active Noise Cancellation, Spatial Audio, up to 30 hours of listening");
        product3.setPrice(BigDecimal.valueOf(249.99));
        product3.setImageUrl("https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400&h=300&fit=crop");
        productRepository.save(product3);
        
        // Product 4: Apple Watch Series 9
        Product product4 = new Product();
        product4.setName("Apple Watch Series 9");
        product4.setDescription("GPS + Cellular, 45mm, Health monitoring, Always-On Retina display");
        product4.setPrice(BigDecimal.valueOf(429.99));
        product4.setImageUrl("https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400&h=300&fit=crop");
        productRepository.save(product4);
        
        // Product 5: iPad Air
        Product product5 = new Product();
        product5.setName("iPad Air");
        product5.setDescription("10.9-inch Liquid Retina display, A14 Bionic chip, compatible with Apple Pencil");
        product5.setPrice(BigDecimal.valueOf(599.99));
        product5.setImageUrl("https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=300&fit=crop");
        productRepository.save(product5);
        
        // Product 6: Sony Camera α7 IV
        Product product6 = new Product();
        product6.setName("Sony Camera α7 IV");
        product6.setDescription("33MP Full-Frame Mirrorless Camera with 4K video recording");
        product6.setPrice(BigDecimal.valueOf(2499.99));
        product6.setImageUrl("https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400&h=300&fit=crop");
        productRepository.save(product6);
        
        // Product 7: Samsung Galaxy S24 Ultra
        Product product7 = new Product();
        product7.setName("Samsung Galaxy S24 Ultra");
        product7.setDescription("AI-powered smartphone with S Pen, 200MP camera, 1TB storage");
        product7.setPrice(BigDecimal.valueOf(1299.99));
        product7.setImageUrl("https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop");
        productRepository.save(product7);
        
        // Product 8: Dell XPS 13
        Product product8 = new Product();
        product8.setName("Dell XPS 13");
        product8.setDescription("13.4-inch FHD+ laptop, Intel Core i7, 16GB RAM, 512GB SSD");
        product8.setPrice(BigDecimal.valueOf(1399.99));
        product8.setImageUrl("https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop");
        productRepository.save(product8);
        
        // Product 9: Nintendo Switch OLED
        Product product9 = new Product();
        product9.setName("Nintendo Switch OLED");
        product9.setDescription("7-inch OLED screen, enhanced audio, 64GB internal storage");
        product9.setPrice(BigDecimal.valueOf(349.99));
        product9.setImageUrl("https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop");
        productRepository.save(product9);
        
        // Product 10: Bose QuietComfort 45
        Product product10 = new Product();
        product10.setName("Bose QuietComfort 45");
        product10.setDescription("Wireless Bluetooth headphones with world-class noise cancellation");
        product10.setPrice(BigDecimal.valueOf(329.99));
        product10.setImageUrl("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop");
        productRepository.save(product10);
    }
}
