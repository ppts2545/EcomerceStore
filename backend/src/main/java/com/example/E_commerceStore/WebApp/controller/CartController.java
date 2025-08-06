package com.example.E_commerceStore.WebApp.controller;

import com.example.E_commerceStore.WebApp.model.Cart;
import com.example.E_commerceStore.WebApp.model.CartItem;
import com.example.E_commerceStore.WebApp.model.Product;
import com.example.E_commerceStore.WebApp.model.User;
import com.example.E_commerceStore.WebApp.service.CartService;
import com.example.E_commerceStore.WebApp.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class CartController {
    
    @Autowired
    private CartService cartService;
    
    @Autowired
    private UserService userService;
    
    /**
     * เพิ่มสินค้าลงตะกร้า
     */
    @PostMapping("/add")
    public ResponseEntity<?> addToCart(@RequestBody AddToCartRequest request) {
        try {
            Optional<User> userOpt = userService.findById(request.getUserId());
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("User not found");
            }
            
            User user = userOpt.get();
            CartItem cartItem = cartService.addToCart(user, request.getProductId(), request.getQuantity());
            
            return ResponseEntity.ok(cartItem);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    /**
     * ดูตะกร้าของผู้ใช้ (พร้อมข้อมูลสรุป)
     */
    @GetMapping("/{userId}")
    public ResponseEntity<?> getCart(@PathVariable Long userId) {
        try {
            Optional<User> userOpt = userService.findById(userId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("User not found");
            }
            
            User user = userOpt.get();
            Cart cart = cartService.getUserCart(user);
            
            // สร้างข้อมูลสรุปตะกร้า
            Map<String, Object> cartSummary = new HashMap<>();
            cartSummary.put("cart", cart);
            cartSummary.put("items", cart.getCartItems());
            cartSummary.put("totalItems", cart.getTotalItems());
            cartSummary.put("totalAmount", cart.getTotalAmount());
            cartSummary.put("isEmpty", cart.isEmpty());
            
            return ResponseEntity.ok(cartSummary);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error retrieving cart: " + e.getMessage());
        }
    }
    
    /**
     * อัปเดตปริมาณสินค้าในตะกร้า
     */
    @PutMapping("/item/{cartItemId}")
    public ResponseEntity<?> updateCartItem(
            @PathVariable Long cartItemId,
            @RequestBody UpdateCartRequest request) {
        try {
            Optional<User> userOpt = userService.findById(request.getUserId());
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("User not found");
            }
            
            User user = userOpt.get();
            CartItem cartItem = cartService.updateCartItem(user, cartItemId, request.getQuantity());
            
            return ResponseEntity.ok(cartItem);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    /**
     * ลบสินค้าออกจากตะกร้า
     */
    @DeleteMapping("/item/{cartItemId}")
    public ResponseEntity<?> removeFromCart(
            @PathVariable Long cartItemId,
            @RequestParam Long userId) {
        try {
            Optional<User> userOpt = userService.findById(userId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("User not found");
            }
            
            User user = userOpt.get();
            cartService.removeFromCart(user, cartItemId);
            
            return ResponseEntity.ok("Item removed from cart successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    /**
     * ล้างตะกร้าทั้งหมด
     */
    @DeleteMapping("/{userId}")
    public ResponseEntity<?> clearCart(@PathVariable Long userId) {
        try {
            Optional<User> userOpt = userService.findById(userId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("User not found");
            }
            
            User user = userOpt.get();
            cartService.clearCart(user);
            
            return ResponseEntity.ok("Cart cleared successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    /**
     * นับจำนวนสินค้าในตะกร้า
     */
    @GetMapping("/{userId}/count")
    public ResponseEntity<Integer> getCartCount(@PathVariable Long userId) {
        try {
            Optional<User> userOpt = userService.findById(userId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            
            User user = userOpt.get();
            Cart cart = cartService.getUserCart(user);
            
            return ResponseEntity.ok(cart.getTotalItems());
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * รับสินค้าแนะนำสำหรับผู้ใช้
     */
    @GetMapping("/{userId}/recommendations")
    public ResponseEntity<List<Product>> getRecommendations(@PathVariable Long userId) {
        try {
            Optional<User> userOpt = userService.findById(userId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            
            User user = userOpt.get();
            List<Product> recommendations = cartService.getRecommendedProducts(user);
            
            return ResponseEntity.ok(recommendations);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * รับสินค้าที่ซื้อพร้อมกันบ่อย
     */
    @GetMapping("/frequently-bought-together/{productId}")
    public ResponseEntity<List<Product>> getFrequentlyBoughtTogether(@PathVariable Long productId) {
        try {
            List<Product> products = cartService.getFrequentlyBoughtTogether(productId);
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Request DTOs
    public static class AddToCartRequest {
        private Long userId;
        private Long productId;
        private Integer quantity;
        
        // Getters and Setters
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        
        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }
        
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
    }
    
    public static class UpdateCartRequest {
        private Long userId;
        private Integer quantity;
        
        // Getters and Setters
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
    }
}
