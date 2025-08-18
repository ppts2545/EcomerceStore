package com.example.E_commerceStore.WebApp.dto;

import com.example.E_commerceStore.WebApp.model.CartItem;
import java.math.BigDecimal;

public class CartItemDTO {
    private Long id;
    private Long productId;
    private String productName;
    private String productImageUrl;
    private BigDecimal price;
    private Integer quantity;
    private Integer stock;
    private String description;
    private BigDecimal totalPrice;

    // Constructor from CartItem entity
    public CartItemDTO(CartItem cartItem) {
        this.id = cartItem.getId();
        this.productId = cartItem.getProduct().getId();
        this.productName = cartItem.getProduct().getName();
        // Use first MediaItem's URL if available
        if (cartItem.getProduct().getMediaItems() != null && !cartItem.getProduct().getMediaItems().isEmpty()) {
            this.productImageUrl = cartItem.getProduct().getMediaItems().get(0).getUrl();
        } else {
            this.productImageUrl = null; // or a placeholder
        }
        this.price = cartItem.getPriceAtTime();
        this.quantity = cartItem.getQuantity();
        this.stock = cartItem.getProduct().getStock();
        this.description = cartItem.getProduct().getDescription();
        this.totalPrice = cartItem.getPriceAtTime().multiply(BigDecimal.valueOf(cartItem.getQuantity()));
    }

    // Default constructor
    public CartItemDTO() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public String getProductImageUrl() { return productImageUrl; }
    public void setProductImageUrl(String productImageUrl) { this.productImageUrl = productImageUrl; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public Integer getStock() { return stock; }
    public void setStock(Integer stock) { this.stock = stock; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getTotalPrice() { return totalPrice; }
    public void setTotalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; }
}
