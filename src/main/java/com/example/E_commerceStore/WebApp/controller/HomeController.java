package com.example.E_commerceStore.WebApp.controller;

import com.example.E_commerceStore.WebApp.model.Product;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.Arrays;
import java.util.List;

@Controller
public class HomeController {

    @GetMapping("/")
    public String home(Model model) {
        // Sample products for the e-commerce store (Shopee-style)
        List<Product> products = Arrays.asList(
            createProduct(1L, "iPhone 15 Pro Max", "Latest iPhone with A17 Pro chip, 256GB storage", 1199.99, 10),
            createProduct(2L, "MacBook Air M2", "13-inch laptop with M2 chip, 8GB RAM, 256GB SSD", 1099.99, 5),
            createProduct(3L, "AirPods Pro 2", "Active Noise Cancellation, Spatial Audio", 249.99, 25),
            createProduct(4L, "Apple Watch Series 9", "GPS + Cellular, 45mm, Health monitoring", 429.99, 15),
            createProduct(5L, "iPad Air", "10.9-inch Liquid Retina display, A14 Bionic chip", 599.99, 8),
            createProduct(6L, "Sony Camera α7 IV", "33MP Full-Frame Mirrorless Camera", 2499.99, 3),
            createProduct(7L, "Gaming Mouse", "RGB Wireless Gaming Mouse, 16000 DPI", 79.99, 50),
            createProduct(8L, "Mechanical Keyboard", "RGB Backlit Mechanical Gaming Keyboard", 129.99, 30),
            createProduct(9L, "4K Monitor", "27-inch 4K UHD IPS Monitor, 144Hz", 349.99, 12),
            createProduct(10L, "Bluetooth Speaker", "Portable Waterproof Wireless Speaker", 99.99, 20),
            createProduct(11L, "Power Bank", "20000mAh Fast Charging Power Bank", 39.99, 40),
            createProduct(12L, "Wireless Charger", "15W Fast Wireless Charging Pad", 29.99, 35)
        );
        
        model.addAttribute("products", products);
        model.addAttribute("storeName", "ShoppeeClone - Electronics Paradise");
        return "home";
    }

    @GetMapping("/about")
    public String about() {
        return "about";
    }

    @GetMapping("/contact")
    public String contact() {
        return "contact";
    }
    
    private Product createProduct(Long id, String name, String description, Double price, Integer stock) {
        Product product = new Product();
        product.setId(id);
        product.setName(name);
        product.setDescription(description);
        product.setPrice(java.math.BigDecimal.valueOf(price));
        product.setStock(stock);
        return product;
    }
}
