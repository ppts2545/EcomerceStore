package com.example.E_commerceStore.WebApp.controller;

import com.example.E_commerceStore.WebApp.model.Order;
import com.example.E_commerceStore.WebApp.model.User;
import com.example.E_commerceStore.WebApp.service.OrderService;
import com.example.E_commerceStore.WebApp.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import com.example.E_commerceStore.WebApp.dto.OrderDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"}, allowCredentials = "true")
public class OrderController {
    
    @Autowired
    private OrderService orderService;
    
    @Autowired
    private UserService userService;
    
    /**
     * Create order from cart
     */
    @PostMapping("/checkout")
    public ResponseEntity<?> createOrder(
            @RequestBody CheckoutRequest request,
            HttpSession session) {
        
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Please login to checkout"));
        }
        
        try {
            Order order = orderService.createOrderFromCart(
                userId, 
                request.getShippingAddress(), 
                request.getPhoneNumber()
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Order created successfully");
            response.put("orderId", order.getId());
            response.put("orderNumber", order.getOrderNumber());
            response.put("totalAmount", order.getTotalAmount());
            response.put("estimatedDelivery", order.getEstimatedDelivery());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Get order details
     */
    @GetMapping("/{orderId}")
    public ResponseEntity<?> getOrder(
            @PathVariable Long orderId,
            HttpSession session) {
        
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Authentication required"));
        }
        
        try {
            Order order = orderService.getOrderById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
            
            // Verify order belongs to user
            if (!order.getUserId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied"));
            }
            
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Get order by order number (for order success page)
     */
    @GetMapping("/number/{orderNumber}")
    public ResponseEntity<?> getOrderByNumber(
            @PathVariable String orderNumber,
            HttpSession session) {
        
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Authentication required"));
        }
        
        try {
            Order order = orderService.getOrderByOrderNumber(orderNumber)
                .orElseThrow(() -> new RuntimeException("Order not found"));
            
            // Verify order belongs to user
            if (!order.getUserId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied"));
            }
            
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Get user's orders
     */
    @GetMapping("/my-orders")
    public ResponseEntity<?> getUserOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpSession session) {
        String sessionId = session.getId();
        Long userId = (Long) session.getAttribute("userId");
        System.out.println("[OrderController] /my-orders sessionId=" + sessionId + ", userId=" + userId);
        if (userId == null) {
            System.out.println("[OrderController] /my-orders: userId is null, returning 401");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Authentication required"));
        }
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Order> orders = orderService.getUserOrders(userId, pageable);
            System.out.println("[OrderController] /my-orders: found " + orders.getTotalElements() + " orders for userId=" + userId);
            // Map to DTO for safe serialization
            Map<String, Object> result = new HashMap<>();
            result.put("content", orders.getContent().stream().map(OrderDTO::new).collect(java.util.stream.Collectors.toList()));
            result.put("totalElements", orders.getTotalElements());
            result.put("totalPages", orders.getTotalPages());
            result.put("page", orders.getNumber());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.out.println("[OrderController] /my-orders: exception: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Cancel order
     */
    @PutMapping("/{orderId}/cancel")
    public ResponseEntity<?> cancelOrder(
            @PathVariable Long orderId,
            HttpSession session) {
        
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Authentication required"));
        }
        
        try {
            Order order = orderService.cancelOrder(orderId, userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Order cancelled successfully");
            response.put("order", order);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Update order status (Admin only)
     */
    @PutMapping("/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> request,
            @AuthenticationPrincipal OAuth2User principal) {
        
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Authentication required"));
        }
        
        // Check if user is admin (implement your admin check logic)
        String email = principal.getAttribute("email");
        // For now, simple check - in production, check user role from database
        boolean isAdmin = email != null && email.contains("admin");
        
        if (!isAdmin) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("error", "Admin access required"));
        }
        
        try {
            String statusStr = request.get("status");
            Order.OrderStatus status = Order.OrderStatus.valueOf(statusStr);
            
            Order order = orderService.updateOrderStatus(orderId, status);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Order status updated successfully");
            response.put("order", order);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Check if user has purchased a product (for review eligibility)
     */
    @GetMapping("/check-purchase/{productId}")
    public ResponseEntity<?> checkProductPurchase(
            @PathVariable Long productId,
            HttpSession session) {
        
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Authentication required"));
        }
        
        try {
            boolean hasPurchased = orderService.hasUserPurchasedProduct(userId, productId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("hasPurchased", hasPurchased);
            response.put("canReview", hasPurchased);
            
            if (hasPurchased) {
                List<Order> orders = orderService.getUserOrdersForProduct(userId, productId);
                response.put("purchaseOrders", orders);
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * DTO for checkout request
     */
    public static class CheckoutRequest {
        private String shippingAddress;
        private String phoneNumber;
        
        public CheckoutRequest() {}
        
        public CheckoutRequest(String shippingAddress, String phoneNumber) {
            this.shippingAddress = shippingAddress;
            this.phoneNumber = phoneNumber;
        }
        
        // Getters and setters
        public String getShippingAddress() {
            return shippingAddress;
        }
        
        public void setShippingAddress(String shippingAddress) {
            this.shippingAddress = shippingAddress;
        }
        
        public String getPhoneNumber() {
            return phoneNumber;
        }
        
        public void setPhoneNumber(String phoneNumber) {
            this.phoneNumber = phoneNumber;
        }
    }
}
