package com.example.E_commerceStore.WebApp.config;

import com.example.E_commerceStore.WebApp.model.Product;
import com.example.E_commerceStore.WebApp.model.User;
import com.example.E_commerceStore.WebApp.model.UserRole;
import com.example.E_commerceStore.WebApp.repository.ProductRepository;
import com.example.E_commerceStore.WebApp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component
public class SampleDataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // สร้างข้อมูลผู้ใช้ตัวอย่าง
        createSampleUsers();
        
        // สร้างข้อมูลสินค้าตัวอย่าง
        createSampleProducts();
        
        System.out.println("🎉 Sample data initialized successfully!");
    }

    private void createSampleUsers() {
        if (userRepository.count() == 0) {
            // สร้าง Admin user
            User admin = new User();
            admin.setEmail("admin@example.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setFirstName("Admin");
            admin.setLastName("User");
            admin.setRole(UserRole.ADMIN);
            admin.setCreatedAt(LocalDateTime.now());
            userRepository.save(admin);

            // สร้าง Customer user
            User customer = new User();
            customer.setEmail("customer@example.com");
            customer.setPassword(passwordEncoder.encode("customer123"));
            customer.setFirstName("John");
            customer.setLastName("Doe");
            customer.setRole(UserRole.CUSTOMER);
            customer.setCreatedAt(LocalDateTime.now());
            userRepository.save(customer);

            System.out.println("✅ Sample users created:");
            System.out.println("   - Admin: admin@example.com / admin123");
            System.out.println("   - Customer: customer@example.com / customer123");
        }
    }

    private void createSampleProducts() {
        if (productRepository.count() == 0) {
            // สินค้าหมวดอิเล็กทรอนิกส์
            createProduct("iPhone 15 Pro", "มือถือ Apple รุ่นล่าสุด", 
                         new BigDecimal("39900"), "https://example.com/iphone15.jpg", 
                         10, "อิเล็กทรอนิกส์");
            
            createProduct("Samsung Galaxy S24", "มือถือ Samsung flagship", 
                         new BigDecimal("29900"), "https://example.com/galaxy-s24.jpg", 
                         15, "อิเล็กทรอนิกส์");
            
            createProduct("MacBook Air M3", "แล็ปท็อป Apple ชิป M3", 
                         new BigDecimal("44900"), "https://example.com/macbook-air.jpg", 
                         5, "อิเล็กทรอนิกส์");

            // สินค้าหมวดแฟชั่น
            createProduct("เสื้อยืดผ้าฝ้าย", "เสื้อยืดผ้าฝ้าย 100% นุ่มสบาย", 
                         new BigDecimal("299"), "https://example.com/cotton-tshirt.jpg", 
                         50, "แฟชั่น");
            
            createProduct("กางเกงยีนส์", "กางเกงยีนส์คุณภาพดี ทรงสวย", 
                         new BigDecimal("890"), "https://example.com/jeans.jpg", 
                         30, "แฟชั่น");

            // สินค้าหมวดความงาม
            createProduct("ครีมบำรุงหน้า", "ครีมบำรุงผิวหน้า สำหรับผิวแห้ง", 
                         new BigDecimal("450"), "https://example.com/face-cream.jpg", 
                         25, "ความงาม");
            
            createProduct("ลิปสติก", "ลิปสติกสีสวย เนื้อแมท", 
                         new BigDecimal("320"), "https://example.com/lipstick.jpg", 
                         40, "ความงาม");

            // สินค้าหมวดของใช้ในบ้าน
            createProduct("หม้อข้าวไฟฟ้า", "หม้อข้าวไฟฟ้า 1.8 ลิตร", 
                         new BigDecimal("1890"), "https://example.com/rice-cooker.jpg", 
                         12, "ของใช้ในบ้าน");
            
            createProduct("เครื่องปั่นน้ำผลไม้", "เครื่องปั่นน้ำผลไม้ ขนาด 1.5 ลิตร", 
                         new BigDecimal("2490"), "https://example.com/blender.jpg", 
                         8, "ของใช้ในบ้าน");

            // สินค้าหมวดหนังสือ
            createProduct("หนังสือการเขียนโปรแกรม", "เรียนรู้การเขียนโปรแกรม Java", 
                         new BigDecimal("590"), "https://example.com/java-book.jpg", 
                         20, "หนังสือ");

            System.out.println("✅ Sample products created: 10 products in 5 categories");
        }
    }

    private void createProduct(String name, String description, BigDecimal price, 
                              String imageUrl, Integer stock, String category) {
        Product product = new Product();
        product.setName(name);
        product.setDescription(description);
        product.setPrice(price);
        product.setImageUrl(imageUrl);
        product.setStock(stock);
        product.setCategory(category);
        product.setCreatedAt(LocalDateTime.now());
        product.setUpdatedAt(LocalDateTime.now());
        productRepository.save(product);
    }
}
