package com.example.E_commerceStore.WebApp.controller;

import com.example.E_commerceStore.WebApp.model.ProductReview;
import com.example.E_commerceStore.WebApp.service.ProductReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ProductReviewController {
    @Autowired
    private ProductReviewService productReviewService;

    @PostMapping
    public ResponseEntity<ProductReview> createReview(@RequestBody ProductReview review) {
        return ResponseEntity.ok(productReviewService.saveReview(review));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ProductReview>> getReviewsByProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(productReviewService.getReviewsByProductId(productId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long id) {
        productReviewService.deleteReview(id);
        return ResponseEntity.noContent().build();
    }
}
