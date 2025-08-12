package com.example.E_commerceStore.WebApp.controller;

import com.example.E_commerceStore.WebApp.model.User;
import com.example.E_commerceStore.WebApp.service.CartService;
import com.example.E_commerceStore.WebApp.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class TestController {
    
    @Autowired
    private CartService cartService;
    
    @Autowired
    private UserService userService;
    
    /**
     * ทดสอบระบบตะกร้า - สร้างตะกร้าให้ผู้ใช้
     */
    @PostMapping("/create-cart/{userId}")
    public ResponseEntity<?> createCartForUser(@PathVariable Long userId) {
        try {
            var userOpt = userService.findById(userId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("User not found");
            }
            
            User user = userOpt.get();
            var cart = cartService.getOrCreateCart(user);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Cart created successfully");
            response.put("cartId", cart.getId());
            response.put("userId", user.getId());
            response.put("userEmail", user.getEmail());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating cart: " + e.getMessage());
        }
    }
    
    /**
     * ทดสอบการเพิ่มสินค้าตัวอย่างลงตะกร้า
     */
    @PostMapping("/add-sample-item/{userId}")
    public ResponseEntity<?> addSampleItemToCart(@PathVariable Long userId) {
        try {
            var userOpt = userService.findById(userId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("User not found");
            }
            
            // สร้างสินค้าตัวอย่าง (สมมติว่าสินค้า ID 1 มีอยู่)
            User user = userOpt.get();
            var cartItem = cartService.addToCart(user, 1L, 2);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Sample item added to cart");
            response.put("cartItem", cartItem);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error adding sample item: " + e.getMessage());
        }
    }
    
    /**
     * ข้อมูลสถานะของระบบ Cart
     */
    @GetMapping("/cart-status")
    public ResponseEntity<?> getCartSystemStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("cartServiceActive", true);
        status.put("message", "Cart system is running");
        status.put("features", new String[]{
            "✅ User-Cart relationship",
            "✅ Add/Remove items",
            "✅ Cart persistence",
            "✅ Product recommendations",
            "✅ Stock validation",
            "✅ Cart summary calculations"
        });
        
        return ResponseEntity.ok(status);
    }
}
