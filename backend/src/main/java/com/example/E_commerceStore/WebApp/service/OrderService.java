package com.example.E_commerceStore.WebApp.service;

import com.example.E_commerceStore.WebApp.model.Order;
import com.example.E_commerceStore.WebApp.model.OrderItem;
import com.example.E_commerceStore.WebApp.model.Product;
import com.example.E_commerceStore.WebApp.model.CartItem;
import com.example.E_commerceStore.WebApp.repository.OrderRepository;
import com.example.E_commerceStore.WebApp.repository.ProductRepository;
import com.example.E_commerceStore.WebApp.repository.CartItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class OrderService {
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private CartItemRepository cartItemRepository;
    
    /**
     * Create order from cart items
     */
    @Transactional
    public Order createOrderFromCart(Long userId, String shippingAddress, String phoneNumber) {
        // Get user's cart items
        List<CartItem> cartItems = cartItemRepository.findByUserId(userId);
        
        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }
        
        // Calculate total amount
        double totalAmount = cartItems.stream()
            .mapToDouble(item -> item.getQuantity() * item.getProduct().getPrice().doubleValue())
            .sum();
        
        // Create order
        Order order = new Order(userId, totalAmount, shippingAddress, phoneNumber);
        
        // Create order items from cart items
        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();
            
            // Check stock availability
            if (product.getStock() < cartItem.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName());
            }
            
            // Create order item
            OrderItem orderItem = new OrderItem(
                order, 
                product, 
                cartItem.getQuantity(), 
                product.getPrice().doubleValue()
            );
            
            order.addOrderItem(orderItem);
            
            // Update product stock
            product.setStock(product.getStock() - cartItem.getQuantity());
            productRepository.save(product);
        }
        
        // Save order
        order = orderRepository.save(order);
        
        // Clear cart
        List<CartItem> userCartItems = cartItemRepository.findByUserId(userId);
        cartItemRepository.deleteAll(userCartItems);
        
        return order;
    }
    
    /**
     * Get order by ID
     */
    public Optional<Order> getOrderById(Long orderId) {
        return orderRepository.findById(orderId);
    }
    
    /**
     * Get order by order number
     */
    public Optional<Order> getOrderByOrderNumber(String orderNumber) {
        return orderRepository.findByOrderNumber(orderNumber);
    }
    
    /**
     * Get user's orders with pagination
     */
    public Page<Order> getUserOrders(Long userId, Pageable pageable) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }
    
    /**
     * Get all user's orders
     */
    public List<Order> getAllUserOrders(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
    
    /**
     * Update order status
     */
    @Transactional
    public Order updateOrderStatus(Long orderId, Order.OrderStatus status) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found"));
        
        order.setStatus(status);
        return orderRepository.save(order);
    }
    
    /**
     * Check if user has purchased a product (for review eligibility)
     */
    public boolean hasUserPurchasedProduct(Long userId, Long productId) {
        return orderRepository.hasUserPurchasedProduct(userId, productId);
    }
    
    /**
     * Get user's orders for a specific product
     */
    public List<Order> getUserOrdersForProduct(Long userId, Long productId) {
        return orderRepository.findUserOrdersForProduct(userId, productId);
    }
    
    /**
     * Get orders by status
     */
    public List<Order> getOrdersByStatus(Order.OrderStatus status) {
        return orderRepository.findByStatus(status);
    }
    
    /**
     * Count user's orders
     */
    public long countUserOrders(Long userId) {
        return orderRepository.countByUserId(userId);
    }
    
    /**
     * Cancel order
     */
    @Transactional
    public Order cancelOrder(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found"));
        
        // Verify order belongs to user
        if (!order.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized to cancel this order");
        }
        
        // Only allow cancellation if order is still pending or confirmed
        if (order.getStatus() == Order.OrderStatus.PROCESSING || 
            order.getStatus() == Order.OrderStatus.SHIPPED ||
            order.getStatus() == Order.OrderStatus.DELIVERED) {
            throw new RuntimeException("Cannot cancel order at current status: " + order.getStatus().getDisplayName());
        }
        
        // Restore product stock
        for (OrderItem orderItem : order.getOrderItems()) {
            Product product = orderItem.getProduct();
            product.setStock(product.getStock() + orderItem.getQuantity());
            productRepository.save(product);
        }
        
        // Update order status
        order.setStatus(Order.OrderStatus.CANCELLED);
        return orderRepository.save(order);
    }
}
