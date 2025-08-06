package com.example.E_commerceStore.WebApp.service;

import com.example.E_commerceStore.WebApp.model.CartItem;
import com.example.E_commerceStore.WebApp.model.User;
import com.example.E_commerceStore.WebApp.model.Product;
import com.example.E_commerceStore.WebApp.repository.CartItemRepository;
import com.example.E_commerceStore.WebApp.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CartService {
    
    @Autowired
    private CartItemRepository cartItemRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    // เพิ่มสินค้าลงตะกร้า
    public CartItem addToCart(User user, Long productId, Integer quantity) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found: " + productId));
        
        // ตรวจสอบสต็อก
        if (product.getStock() < quantity) {
            throw new RuntimeException("Insufficient stock. Available: " + product.getStock() + ", Requested: " + quantity);
        }
        
        // ตรวจสอบว่ามีสินค้าอยู่ในตะกร้าแล้วหรือไม่
        Optional<CartItem> existingItem = cartItemRepository.findByUserAndProduct(user, product);
        
        if (existingItem.isPresent()) {
            // อัปเดตปริมาณ
            CartItem cartItem = existingItem.get();
            int newQuantity = cartItem.getQuantity() + quantity;
            
            if (product.getStock() < newQuantity) {
                throw new RuntimeException("Cannot add more items. Total would exceed available stock.");
            }
            
            cartItem.setQuantity(newQuantity);
            return cartItemRepository.save(cartItem);
        } else {
            // เพิ่มรายการใหม่
            CartItem cartItem = new CartItem(user, product, quantity);
            return cartItemRepository.save(cartItem);
        }
    }
    
    // อัปเดตปริมาณในตะกร้า
    public CartItem updateCartItem(User user, Long cartItemId, Integer quantity) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
            .orElseThrow(() -> new RuntimeException("Cart item not found: " + cartItemId));
        
        // ตรวจสอบว่าเป็นของผู้ใช้คนนี้
        if (!cartItem.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized access to cart item");
        }
        
        // ตรวจสอบสต็อก
        if (cartItem.getProduct().getStock() < quantity) {
            throw new RuntimeException("Insufficient stock. Available: " + cartItem.getProduct().getStock());
        }
        
        cartItem.setQuantity(quantity);
        return cartItemRepository.save(cartItem);
    }
    
    // ลบสินค้าออกจากตะกร้า
    public void removeFromCart(User user, Long cartItemId) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
            .orElseThrow(() -> new RuntimeException("Cart item not found: " + cartItemId));
        
        // ตรวจสอบว่าเป็นของผู้ใช้คนนี้
        if (!cartItem.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized access to cart item");
        }
        
        cartItemRepository.delete(cartItem);
    }
    
    // ดูตะกร้าของผู้ใช้
    public List<CartItem> getCartItems(User user) {
        return cartItemRepository.findByUser(user);
    }
    
    // นับจำนวนสินค้าในตะกร้า
    public Integer getCartItemCount(User user) {
        return cartItemRepository.getTotalQuantityByUserId(user.getId());
    }
    
    // คำนวณยอดรวมในตะกร้า
    public BigDecimal getCartTotal(User user) {
        List<CartItem> cartItems = cartItemRepository.findByUser(user);
        return cartItems.stream()
            .map(CartItem::getTotalPrice)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    
    // ล้างตะกร้า
    public void clearCart(User user) {
        cartItemRepository.deleteByUser(user);
    }
    
    // ตรวจสอบสต็อกทั้งหมดในตะกร้า
    public boolean validateCartStock(User user) {
        List<CartItem> cartItems = cartItemRepository.findByUser(user);
        return cartItems.stream().allMatch(CartItem::isValidQuantity);
    }
}
