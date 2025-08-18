package com.example.E_commerceStore.WebApp.service;

import com.example.E_commerceStore.WebApp.model.Cart;
import com.example.E_commerceStore.WebApp.model.CartItem;
import com.example.E_commerceStore.WebApp.model.User;
import com.example.E_commerceStore.WebApp.model.Product;
import com.example.E_commerceStore.WebApp.repository.CartRepository;
import com.example.E_commerceStore.WebApp.repository.CartItemRepository;
import com.example.E_commerceStore.WebApp.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CartService {
    
    @Autowired
    private CartRepository cartRepository;
    
    @Autowired
    private CartItemRepository cartItemRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    /**
     * รับหรือสร้างตะกร้าสำหรับผู้ใช้
     */
    public Cart getOrCreateCart(User user) {
        Optional<Cart> existingCart = cartRepository.findByUser(user);
        if (existingCart.isPresent()) {
            return existingCart.get();
        }
        
        // สร้างตะกร้าใหม่
        Cart cart = new Cart(user);
        user.setCart(cart);
        return cartRepository.save(cart);
    }
    
    /**
     * เพิ่มสินค้าลงตะกร้า
     */
    public CartItem addToCart(User user, Long productId, Integer quantity) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found: " + productId));
        
        // ตรวจสอบสต็อก
        if (product.getStock() < quantity) {
            throw new RuntimeException("Insufficient stock. Available: " + product.getStock() + ", Requested: " + quantity);
        }
        
        // รับหรือสร้างตะกร้า
        Cart cart = getOrCreateCart(user);
        
        // ตรวจสอบว่ามีสินค้าอยู่ในตะกร้าแล้วหรือไม่
        CartItem existingItem = cart.findCartItemByProduct(product);
        
        if (existingItem != null) {
            // อัปเดตปริมาณ
            int newQuantity = existingItem.getQuantity() + quantity;
            
            if (product.getStock() < newQuantity) {
                throw new RuntimeException("Cannot add more items. Total would exceed available stock.");
            }
            
            existingItem.setQuantity(newQuantity);
            existingItem.setUpdatedAt(LocalDateTime.now());
            return cartItemRepository.save(existingItem);
        } else {
            // เพิ่มรายการใหม่
            CartItem cartItem = new CartItem(user, product, quantity);
            cartItem.setCart(cart);
            cart.addCartItem(cartItem);
            cartRepository.save(cart); // บันทึก cart จะบันทึก cartItem ด้วย
            return cartItem;
        }
    }
    
    /**
     * อัปเดตปริมาณในตะกร้า
     */
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
    
    /**
     * ล้างตะกร้า
     */
    public void clearCart(User user) {
        Cart cart = cartRepository.findByUser(user).orElse(null);
        if (cart != null) {
            cart.clearCart();
            cartRepository.save(cart);
        }
    }
    
    /**
     * ตรวจสอบสต็อกทั้งหมดในตะกร้า
     */
    public boolean validateCartStock(User user) {
        Cart cart = cartRepository.findByUser(user).orElse(null);
        if (cart == null || cart.isEmpty()) {
            return true;
        }
        return cart.getCartItems().stream().allMatch(CartItem::isValidQuantity);
    }
    
    /**
     * รับตะกร้าของผู้ใช้
     */
    public Cart getUserCart(User user) {
        return getOrCreateCart(user);
    }
    
    /**
     * รับรายการสินค้าแนะนำตามประวัติการซื้อ
     */
    public List<Product> getRecommendedProducts(User user) {
        // ดึง tag name ที่ผู้ใช้เคยซื้อ
        List<CartItem> cartItems = cartItemRepository.findByUser(user);
        if (cartItems.isEmpty()) {
            // ถ้าไม่มีประวัติ ให้แนะนำสินค้าขายดี
            return productRepository.findTop10ByOrderByCreatedAtDesc();
        }
        // รวม tag name ทั้งหมดที่เคยซื้อ
        List<String> purchasedTags = cartItems.stream()
            .flatMap(item -> item.getProduct().getTags().stream())
            .map(tag -> tag.getName())
            .distinct()
            .toList();
        // แนะนำสินค้าจาก tag ที่เคยซื้อ
        return productRepository.findTop10ByTagsNameInOrderByCreatedAtDesc(purchasedTags);
    }
    
    /**
     * รับสินค้าที่ซื้อพร้อมกันบ่อย (Frequently Bought Together)
     */
    public List<Product> getFrequentlyBoughtTogether(Long productId) {
    // สำหรับตอนนี้ ให้แนะนำสินค้าที่มี tag เดียวกัน (tag แรก)
    Product product = productRepository.findById(productId)
        .orElseThrow(() -> new RuntimeException("Product not found"));
    var tags = product.getTags();
    if (tags.isEmpty()) return List.of();
    String tagName = tags.iterator().next().getName();
    return productRepository.findTop5ByTagsNameAndIdNotOrderByCreatedAtDesc(tagName, productId);
    }
    
    /**
     * รับสินค้ายอดนิยมตามหมวดหมู่
     */
    // Removed getPopularProductsByCategory(String category) as Product now uses tags, not category.
}
