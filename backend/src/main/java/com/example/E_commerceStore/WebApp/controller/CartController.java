package com.example.E_commerceStore.WebApp.controller;

import com.example.E_commerceStore.WebApp.model.CartItem;
import com.example.E_commerceStore.WebApp.model.User;
import com.example.E_commerceStore.WebApp.service.CartService;
import com.example.E_commerceStore.WebApp.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "http://localhost:5174")
public class CartController {
    
    @Autowired
    private CartService cartService;
    
    @Autowired
    private UserService userService;
    
    // เพิ่มสินค้าลงตะกร้า
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
    
    // ดูตะกร้าของผู้ใช้
    @GetMapping("/{userId}")
    public ResponseEntity<?> getCart(@PathVariable Long userId) {
        Optional<User> userOpt = userService.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found");
        }
        
        User user = userOpt.get();
        List<CartItem> cartItems = cartService.getCartItems(user);
        
        CartResponse response = new CartResponse();
        response.setCartItems(cartItems);
        response.setTotalItems(cartService.getCartItemCount(user));
        response.setTotalAmount(cartService.getCartTotal(user));
        
        return ResponseEntity.ok(response);
    }
    
    // อัปเดตปริมาณในตะกร้า
    @PutMapping("/update/{cartItemId}")
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
    
    // ลบสินค้าออกจากตะกร้า
    @DeleteMapping("/remove/{cartItemId}")
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
            
            return ResponseEntity.ok("Item removed from cart");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // ล้างตะกร้า
    @DeleteMapping("/clear/{userId}")
    public ResponseEntity<?> clearCart(@PathVariable Long userId) {
        Optional<User> userOpt = userService.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found");
        }
        
        User user = userOpt.get();
        cartService.clearCart(user);
        
        return ResponseEntity.ok("Cart cleared");
    }
    
    // นับจำนวนสินค้าในตะกร้า
    @GetMapping("/count/{userId}")
    public ResponseEntity<Integer> getCartCount(@PathVariable Long userId) {
        Optional<User> userOpt = userService.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        User user = userOpt.get();
        Integer count = cartService.getCartItemCount(user);
        
        return ResponseEntity.ok(count != null ? count : 0);
    }
    
    // DTOs
    public static class AddToCartRequest {
        private Long userId;
        private Long productId;
        private Integer quantity;
        
        // Getters and setters
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
        
        // Getters and setters
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
    }
    
    public static class CartResponse {
        private List<CartItem> cartItems;
        private Integer totalItems;
        private BigDecimal totalAmount;
        
        // Getters and setters
        public List<CartItem> getCartItems() { return cartItems; }
        public void setCartItems(List<CartItem> cartItems) { this.cartItems = cartItems; }
        
        public Integer getTotalItems() { return totalItems; }
        public void setTotalItems(Integer totalItems) { this.totalItems = totalItems; }
        
        public BigDecimal getTotalAmount() { return totalAmount; }
        public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    }
}
