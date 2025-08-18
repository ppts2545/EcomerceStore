package com.example.E_commerceStore.WebApp.dto;

import java.util.List;
import java.util.stream.Collectors;
import com.example.E_commerceStore.WebApp.model.Order;
import com.example.E_commerceStore.WebApp.model.OrderItem;
import com.example.E_commerceStore.WebApp.model.Product;

public class OrderDTO {
    public Long id;
    public String orderNumber;
    public String createdAt;
    public String status;
    public Double totalAmount;
    public String shippingAddress;
    public String phoneNumber;
    public List<OrderItemDTO> orderItems;

    public OrderDTO(Order order) {
        this.id = order.getId();
        this.orderNumber = order.getOrderNumber();
        this.createdAt = order.getCreatedAt() != null ? order.getCreatedAt().toString() : null;
        this.status = order.getStatus() != null ? order.getStatus().name() : null;
        this.totalAmount = order.getTotalAmount();
        this.shippingAddress = order.getShippingAddress();
        this.phoneNumber = order.getPhoneNumber();
        this.orderItems = order.getOrderItems() != null ? order.getOrderItems().stream().map(OrderItemDTO::new).collect(Collectors.toList()) : null;
    }

    public static class OrderItemDTO {
        public Long id;
        public ProductDTO product;
        public Integer quantity;
        public Double priceAtTime;
        public Double subtotal;

        public OrderItemDTO(OrderItem item) {
            this.id = item.getId();
            this.product = item.getProduct() != null ? new ProductDTO(item.getProduct()) : null;
            this.quantity = item.getQuantity();
            this.priceAtTime = item.getPriceAtTime();
            this.subtotal = item.getSubtotal();
        }
    }

    public static class ProductDTO {
        public Long id;
        public String name;
        public String imageUrl;
        public String description;

        public ProductDTO(Product p) {
            this.id = p.getId();
            this.name = p.getName();
            // Use first MediaItem's URL if available
            if (p.getMediaItems() != null && !p.getMediaItems().isEmpty()) {
                this.imageUrl = p.getMediaItems().get(0).getUrl();
            } else {
                this.imageUrl = null; // or a placeholder
            }
            this.description = p.getDescription();
        }
    }
}
