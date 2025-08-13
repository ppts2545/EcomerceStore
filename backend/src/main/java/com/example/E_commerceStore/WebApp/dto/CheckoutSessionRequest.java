package com.example.E_commerceStore.WebApp.dto;

import java.util.List;

public class CheckoutSessionRequest {
    private List<CheckoutProductItem> products;
    private String successUrl;
    private String cancelUrl;

    // Constructors
    public CheckoutSessionRequest() {}

    public CheckoutSessionRequest(List<CheckoutProductItem> products, String successUrl, String cancelUrl) {
        this.products = products;
        this.successUrl = successUrl;
        this.cancelUrl = cancelUrl;
    }

    // Getters and setters
    public List<CheckoutProductItem> getProducts() {
        return products;
    }

    public void setProducts(List<CheckoutProductItem> products) {
        this.products = products;
    }

    public String getSuccessUrl() {
        return successUrl;
    }

    public void setSuccessUrl(String successUrl) {
        this.successUrl = successUrl;
    }

    public String getCancelUrl() {
        return cancelUrl;
    }

    public void setCancelUrl(String cancelUrl) {
        this.cancelUrl = cancelUrl;
    }

    // Inner class for checkout product items
    public static class CheckoutProductItem {
        private String id;
        private String name;
        private String description;
        private Long price; // Price in cents
        private Integer quantity;
        private String image;

        // Constructors
        public CheckoutProductItem() {}

        public CheckoutProductItem(String id, String name, String description, Long price, Integer quantity, String image) {
            this.id = id;
            this.name = name;
            this.description = description;
            this.price = price;
            this.quantity = quantity;
            this.image = image;
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

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public Long getPrice() {
            return price;
        }

        public void setPrice(Long price) {
            this.price = price;
        }

        public Integer getQuantity() {
            return quantity;
        }

        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
        }

        public String getImage() {
            return image;
        }

        public void setImage(String image) {
            this.image = image;
        }
    }
}
