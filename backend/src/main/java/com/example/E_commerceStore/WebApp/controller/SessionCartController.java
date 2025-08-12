package com.example.E_commerceStore.WebApp.controller;

import com.example.E_commerceStore.WebApp.dto.CartItemDTO;
import com.example.E_commerceStore.WebApp.model.Cart;
import com.example.E_commerceStore.WebApp.model.CartItem;
import com.example.E_commerceStore.WebApp.model.User;
import com.example.E_commerceStore.WebApp.repository.UserRepository;
import com.example.E_commerceStore.WebApp.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 🛒 Session-based Cart Controller
 * ใช้ Session เพื่อระบุผู้ใช้แทนการส่ง userId ใน URL
 * เหมาะสำหรับระบบที่มี Authentication Session
 */
@RestController
@RequestMapping("/api/session-cart")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"}, allowCredentials = "true")
public class SessionCartController {
    
    @Autowired
    private CartService cartService;
    
    @Autowired
    private UserRepository userRepository;

    /**
     * 🛒 ดูตะกร้าของผู้ใช้ปัจจุบัน
     */
    @GetMapping
    public ResponseEntity<?> getCart(HttpSession session) {
        try {
            User user = getCurrentUser(session);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("กรุณาเข้าสู่ระบบก่อนใช้งานตะกร้า"));
            }
            
            Cart cart = cartService.getUserCart(user);
            List<CartItem> cartItems = cartService.getCartItems(user);
            
            // Convert to DTOs for frontend
            List<CartItemDTO> cartItemDTOs = cartItems.stream()
                .map(CartItemDTO::new)
                .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("items", cartItemDTOs);
            response.put("totalItems", cart.getTotalItems());
            response.put("totalAmount", cart.getTotalAmount());
            response.put("isEmpty", cart.isEmpty());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(createErrorResponse("เกิดข้อผิดพลาดในการดึงข้อมูลตะกร้า: " + e.getMessage()));
        }
    }

    /**
     * ➕ เพิ่มสินค้าลงตะกร้า
     */
    @PostMapping("/add")
    public ResponseEntity<?> addToCart(@RequestBody AddToCartRequest request, HttpSession session) {
        try {
            User user = getCurrentUser(session);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("กรุณาเข้าสู่ระบบก่อนเพิ่มสินค้าลงตะกร้า"));
            }
            
            CartItem cartItem = cartService.addToCart(user, request.getProductId(), request.getQuantity());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "เพิ่มสินค้าลงตะกร้าสำเร็จ");
            response.put("cartItem", cartItem);
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * 🔄 อัปเดตปริมาณสินค้าในตะกร้า
     */
    @PutMapping("/update/{cartItemId}")
    public ResponseEntity<?> updateCartItem(
            @PathVariable Long cartItemId,
            @RequestBody UpdateCartRequest request,
            HttpSession session) {
        try {
            User user = getCurrentUser(session);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("กรุณาเข้าสู่ระบบก่อนแก้ไขตะกร้า"));
            }
            
            CartItem cartItem = cartService.updateCartItem(user, cartItemId, request.getQuantity());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "อัปเดตจำนวนสินค้าสำเร็จ");
            response.put("cartItem", cartItem);
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * 🗑️ ลบสินค้าออกจากตะกร้า
     */
    @DeleteMapping("/remove/{cartItemId}")
    public ResponseEntity<?> removeFromCart(@PathVariable Long cartItemId, HttpSession session) {
        try {
            User user = getCurrentUser(session);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("กรุณาเข้าสู่ระบบก่อนลบสินค้าจากตะกร้า"));
            }
            
            cartService.removeFromCart(user, cartItemId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "ลบสินค้าจากตะกร้าสำเร็จ");
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * 🧹 ล้างตะกร้าทั้งหมด
     */
    @DeleteMapping("/clear")
    public ResponseEntity<?> clearCart(HttpSession session) {
        try {
            User user = getCurrentUser(session);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("กรุณาเข้าสู่ระบบก่อนล้างตะกร้า"));
            }
            
            cartService.clearCart(user);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "ล้างตะกร้าสำเร็จ");
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * 📊 นับจำนวนสินค้าในตะกร้า
     */
    @GetMapping("/count")
    public ResponseEntity<?> getCartCount(HttpSession session) {
        try {
            User user = getCurrentUser(session);
            if (user == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("count", 0);
                return ResponseEntity.ok(response);
            }
            
            Integer count = cartService.getCartItemCount(user);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("count", count != null ? count : 0);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(createErrorResponse("เกิดข้อผิดพลาดในการนับสินค้าในตะกร้า"));
        }
    }

    /**
     * 🛠️ Helper Methods
     */
    
    private User getCurrentUser(HttpSession session) {
        if (session == null) {
            System.out.println("🚨 Session is null!");
            return null;
        }
        
        String sessionId = session.getId();
        User user = (User) session.getAttribute("user");
        
        System.out.println("🔍 Session Debug:");
        System.out.println("  - Session ID: " + sessionId);
        System.out.println("  - User in session: " + (user != null ? user.getEmail() : "null"));
        System.out.println("  - Session attributes: " + java.util.Collections.list(session.getAttributeNames()));
        
        // ถ้าไม่มี user ใน session ลองหาจาก SecurityContext สำหรับ OAuth2
        if (user == null) {
            System.out.println("🔍 User not found in session, checking SecurityContext...");
            
            org.springframework.security.core.Authentication auth = 
                org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            
            if (auth != null && auth.isAuthenticated() && 
                auth instanceof org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken) {
                
                org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken oauth2Token = 
                    (org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken) auth;
                
                org.springframework.security.oauth2.core.user.OAuth2User oauth2User = oauth2Token.getPrincipal();
                String email = oauth2User.getAttribute("email");
                
                System.out.println("🔍 Found OAuth2 user in SecurityContext: " + email);
                
                if (email != null) {
                    // หา user จากฐานข้อมูลด้วย email
                    java.util.Optional<com.example.E_commerceStore.WebApp.model.User> userOptional = 
                        userRepository.findByEmail(email);
                    
                    if (userOptional.isPresent()) {
                        user = userOptional.get();
                        // เก็บ user ใน session สำหรับการใช้งานครั้งต่อไป
                        session.setAttribute("user", user);
                        System.out.println("✅ Found user from OAuth2 and stored in session: " + email);
                    }
                }
            }
        }
        
        return user;
    }
    
    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", message);
        return response;
    }

    /**
     * 📝 Request DTOs
     */
    
    public static class AddToCartRequest {
        private Long productId;
        private Integer quantity = 1;
        
        // Getters and Setters
        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }
        
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
    }
    
    public static class UpdateCartRequest {
        private Integer quantity;
        
        // Getters and Setters
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
    }
}
