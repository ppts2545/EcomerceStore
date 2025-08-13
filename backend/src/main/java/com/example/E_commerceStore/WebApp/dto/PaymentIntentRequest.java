package com.example.E_commerceStore.WebApp.dto;

import java.util.List;

public class PaymentIntentRequest {
    private Long amount; // Amount in cents
    private String currency;
    private List<ProductItem> products;

    // Constructors
    public PaymentIntentRequest() {}

    public PaymentIntentRequest(Long amount, String currency, List<ProductItem> products) {
        this.amount = amount;
        this.currency = currency;
        this.products = products;
    }

    // Getters and setters
    public Long getAmount() {
        return amount;
    }

    public void setAmount(Long amount) {
        this.amount = amount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public List<ProductItem> getProducts() {
        return products;
    }

    public void setProducts(List<ProductItem> products) {
        this.products = products;
    }

    // Inner class for product items
    public static class ProductItem {
        private String id;
        private String name;
        private Integer quantity;
        private Long price; // Price in cents

        // Constructors
        public ProductItem() {}

        public ProductItem(String id, String name, Integer quantity, Long price) {
            this.id = id;
            this.name = name;
            this.quantity = quantity;
            this.price = price;
        }

        // Getters and setters
        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public Integer getQuantity() {
            return quantity;
        }

        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
        }

        public Long getPrice() {
            return price;
        }

        public void setPrice(Long price) {
            this.price = price;
        }
    }
}
