package com.example.E_commerceStore.WebApp.controller;

import com.example.E_commerceStore.WebApp.model.*;
import com.example.E_commerceStore.WebApp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/sample")
@CrossOrigin(origins = "http://localhost:5174")
public class SampleDataController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CommentRepository commentRepository;

    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @PostMapping("/create-reviews")
    public String createSampleReviews() {
        try {
            // Get existing products
            List<Product> products = productRepository.findAll();
            if (products.isEmpty()) {
                return "No products found. Please add some products first.";
            }

            // Create sample users if they don't exist
            User user1 = createSampleUser("reviewer1@example.com", "สมชาย", "ใจดี");
            User user2 = createSampleUser("reviewer2@example.com", "สมหญิง", "รักสวย");
            User user3 = createSampleUser("reviewer3@example.com", "วิชัย", "สุขใส");

            // Create sample reviews for the first product
            Product firstProduct = products.get(0);
            
            // Create new sample reviews
            Comment comment1 = new Comment(user1, firstProduct, "สินค้าดีมาก คุณภาพเยี่ยม ส่งเร็วมากค่ะ แนะนำเลย!", 5);
            comment1.setCreatedAt(LocalDateTime.now().minusDays(5));
            commentRepository.save(comment1);

            Comment comment2 = new Comment(user2, firstProduct, "ผ้านิ่มสบาย ใส่แล้วสวย ราคาสมเหตุสมผล คุ้มค่าเงินมาก", 4);
            comment2.setCreatedAt(LocalDateTime.now().minusDays(3));
            commentRepository.save(comment2);

            Comment comment3 = new Comment(user3, firstProduct, "ดีค่ะ แต่สีจริงอาจจะต่างจากรูปนิดหน่อย โดยรวมโอเคครับ", 4);
            comment3.setCreatedAt(LocalDateTime.now().minusDays(1));
            commentRepository.save(comment3);

            return "✅ สร้างรีวิวตัวอย่างสำเร็จแล้ว! สร้างรีวิวให้กับสินค้า: " + firstProduct.getName();
        } catch (Exception e) {
            e.printStackTrace();
            return "❌ เกิดข้อผิดพลาดในการสร้างข้อมูลตัวอย่าง: " + e.getMessage();
        }
    }

    private User createSampleUser(String email, String firstName, String lastName) {
        Optional<User> existingUser = userRepository.findByEmail(email);
        if (existingUser.isPresent()) {
            return existingUser.get();
        }

        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode("password123"));
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setRole(UserRole.CUSTOMER);
        user.setCreatedAt(LocalDateTime.now());
        
        return userRepository.save(user);
    }

    @DeleteMapping("/clear-reviews")
    public String clearSampleReviews() {
        try {
            // Delete all comments
            commentRepository.deleteAll();
            return "✅ ลบรีวิวทั้งหมดสำเร็จแล้ว!";
        } catch (Exception e) {
            return "❌ เกิดข้อผิดพลาดในการลบรีวิว: " + e.getMessage();
        }
    }

    @GetMapping("/status")
    public String getStatus() {
        try {
            long productCount = productRepository.count();
            long commentCount = commentRepository.count();
            long userCount = userRepository.count();
            
            return String.format("📊 สถานะข้อมูล: สินค้า %d รายการ, รีวิว %d รีวิว, ผู้ใช้ %d คน", 
                productCount, commentCount, userCount);
        } catch (Exception e) {
            return "❌ เกิดข้อผิดพลาดในการตรวจสอบสถานะ: " + e.getMessage();
        }
    }
}
