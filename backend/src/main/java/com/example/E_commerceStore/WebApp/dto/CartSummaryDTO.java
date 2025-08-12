package com.example.E_commerceStore.WebApp.dto;

import com.example.E_commerceStore.WebApp.model.CartItem;
import java.math.BigDecimal;
import java.util.List;

public class CartSummaryDTO {
    private Long cartId;
    private Long userId;
    private List<CartItem> items;
    private Integer totalItems;
    private BigDecimal totalAmount;
    private boolean isEmpty;
    
    // Constructors
    public CartSummaryDTO() {}
    
    public CartSummaryDTO(Long cartId, Long userId, List<CartItem> items, 
                         Integer totalItems, BigDecimal totalAmount, boolean isEmpty) {
        this.cartId = cartId;
        this.userId = userId;
        this.items = items;
        this.totalItems = totalItems;
        this.totalAmount = totalAmount;
        this.isEmpty = isEmpty;
    }
    
    // Getters and Setters
    public Long getCartId() { return cartId; }
    public void setCartId(Long cartId) { this.cartId = cartId; }
    
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    
    public List<CartItem> getItems() { return items; }
    public void setItems(List<CartItem> items) { this.items = items; }
    
    public Integer getTotalItems() { return totalItems; }
    public void setTotalItems(Integer totalItems) { this.totalItems = totalItems; }
    
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    
    public boolean isEmpty() { return isEmpty; }
    public void setEmpty(boolean empty) { isEmpty = empty; }
}
