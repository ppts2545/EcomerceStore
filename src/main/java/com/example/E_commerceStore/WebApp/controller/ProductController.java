package com.example.E_commerceStore.WebApp.controller;

import com.example.E_commerceStore.WebApp.model.Product;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {

    // Sample product data (in a real app, this would come from a database)
    private List<Product> products = Arrays.asList(
        new Product(1L, "Smartphone", "Latest Android smartphone with high-resolution camera", 699.99, "https://via.placeholder.com/300x200?text=Smartphone"),
        new Product(2L, "Laptop", "High-performance laptop for work and gaming", 1299.99, "https://via.placeholder.com/300x200?text=Laptop"),
        new Product(3L, "Headphones", "Wireless noise-canceling headphones", 199.99, "https://via.placeholder.com/300x200?text=Headphones"),
        new Product(4L, "Watch", "Smart fitness watch with health tracking", 299.99, "https://via.placeholder.com/300x200?text=Smart+Watch"),
        new Product(5L, "Tablet", "10-inch tablet perfect for reading and entertainment", 449.99, "https://via.placeholder.com/300x200?text=Tablet"),
        new Product(6L, "Camera", "Professional DSLR camera for photography", 899.99, "https://via.placeholder.com/300x200?text=Camera")
    );

    // GET /api/products - Get all products
    @GetMapping
    public List<Product> getAllProducts() {
        return products;
    }

    // GET /api/products/{id} - Get product by ID
    @GetMapping("/{id}")
    public Product getProductById(@PathVariable Long id) {
        Optional<Product> product = products.stream()
                .filter(p -> p.getId().equals(id))
                .findFirst();
        return product.orElse(null);
    }

    // GET /api/products/search?name=keyword - Search products by name
    @GetMapping("/search")
    public List<Product> searchProducts(@RequestParam String name) {
        return products.stream()
                .filter(p -> p.getName().toLowerCase().contains(name.toLowerCase()))
                .toList();
    }
}
